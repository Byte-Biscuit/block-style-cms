import { NextRequest } from 'next/server';
import { AudioService } from '@/lib/services/audio-service';
import { success, failure, notFound, badRequest } from '@/lib/response';
import { withTiming } from '@/lib/with-timing';

/**
 * GET /api/m/audios/[filename] - 获取音频信息
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withTiming(async (request: NextRequest, context: any) => {
    try {
        const { filename } = context.params;

        if (!filename) {
            return badRequest('Filename cannot be empty');
        }

        const audioInfo = await AudioService.getAudioInfo(filename);

        if (!audioInfo) {
            return notFound('Audio file not found');
        }

        return success('Audio information retrieved successfully', audioInfo);

    } catch (error) {
        console.error('Failed to retrieve audio information:', error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure('Failed to retrieve audio information');
    }
});

/**
 * DELETE /api/m/audios/[filename] - 删除音频文件
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withTiming(async (request: NextRequest, context: any) => {
    try {
        const { filename } = context.params;

        if (!filename) {
            return badRequest('Filename cannot be empty');
        }

        await AudioService.deleteAudio(filename);

        return success('Audio deleted successfully');

    } catch (error) {
        console.error('Failed to delete audio:', error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }

        return failure('Failed to delete audio');
    }
});
