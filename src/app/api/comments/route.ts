import { NextRequest } from 'next/server';
import { success, failure, forbidden } from '@/lib/response';
import commentService from '@/lib/services/comment-service';
import { sanitize } from '@/lib/security';
import { withTiming } from '@/lib/with-timing';
import { createCommentSchemas } from '@/types/comment';
import { getTranslations } from 'next-intl/server';
import { defaultLocale } from '@/i18n/config';
import { LOCALE_PARAM_NAME } from '@/constants';
import { z } from 'zod';

/**
 * Rate limiting map: IP -> { count, resetTime }
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limit: 5 comments per 15 minutes per IP
 */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        // New window
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    return forwarded?.split(',')[0] || real || 'unknown';
}

/**
 * GET /api/comments?articleId={id}
 * Fetch approved comments for a specific article
 */
export const GET = withTiming(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const articleId = searchParams.get('articleId');

        if (!articleId) {
            return failure('Article ID is required');
        }

        const comments = await commentService.getArticleComments(articleId);
        return success('Comments retrieved successfully', { comments, total: comments.length });
    } catch (error) {
        console.error('Failed to retrieve comments:', error);
        return failure('Failed to retrieve comments');
    }
});

/**
 * POST /api/comments
 * Submit a new comment (pending approval)
 */
export const POST = withTiming(async (request: NextRequest) => {
    try {
        // Get client information
        const ip = getClientIp(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return forbidden('Rate limit exceeded. Please try again later.');
        }

        // Parse and validate request body
        const body = await request.json();
        const locale = body[LOCALE_PARAM_NAME] || defaultLocale;
        const t = await getTranslations({ locale });
        const { commentSubmissionSchema } = createCommentSchemas(t);
        const validation = commentSubmissionSchema.safeParse(body);

        if (!validation.success) {
            const formatted = z.flattenError(validation.error);
            return failure('Validation failed', {
                fieldErrors: formatted.fieldErrors,
                formErrors: formatted.formErrors
            });
        }

        const submissionData = validation.data;

        // Sanitize content to prevent XSS
        const sanitizedContent = sanitize(submissionData.content);
        if (!sanitizedContent) {
            return failure('Invalid content');
        }

        // Validate content (length and link count)
        try {
            commentService.validateCommentContent(sanitizedContent);
        } catch (error) {
            return failure(error instanceof Error ? error.message : 'Content validation failed');
        }

        // Sanitize author fields
        const sanitizedWebsite = submissionData.author.website
            ? sanitize(submissionData.author.website)
            : undefined;
        const sanitizedAuthor = {
            name: sanitize(submissionData.author.name) || '',
            email: sanitize(submissionData.author.email) || '',
            website: sanitizedWebsite ?? undefined,
        };

        // Create comment submission with sanitized data
        const sanitizedSubmission = {
            ...submissionData,
            content: sanitizedContent,
            author: sanitizedAuthor,
        };

        // Add comment
        const comment = await commentService.addComment(sanitizedSubmission, { ip, userAgent });

        return success('Comment submitted successfully and pending approval', {
            commentId: comment.id,
            status: comment.status
        });
    } catch (error) {
        console.error('Failed to submit comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit comment';
        return failure(errorMessage);
    }
});
