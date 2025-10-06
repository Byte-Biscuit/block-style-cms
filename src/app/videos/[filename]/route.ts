import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import { VideoService } from '@/lib/services/video-service';
import { VIDEO_DIR } from '@/config';
import { validateFileSecurity } from '@/lib/file-utils';
import type { VideoServeOptions } from '@/types/video';

/**
 * 获取视频的API路由
 * 支持动态视频处理参数：
 * - q: 质量 (low|medium|high|original)
 * - f: 格式 (mp4|webm)
 * - t: 开始时间（秒）
 * - d: 持续时间（秒）
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        const validation = validateFileSecurity(filename);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // 解析查询参数
        const { searchParams } = new URL(request.url);
        const options: VideoServeOptions = {};

        // 质量参数
        const quality = searchParams.get('q');
        if (quality && ['low', 'medium', 'high', 'original'].includes(quality)) {
            options.q = quality as 'low' | 'medium' | 'high' | 'original';
        }

        // 格式参数
        const format = searchParams.get('f');
        if (format && ['mp4', 'webm'].includes(format)) {
            options.f = format as 'mp4' | 'webm';
        }

        // 开始时间参数
        const startTime = searchParams.get('t');
        if (startTime) {
            const t = parseFloat(startTime);
            if (!isNaN(t) && t >= 0) {
                options.t = t;
            }
        }

        // 持续时间参数
        const duration = searchParams.get('d');
        if (duration) {
            const d = parseFloat(duration);
            if (!isNaN(d) && d > 0) {
                options.d = d;
            }
        }

        // 获取视频元信息
        const videoInfo = await VideoService.getVideoInfo(filename);
        if (!videoInfo) {
            return NextResponse.json(
                { error: '视频不存在' },
                { status: 404 }
            );
        }

        // 确定要返回的视频文件
        let targetFilename = filename;
        let contentType = videoInfo.mimeType;

        // 如果指定了质量且不是original，尝试找到对应的变体
        if (options.q && options.q !== 'original' && videoInfo.variants?.length) {
            const qualityMap: Record<string, string> = {
                'low': '480p',
                'medium': '720p',
                'high': '1080p'
            };

            const targetQuality = qualityMap[options.q];
            const variant = videoInfo.variants.find(v => v.quality === targetQuality);

            if (variant) {
                targetFilename = variant.filename;
                contentType = 'video/mp4'; // 变体通常是mp4格式
            }
        }

        // 如果指定了格式转换，这里可以扩展支持
        if (options.f && options.f !== path.extname(targetFilename).slice(1)) {
            // 注意：格式转换需要FFmpeg支持，当前返回原格式
            console.warn(`格式转换暂不支持: ${options.f}`);
        }

        // 验证视频文件是否存在
        const filePath = path.join(VIDEO_DIR, targetFilename);
        try {
            await fs.access(filePath);
        } catch (error) {
            console.error('视频文件不存在:', error);
            return NextResponse.json(
                { error: '视频文件不存在' },
                { status: 404 }
            );
        }

        // 处理Range请求（用于视频流）
        const range = request.headers.get('range');
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : videoInfo.size - 1;
            const chunksize = (end - start) + 1;

            // 使用流式读取替代 buffer.slice
            const stream = createReadStream(filePath, { start, end });

            const headers = new Headers({
                'Content-Range': `bytes ${start}-${end}/${videoInfo.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize.toString(),
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600', // 1小时缓存
            });

            // 将 Node.js stream 转换为 Web Stream
            const webStream = new ReadableStream({
                start(controller) {
                    let isClosed = false;

                    stream.on('data', (chunk) => {
                        if (!isClosed) {
                            try {
                                controller.enqueue(new Uint8Array(chunk instanceof Buffer ? chunk : Buffer.from(chunk)));
                            } catch {
                                if (!isClosed) {
                                    isClosed = true;
                                    stream.destroy();
                                }
                            }
                        }
                    });

                    stream.on('end', () => {
                        if (!isClosed) {
                            isClosed = true;
                            try {
                                controller.close();
                            } catch {
                                // Controller 可能已经关闭，忽略错误
                            }
                        }
                    });

                    stream.on('error', (error) => {
                        if (!isClosed) {
                            isClosed = true;
                            try {
                                controller.error(error);
                            } catch {
                                // Controller 可能已经关闭，忽略错误
                            }
                        }
                    });
                },
                cancel() {
                    // 当客户端取消请求时清理资源
                    stream.destroy();
                }
            });

            return new NextResponse(webStream, {
                status: 206, // Partial Content
                headers
            });
        }

        // 设置缓存头
        const headers = new Headers({
            'Content-Type': contentType,
            'Content-Length': videoInfo.size.toString(),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600', // 1小时缓存
            'ETag': `"${videoInfo.filename}-${videoInfo.size}"`,
            'Last-Modified': new Date(videoInfo.uploadedAt).toUTCString(),
        });

        // 检查 If-None-Match 头（ETag缓存）
        const ifNoneMatch = request.headers.get('if-none-match');
        if (ifNoneMatch && ifNoneMatch.includes(`"${videoInfo.filename}-${videoInfo.size}"`)) {
            return new NextResponse(null, { status: 304, headers });
        }

        // 检查 If-Modified-Since 头
        const ifModifiedSince = request.headers.get('if-modified-since');
        if (ifModifiedSince) {
            const modifiedTime = new Date(videoInfo.uploadedAt).getTime();
            const requestTime = new Date(ifModifiedSince).getTime();
            if (modifiedTime <= requestTime) {
                return new NextResponse(null, { status: 304, headers });
            }
        }

        // 对于完整文件请求也使用流式处理
        const stream = createReadStream(filePath);

        const webStream = new ReadableStream({
            start(controller) {
                let isClosed = false;

                stream.on('data', (chunk) => {
                    if (!isClosed) {
                        try {
                            controller.enqueue(new Uint8Array(chunk instanceof Buffer ? chunk : Buffer.from(chunk)));
                        } catch {
                            if (!isClosed) {
                                isClosed = true;
                                stream.destroy();
                            }
                        }
                    }
                });

                stream.on('end', () => {
                    if (!isClosed) {
                        isClosed = true;
                        try {
                            controller.close();
                        } catch {
                            // Controller 可能已经关闭，忽略错误
                        }
                    }
                });

                stream.on('error', (error) => {
                    if (!isClosed) {
                        isClosed = true;
                        try {
                            controller.error(error);
                        } catch {
                            // Controller 可能已经关闭，忽略错误
                        }
                    }
                });
            },
            cancel() {
                // 当客户端取消请求时清理资源
                stream.destroy();
            }
        });

        return new NextResponse(webStream, { headers });

    } catch (error) {
        console.error('获取视频时发生错误:', error);
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}

/**
 * 获取视频元信息的API
 * 返回视频的详细信息，不返回视频内容
 */
export async function HEAD(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        if (!filename) {
            return new NextResponse(null, { status: 400 });
        }

        // 获取视频元信息
        const videoInfo = await VideoService.getVideoInfo(filename);
        if (!videoInfo) {
            return new NextResponse(null, { status: 404 });
        }

        // 返回头信息
        const headers = new Headers({
            'Content-Type': videoInfo.mimeType,
            'Content-Length': videoInfo.size.toString(),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600',
            'ETag': `"${videoInfo.filename}-${videoInfo.size}"`,
            'Last-Modified': new Date(videoInfo.uploadedAt).toUTCString(),
            'X-Video-Width': videoInfo.width.toString(),
            'X-Video-Height': videoInfo.height.toString(),
            'X-Video-Duration': videoInfo.duration.toString(),
        });

        // 添加可选的视频信息头
        if (videoInfo.bitrate !== undefined) {
            headers.set('X-Video-Bitrate', videoInfo.bitrate.toString());
        }
        if (videoInfo.framerate !== undefined) {
            headers.set('X-Video-Framerate', videoInfo.framerate.toString());
        }
        if (videoInfo.codec) {
            headers.set('X-Video-Codec', videoInfo.codec);
        }

        return new NextResponse(null, { headers });

    } catch (error) {
        console.error('获取视频元信息时发生错误:', error);
        return new NextResponse(null, { status: 500 });
    }
}
