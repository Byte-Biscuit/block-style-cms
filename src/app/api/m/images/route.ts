import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ImageService } from '@/lib/services/image-service';
import { success, failure, badRequest } from '@/lib/response';
import { withTiming } from '@/lib/with-timing';
import type { ImageMetaInfo } from '@/types/image';

// 验证上传选项的schema
const uploadOptionsSchema = z.object({
    quality: z.number().min(1).max(100).optional(),
    maxWidth: z.number().min(100).max(4096).optional(),
    maxHeight: z.number().min(100).max(4096).optional(),
    enableWebP: z.boolean().optional()
});

// 验证分页参数的schema
const listOptionsSchema = z.object({
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(20),
    sortBy: z.enum(['uploadedAt', 'size', 'filename']).optional().default('uploadedAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    searchTerm: z.string().nullable().optional()
});

/**
 * 图片上传API
 * POST /api/m/images
 */
export const POST = withTiming(async (request: NextRequest) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const optionsStr = formData.get('options') as string;

        // Verify file exists
        if (!file) {
            return badRequest('Please select an image file to upload');
        }

        // 解析和验证选项
        let options = {};
        if (optionsStr) {
            try {
                const parsedOptions = JSON.parse(optionsStr);
                const validation = uploadOptionsSchema.safeParse(parsedOptions);

                if (!validation.success) {
                    return badRequest(
                        'Upload options format error: '
                    );
                }

                options = validation.data;
            } catch {
                return badRequest('Upload options JSON format error');
            }
        }

        // 上传并处理图片
        const imageInfo: ImageMetaInfo = await ImageService.uploadImage(file, {
            originalName: file.name,
            ...options
        });

        return success('Image uploaded successfully', imageInfo);

    } catch (error) {
        console.error('Image upload failed:', error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure('Image upload failed, please try again later');
    }
});

/**
 * 获取图片列表API
 * GET /api/m/images?page=1&limit=20&sortBy=uploadedAt&sortOrder=desc&searchTerm=example
 */
export const GET = withTiming(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);

        // 解析查询参数
        const queryParams = {
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
            sortBy: searchParams.get('sortBy') as 'uploadedAt' | 'size' | 'filename' || 'uploadedAt',
            sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
            searchTerm: searchParams.get('searchTerm') || null
        };

        // 验证参数
        const validation = listOptionsSchema.safeParse(queryParams);
        if (!validation.success) {
            return badRequest('Query parameter error: ');
        }

        const options = validation.data;

        // 获取图片列表
        const result = await ImageService.getImageList(options);

        return success('Image list retrieved successfully', result);

    } catch (error) {
        console.error('Failed to retrieve image list:', error);
        return failure('Failed to retrieve image list');
    }
})
