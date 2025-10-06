import { NextRequest } from 'next/server';
import { ImageService } from '@/lib/services/image-service';
import { success, failure, badRequest, } from '@/lib/response';
import { withTiming } from '@/lib/with-timing';


/**
 * 删除图片API
 * DELETE /api/m/images/[filename]
 */
export const DELETE = withTiming(async (
    request: NextRequest,
    ...args: unknown[]
) => {
    const context = args[0] as { params: { filename: string } };
    const params = await context.params;
    try {
        const { filename } = params;
        if (!filename) {
            return badRequest('Please provide the image filename to delete');
        }
        await ImageService.deleteImage(filename);
        return success('Image deleted successfully', { filename });

    } catch (error) {
        console.error('Failed to delete image:', error);

        if (error instanceof Error) {
            return badRequest(error.message);
        }
        return failure('Failed to delete image');
    }
});
