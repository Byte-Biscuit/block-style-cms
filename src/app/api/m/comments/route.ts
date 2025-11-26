import { success, failure } from '@/lib/response';
import commentService from '@/lib/services/comment-service';
import { withTiming } from '@/lib/with-timing';

/**
 * GET /api/m/comments
 * Get all comments (for admin moderation)
 * Requires authentication
 */
export const GET = withTiming(async () => {
    try {
        // Get all comments from cache
        const allComments = await commentService.getAllComments();
        // Sort by creation date (newest first)
        allComments.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return success('Comments retrieved successfully', {
            comments: allComments,
            total: allComments.length,
        });
    } catch (error) {
        console.error('Failed to retrieve comments:', error);
        return failure('Failed to retrieve comments');
    }
});
