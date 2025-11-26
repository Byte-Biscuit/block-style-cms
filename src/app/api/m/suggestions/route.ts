import { success, failure } from '@/lib/response';
import suggestionService from '@/lib/services/suggestion-service';
import { withTiming } from '@/lib/with-timing';
import type { Suggestion } from '@/types/suggestion';

/**
 * GET /api/m/suggestions
 * Get all suggestions (for admin)
 * Requires authentication
 */
export const GET = withTiming(async () => {
    try {
        // Get all suggestions
        const suggestions = await suggestionService.getAllSuggestions();

        // Sort by creation date (newest first)
        suggestions.sort((a: Suggestion, b: Suggestion) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return success('Suggestions retrieved successfully', {
            suggestions,
            total: suggestions.length,
        });
    } catch (error) {
        console.error('Failed to retrieve suggestions:', error);
        return failure('Failed to retrieve suggestions');
    }
});
