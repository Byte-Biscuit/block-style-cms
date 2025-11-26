import { NextRequest } from 'next/server';
import { success, failure } from '@/lib/response';
import suggestionService from '@/lib/services/suggestion-service';
import { withTiming } from '@/lib/with-timing';

/**
 * DELETE /api/m/suggestions/[id]
 * Soft delete a suggestion
 * Requires authentication
 */
export const DELETE = withTiming(async (
    request: NextRequest,
    ...args: unknown[]
) => {
    try {
        const context = args[0] as { params: Promise<{ id: string }> };
        const { id } = await context.params;
        // Soft delete the suggestion
        await suggestionService.deleteSuggestion(id);

        return success('Suggestion deleted successfully', { suggestionId: id });
    } catch (error) {
        console.error('Failed to delete suggestion:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete suggestion';
        return failure(errorMessage);
    }
});
