import { NextRequest } from 'next/server';
import { success, failure } from '@/lib/response';
import commentService from '@/lib/services/comment-service';
import { withTiming } from '@/lib/with-timing';

/**
 * POST /api/m/comments/approve
 * Approve a pending comment
 * Requires authentication
 */
export const POST = withTiming(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { commentId } = body;
        // Approve the comment
        await commentService.approveComment(commentId);
        return success('Comment approved successfully', { commentId });
    } catch (error) {
        console.error('Failed to approve comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to approve comment';
        return failure(errorMessage);
    }
});
