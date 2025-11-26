import { NextRequest } from 'next/server';
import { success, failure } from '@/lib/response';
import commentService from '@/lib/services/comment-service';
import { withTiming } from '@/lib/with-timing';

/**
 * POST /api/m/comments/reject
 * Reject and delete a comment
 * Requires authentication
 */
export const POST = withTiming(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { commentId } = body;
        // Reject the comment (will be deleted)
        await commentService.rejectComment(commentId);
        return success('Comment rejected successfully', { commentId });
    } catch (error) {
        console.error('Failed to reject comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to reject comment';
        return failure(errorMessage);
    }
});
