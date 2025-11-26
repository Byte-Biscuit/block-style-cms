/**
 * Suggestion Data Type Definitions with Zod Validation
 */

import { z } from 'zod';
import { TranslationFunction } from '@/i18n/config';

/**
 * Suggestion Metadata Schema (Security Information)
 */
export const suggestionMetadataSchema = z.object({
    /** IP address */
    ip: z.string(),
    /** Browser User Agent */
    userAgent: z.string(),
});
export type SuggestionMetadata = z.infer<typeof suggestionMetadataSchema>;

/**
 * Create Suggestion Schemas with i18n support
 */
export function createSuggestionSchemas(t: TranslationFunction) {
    const suggestionSubmissionSchema = z.object({
        /** How to address the person */
        name: z.string()
            .min(1, t('web.suggestion.validation.name.required'))
            .max(50, t('web.suggestion.validation.name.max', { max: 50 })),
        /** Contact email */
        email: z.email(t('web.suggestion.validation.email.format'))
            .max(100, t('web.suggestion.validation.email.max', { max: 100 })),
        /** Suggestion content */
        content: z.string()
            .min(10, t('web.suggestion.validation.content.min', { min: 10 }))
            .max(2000, t('web.suggestion.validation.content.max', { max: 2000 })),
    });

    const suggestionSchema = suggestionSubmissionSchema.extend({
        /** Suggestion unique ID (UUID) */
        id: z.uuid(),
        /** Submission time (ISO 8601 format) */
        createdAt: z.iso.datetime(),
        /** Security metadata (backend recorded) */
        metadata: suggestionMetadataSchema.optional(),
    });

    return {
        suggestionSubmissionSchema,
        suggestionSchema,
    };
}

/**
 * Type exports derived from schemas
 */
export type SuggestionSubmissionData = z.infer<ReturnType<typeof createSuggestionSchemas>['suggestionSubmissionSchema']>;
export type Suggestion = z.infer<ReturnType<typeof createSuggestionSchemas>['suggestionSchema']>;
