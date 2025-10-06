import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AudioService } from '@/lib/services/audio-service';
import { success, failure, badRequest } from '@/lib/response';
import { withTiming } from '@/lib/with-timing';

/**
 * 音频上传请求验证
 */
const uploadAudioSchema = z.object({
    file: z.instanceof(File),
    originalName: z.string().optional(),
    title: z.string().optional(),
});

/**
 * 音频列表查询验证
 */
const audioListSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['uploadedAt', 'size', 'filename', 'duration']).default('uploadedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    searchTerm: z.string().optional(),
});

/**
 * POST /api/m/audios - 上传音频
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
            title: formData.get('title') as string || undefined,
        };

        // 验证输入
        const validation = uploadAudioSchema.safeParse({
            file,
            ...options
        });

        if (!validation.success) {
            return badRequest('Invalid request parameters');
        }

        // 处理音频上传
        const audioInfo = await AudioService.uploadAudio(file, validation.data);

        return success('Audio uploaded successfully', audioInfo);

    } catch (error) {
        console.error('Audio upload failed:', error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure('Audio upload failed');
    }
});

/**
 * GET /api/m/audios - 获取音频列表
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
        };

        // 验证查询参数
        const validation = audioListSchema.safeParse(queryParams);

        if (!validation.success) {
            return badRequest('Invalid query parameters');
        }

        // 获取音频列表
        const result = await AudioService.getAudioList(validation.data);

        return success('Audio list retrieved successfully', result);

    } catch (error) {
        console.error('Failed to retrieve audio list:', error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure('Failed to retrieve audio list');
    }
});
