import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ImageService } from '@/lib/services/image-service';
import { IMAGE_DIR } from '@/config';
import { validateFileSecurity } from '@/lib/file-utils';
import type { ImageServeOptions } from '@/types/image';

/**
 * 获取图片的API路由
 * 支持动态图片处理参数：
 * - w: 宽度
 * - h: 高度
 * - q: 质量 (1-100)
 * - f: 格式 (jpeg|png|webp|avif)
 * - fit: 适应方式 (cover|contain|fill|inside|outside)
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
        const options: ImageServeOptions = {};

        // 宽度参数
        const width = searchParams.get('w');
        if (width) {
            const w = parseInt(width);
            if (!isNaN(w) && w > 0 && w <= 4096) {
                options.w = w;
            }
        }

        // 高度参数
        const height = searchParams.get('h');
        if (height) {
            const h = parseInt(height);
            if (!isNaN(h) && h > 0 && h <= 4096) {
                options.h = h;
            }
        }

        // 质量参数
        const quality = searchParams.get('q');
        if (quality) {
            const q = parseInt(quality);
            if (!isNaN(q) && q >= 1 && q <= 100) {
                options.q = q;
            }
        }

        // 格式参数
        const format = searchParams.get('f');
        if (format && ['jpeg', 'png', 'webp', 'avif'].includes(format)) {
            options.f = format as 'jpeg' | 'png' | 'webp' | 'avif';
        }

        // 适应方式参数
        const fit = searchParams.get('fit');
        if (fit && ['cover', 'contain', 'fill', 'inside', 'outside'].includes(fit)) {
            options.fit = fit as 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
        }

        // 获取图片元信息
        const imageInfo = await ImageService.getImageInfo(filename);
        if (!imageInfo) {
            return NextResponse.json(
                { error: '图片不存在' },
                { status: 404 }
            );
        }

        // 检查是否需要处理图片
        const needsProcessing = options.w || options.h || options.q || options.f || options.fit;

        let imageBuffer: Buffer;
        let contentType: string;

        if (needsProcessing && imageInfo.mimeType !== 'image/svg') {
            // 需要处理的图片（非SVG）
            try {
                imageBuffer = await ImageService.processImage(filename, {
                    width: options.w,
                    height: options.h,
                    quality: options.q || 85,
                    format: options.f || 'jpeg',
                    fit: options.fit || 'cover'
                });

                // 设置处理后的内容类型
                const outputFormat = options.f || 'jpeg';
                contentType = `image/${outputFormat}`;
            } catch (error) {
                console.error('图片处理失败:', error);
                return NextResponse.json(
                    { error: '图片处理失败' },
                    { status: 500 }
                );
            }
        } else {
            // 直接返回原图或SVG
            try {
                const filePath = path.join(IMAGE_DIR, filename);
                imageBuffer = await fs.readFile(filePath);
                contentType = imageInfo.mimeType;
            } catch (error) {
                console.error('读取图片文件失败:', error);
                return NextResponse.json(
                    { error: '读取图片文件失败' },
                    { status: 500 }
                );
            }
        }

        // 设置缓存头
        const headers = new Headers({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable', // 1年缓存
            'ETag': `"${imageInfo.filename}-${imageInfo.size}"`,
            'Last-Modified': new Date(imageInfo.uploadedAt).toUTCString(),
        });

        // 检查 If-None-Match 头（ETag缓存）
        const ifNoneMatch = request.headers.get('if-none-match');
        if (ifNoneMatch && ifNoneMatch.includes(`"${imageInfo.filename}-${imageInfo.size}"`)) {
            return new NextResponse(null, { status: 304, headers });
        }

        // 检查 If-Modified-Since 头
        const ifModifiedSince = request.headers.get('if-modified-since');
        if (ifModifiedSince) {
            const modifiedTime = new Date(imageInfo.uploadedAt).getTime();
            const requestTime = new Date(ifModifiedSince).getTime();
            if (modifiedTime <= requestTime) {
                return new NextResponse(null, { status: 304, headers });
            }
        }

        return new NextResponse(imageBuffer as BodyInit, { headers });

    } catch (error) {
        console.error('获取图片时发生错误:', error);
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}

/**
 * 获取图片元信息的API
 * 返回图片的详细信息，不返回图片内容
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

        // 获取图片元信息
        const imageInfo = await ImageService.getImageInfo(filename);
        if (!imageInfo) {
            return new NextResponse(null, { status: 404 });
        }

        // 返回头信息
        const headers = new Headers({
            'Content-Type': imageInfo.mimeType,
            'Content-Length': imageInfo.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'ETag': `"${imageInfo.filename}-${imageInfo.size}"`,
            'Last-Modified': new Date(imageInfo.uploadedAt).toUTCString(),
            'X-Image-Width': imageInfo.width.toString(),
            'X-Image-Height': imageInfo.height.toString(),
        });

        return new NextResponse(null, { headers });

    } catch (error) {
        console.error('获取图片元信息时发生错误:', error);
        return new NextResponse(null, { status: 500 });
    }
}