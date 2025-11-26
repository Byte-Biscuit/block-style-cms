/**
 * Comment Data Type Definitions with Zod Validation
 */

import { z } from 'zod';
import { TranslationFunction } from '@/i18n/config';

/**
 * Comment Status Schema
 */
export const commentStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type CommentStatus = z.infer<typeof commentStatusSchema>;

/**
 * Comment Metadata Schema (Security Information)
 */
export const commentMetadataSchema = z.object({
    /** IP address */
    ip: z.string(),
    /** Browser User Agent */
    userAgent: z.string(),
});
export type CommentMetadata = z.infer<typeof commentMetadataSchema>;

/**
 * Create Comment Schemas with i18n support
 */
export function createCommentSchemas(t: TranslationFunction) {
    const commentAuthorSchema = z.object({
        /** Nickname */
        name: z.string()
            .min(1, t('web.comment.validation.author.name.required'))
            .max(50, t('web.comment.validation.author.name.max', { max: 50 })),
        /** Email address */
        email: z.string()
            .email(t('web.comment.validation.author.email.format'))
            .max(100, t('web.comment.validation.author.email.max', { max: 100 })),
        /** Personal website (optional) */
        website: z.string()
            .url(t('web.comment.validation.author.website.format'))
            .max(200, t('web.comment.validation.author.website.max', { max: 200 }))
            .optional(),
    });

    const commentSubmissionSchema = z.object({
        /** Article ID */
        articleId: z.uuid(t('web.comment.validation.articleId.format')),
        /** Article title */
        articleTitle: z.string()
            .min(1, t('web.comment.validation.articleTitle.required'))
            .max(200, t('web.comment.validation.articleTitle.max', { max: 200 })),
        /** Comment content */
        content: z.string()
            .min(10, t('web.comment.validation.content.min', { min: 10 }))
            .max(1000, t('web.comment.validation.content.max', { max: 1000 })),
        /** Author information */
        author: commentAuthorSchema,
        /** Reply to comment ID (optional) */
        replyToId: z.string().uuid(t('web.comment.validation.replyToId.format')).optional(),
    });

    const commentSchema = commentSubmissionSchema.extend({
        /** Comment unique ID (UUID) */
        id: z.uuid(),
        /** Submission time (ISO 8601 format) */
        createdAt: z.iso.datetime(),
        /** Comment status */
        status: commentStatusSchema,
        /** Security metadata (backend recorded) */
        metadata: commentMetadataSchema.optional(),
    });

    const commentOperationSchema = z.object({
        /** Comment ID to operate on */
        commentId: z.uuid(t('web.comment.validation.commentId.format')),
    });

    return {
        commentAuthorSchema,
        commentSubmissionSchema,
        commentSchema,
        commentOperationSchema,
    };
}

/**
 * Comment Query Schema (GET parameters)
 */
export const commentQuerySchema = z.object({
    /** Article ID to filter comments */
    articleId: z.uuid().optional(),
    /** Status filter for admin */
    status: commentStatusSchema.optional(),
});
export type CommentQuery = z.infer<typeof commentQuerySchema>;

/**
 * Type exports derived from schemas
 */
export type CommentAuthor = z.infer<ReturnType<typeof createCommentSchemas>['commentAuthorSchema']>;
export type CommentSubmissionData = z.infer<ReturnType<typeof createCommentSchemas>['commentSubmissionSchema']>;
export type Comment = z.infer<ReturnType<typeof createCommentSchemas>['commentSchema']>;
export type CommentOperation = z.infer<ReturnType<typeof createCommentSchemas>['commentOperationSchema']>;
