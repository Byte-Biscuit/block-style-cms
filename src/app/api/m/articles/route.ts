import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getTranslations } from "next-intl/server"
import { success, failure } from '@/lib/response';
import { articleService } from '@/lib/services/article-service';
import { withTiming } from "@/lib/with-timing";
import { defaultLocale } from "@/i18n/config"
import { LOCALE_PARAM_NAME } from "@/constants";
import { ArticleMetadata, createArticleSchemas, articleQuerySchema } from '@/types/article';

export const GET = withTiming(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const queryValidation = articleQuerySchema.safeParse({
            locale: searchParams.get('locale'),
            tag: searchParams.get('tag'),
            searchTerm: searchParams.get('searchTerm'),
            pageIndex: searchParams.get('pageIndex'),
            pageSize: searchParams.get('pageSize'),
            published: searchParams.get('published')
        });

        if (!queryValidation.success) {
            return failure('Query parameter validation failed', queryValidation.error);
        }

        const { tag, locale, published, searchTerm, pageIndex, pageSize } = queryValidation.data;

        const allArticles = await articleService.getAllArticles();
        let targetArticles: ArticleMetadata[] = allArticles;
        if (tag) {
            targetArticles = targetArticles.filter(article =>
                article.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
            );
        }
        if (published === 'published') {
            targetArticles = targetArticles.filter(article => article.published);
        }
        if (published === 'draft') {
            targetArticles = targetArticles.filter(article => !article.published);
        }
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            targetArticles = targetArticles.filter(article =>
                article.title.toLowerCase().includes(lowerSearchTerm)
            );
        }
        if (locale) {
            targetArticles = targetArticles.filter(article => article.locale === locale);
        }
        const articles = await articleService.getArticlesWithPage(targetArticles, pageIndex, pageSize);
        const pageData = {
            "data": articles,
            "pageIndex": pageIndex,
            "pageSize": pageSize,
            "total": targetArticles.length,
            "totalPages": await articleService.getTotalPageCount(targetArticles, pageSize)
        }
        return success('Articles list retrieved successfully', { ...pageData });
    } catch (error) {
        console.error('Failed to retrieve articles list:', error);
        return failure('Failed to retrieve articles list');
    }
})

/**
 * Create a new article.
 */
export const POST = withTiming(async (request) => {
    try {
        const requestBody = await request.json();
        const locale = requestBody[LOCALE_PARAM_NAME] || defaultLocale
        const t = await getTranslations({ locale: locale });
        const { articleSchema } = createArticleSchemas(t);
        const validation = articleSchema.safeParse(requestBody);
        if (!validation.success) {
            return failure('Data validation failed.', validation.error);
        }
        const articleData = validation.data;

        const now = new Date();
        const article = {
            id: uuidv4(),
            slug: articleData.slug,
            title: articleData.title,
            content: articleData.content,
            tags: articleData.tags,
            keywords: articleData.keywords,
            summary: articleData.summary,
            locale: articleData.locale,
            image: articleData.image,
            published: articleData.published,
            createdAt: now,
            updatedAt: now
        };
        await articleService.saveArticle(article);
        return success('Article created successfully', { "slug": articleData.slug, "locale": articleData.locale });
    } catch (error) {
        const errorMessage = 'Failed to create article: ' + (error instanceof Error ? error.message : String(error));
        console.error(errorMessage);
        return failure(errorMessage);
    }
})

/**
 * Update an existing article.
 */
export const PUT = withTiming(async (request) => {
    try {
        const requestBody = await request.json();
        const locale = requestBody[LOCALE_PARAM_NAME] || defaultLocale
        const t = await getTranslations({ locale: locale });
        const { updateArticleSchema } = createArticleSchemas(t);
        const validation = updateArticleSchema.safeParse(requestBody);
        if (!validation.success) {
            return failure('Data validation failed.', validation.error);
        }
        const article = validation.data;
        if (!article.id && !article.slug) {
            return failure('Updating an article requires id or slug');
        }
        await articleService.updateArticle(article);
        return success('Article updated successfully', { "slug": article.slug, "language": article.locale });
    } catch (error) {
        const errorMessage = 'Failed to update article: ' + (error instanceof Error ? error.message : String(error));
        console.error(errorMessage);
        return failure(errorMessage);
    }
})

