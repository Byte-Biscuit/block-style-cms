import { NextRequest } from 'next/server';
import { success, failure } from '@/lib/response';
import suggestionService from '@/lib/services/suggestion-service';
import { withTiming } from '@/lib/with-timing';
import { getRequestMetadata } from '@/lib/request-util';

/**
 * POST /api/suggestions
 * Submit a new suggestion
 */
export const POST = withTiming(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { name, email, content } = body;

        // Basic validation
        if (!name || !email || !content) {
            return failure('Missing required fields');
        }

        // Validate content
        try {
            suggestionService.validateSuggestionContent(content);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid content';
            return failure(errorMessage);
        }

        const { ip, userAgent } = getRequestMetadata(request);

        // Add suggestion
        const suggestion = await suggestionService.addSuggestion(
            { name, email, content },
            { ip, userAgent }
        );

        return success('Suggestion submitted successfully', {
            id: suggestion.id,
            createdAt: suggestion.createdAt,
        });
    } catch (error) {
        console.error('Failed to submit suggestion:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit suggestion';
        return failure(errorMessage);
    }
});
