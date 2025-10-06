import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AUDIO_DIR, FILE_EXTENSIONS } from '@/config';
import { validateFileSecurity, getFileMimeType, } from '@/lib/file-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const { filename } = await params;

        const validation = validateFileSecurity(filename, {
            allowedExtensions: [...FILE_EXTENSIONS.AUDIO],
            baseDirectory: AUDIO_DIR
        });

        if (!validation.isValid) {
            return new NextResponse(validation.error, { status: 400 });
        }

        // 构建文件路径
        const filePath = path.join(AUDIO_DIR, filename);

        // 检查文件是否存在并获取文件信息
        let stats;
        try {
            stats = await fs.stat(filePath);
        } catch {
            return new NextResponse('音频文件不存在', { status: 404 });
        }

        // 读取文件
        const fileBuffer = await fs.readFile(filePath);

        // 使用公共方法获取 MIME 类型
        const mimeType = getFileMimeType(filename);

        // 设置响应头
        const headers = new Headers();
        headers.set('Content-Type', mimeType);
        headers.set('Content-Length', stats.size.toString());
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Accept-Ranges', 'bytes');

        // 支持部分内容请求（用于音频播放器的快进等功能）
        const range = request.headers.get('range');
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
            const chunksize = (end - start) + 1;
            const chunk = fileBuffer.slice(start, end + 1);

            headers.set('Content-Range', `bytes ${start}-${end}/${stats.size}`);
            headers.set('Content-Length', chunksize.toString());

            return new NextResponse(chunk, {
                status: 206,
                headers,
            });
        }

        return new NextResponse(fileBuffer as BodyInit, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('音频文件服务错误:', error);
        return new NextResponse('服务器内部错误', { status: 500 });
    }
}
