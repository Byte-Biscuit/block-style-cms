import { NextRequest } from 'next/server';
import { z } from 'zod';
import { VideoService } from '@/lib/services/video-service';
import { success, failure, badRequest } from '@/lib/response';
import { withTiming } from '@/lib/with-timing';

/**
 * 视频上传请求验证
 */
const uploadVideoSchema = z.object({
    file: z.instanceof(File),
    originalName: z.string().optional(),
    generateThumbnail: z.boolean().optional().default(true),
    thumbnailTime: z.number().optional().default(1),
    enableCompression: z.boolean().optional().default(false),
    maxResolution: z.enum(['480p', '720p', '1080p', 'original']).optional().default('original'),
});

/**
 * 视频列表查询验证
 */
const videoListSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['uploadedAt', 'size', 'filename', 'duration']).default('uploadedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    searchTerm: z.string().optional(),
    processedOnly: z.coerce.boolean().optional().default(false),
});

/**
 * POST /api/m/videos - 上传视频
 */
export const POST = withTiming(async (request: NextRequest) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return badRequest('File not found');
        }

        // 解析可选参数
        const options = {
            originalName: formData.get('originalName') as string || undefined,
            generateThumbnail: formData.get('generateThumbnail') === 'true',
            thumbnailTime: formData.get('thumbnailTime') ?
                parseFloat(formData.get('thumbnailTime') as string) : 1,
            enableCompression: formData.get('enableCompression') === 'true',
            maxResolution: (formData.get('maxResolution') as string) || 'original',
        };

        // 验证输入
        const validation = uploadVideoSchema.safeParse({
            file,
            ...options
        });

        if (!validation.success) {
            return badRequest('Invalid request parameters');
        }

        // 处理视频上传
        const videoInfo = await VideoService.uploadVideo(file, validation.data);

        return success('Video uploaded successfully', videoInfo);

    } catch (error) {
        console.error('Video upload failed:', error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure('Video upload failed');
    }
});

/**
 * GET /api/m/videos - 获取视频列表
 */
export const GET = withTiming(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);

        const queryParams = {
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
            sortBy: searchParams.get('sortBy') as 'uploadedAt' | 'size' | 'filename' | 'duration' || 'uploadedAt',
            sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
            searchTerm: searchParams.get('searchTerm') || undefined,
            processedOnly: searchParams.get('processedOnly') === 'true' || false,
        };

        // 验证查询参数
        const validation = videoListSchema.safeParse(queryParams);

        if (!validation.success) {
            return badRequest('Invalid query parameters');
        }

        // 获取视频列表
        const result = await VideoService.getVideoList(validation.data);

        return success('Video list retrieved successfully', result);

    } catch (error) {
        console.error('Failed to retrieve video list:', error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure('Failed to retrieve video list');
    }
});

