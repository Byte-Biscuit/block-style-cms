import { z } from 'zod';
import { localeMap, TranslationFunction } from '@/i18n/config'

const localeCodesTmp = Object.values(localeMap).map(locale => locale.code) as [string, ...string[]];

export function createSlugSchema(t: TranslationFunction) {
    return z.string()
        .min(10, t('admin.validation.article.slug.min', { min: 10 }))
        .max(100, t('admin.validation.article.slug.max', { max: 100 }))
        .regex(/^[a-z0-9\-]+$/, t('admin.validation.article.slug.format'));
}

export function createArticleSchemas(t: TranslationFunction) {
    const articleIdSchema = z.uuid(t('admin.validation.article.id.format'));

    const slugSchema = createSlugSchema(t);

    const localeSchema = z.enum(localeCodesTmp, t('admin.validation.article.locale.invalid', { codes: localeCodesTmp.join(', ') }));

    const tagSchema = z.string()
        .min(1, t('admin.validation.article.tag.min', { min: 1 }))
        .max(50, t('admin.validation.article.tag.max', { max: 50 }))
        .trim();

    const keywordSchema = z.string()
        .min(2, t('admin.validation.article.keyword.min', { min: 2 }))
        .max(50, t('admin.validation.article.keyword.max', { max: 50 }))
        .trim();

    const titleSchema = z.string()
        .min(1, t('admin.validation.article.title.min', { min: 1 }))
        .max(200, t('admin.validation.article.title.max', { max: 200 }))
        .trim();

    const tagsSchema = z.array(tagSchema)
        .min(1, t('admin.validation.article.tags.min', { min: 1 }))
        .max(10, t('admin.validation.article.tags.max', { max: 10 }));

    const keywordsSchema = z.array(keywordSchema)
        .min(1, t('admin.validation.article.keywords.min', { min: 1 }))
        .max(20, t('admin.validation.article.keywords.max', { max: 20 }));

    const summarySchema = z.string()
        .min(10, t('admin.validation.article.summary.min', { min: 10 }))
        .max(500, t('admin.validation.article.summary.max', { max: 500 }))
        .trim();

    const contentSchema = z.array(z.any())
        .min(1, t('admin.validation.article.content.required'));

    const imageSchema = z.url(t('admin.validation.article.image.url'))
        .optional()
        .or(z.literal(''));

    const baseArticleSchema = z.object({
        id: articleIdSchema.optional(),
        slug: slugSchema,
        image: imageSchema,
        title: titleSchema,
        tags: tagsSchema,
        summary: summarySchema,
        keywords: keywordsSchema,
        content: contentSchema,
        locale: localeSchema,
        published: z.boolean().optional(),
    });

    const articleSchema = z.object({
        ...baseArticleSchema.shape,
        createdAt: z.coerce.date({ message: t('admin.validation.article.createdAt.format') }).optional(),
        updatedAt: z.coerce.date({ message: t('admin.validation.article.updatedAt.format') }).optional(),
    });
    // Must include id when updating
    const updateArticleSchema = baseArticleSchema.extend({
        id: articleIdSchema
    });
    // Omit content when only metadata is needed
    const articleMetadataSchema = articleSchema.omit({ content: true });

    return {
        articleSchema,
        updateArticleSchema,
        articleMetadataSchema,
    };
}

export const articleQuerySchema = z.object({
    locale: z.enum(localeCodesTmp).optional().nullable().default(null),
    tag: z.string().optional().nullable().default(null),
    searchTerm: z.string().optional().nullable().default(null),
    published: z.enum(['published', 'draft', 'all']).optional().nullable().default('all'),
    pageIndex: z.coerce.number().positive().optional().default(1),
    pageSize: z.coerce.number().positive().max(100).optional().default(10)
});

export type Article = z.infer<ReturnType<typeof createArticleSchemas>['articleSchema']>;
export type UpdateArticle = z.infer<ReturnType<typeof createArticleSchemas>['updateArticleSchema']>;
export type ArticleMetadata = z.infer<ReturnType<typeof createArticleSchemas>['articleMetadataSchema']>;