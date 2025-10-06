import { NextRequest } from 'next/server';
import { getTranslations } from "next-intl/server"
import { success, failure } from '@/lib/response';
import { articleService } from '@/lib/services/article-service';
import { createSlugSchema } from '@/types/article';
import { withTiming } from '@/lib/with-timing';

interface Params {
    slug: string;
    id: string;
    locale: string;
}

export const GET = withTiming(async (request: NextRequest, ...args: unknown[]) => {
    try {
        const context = args[0] as { params: Promise<Params> };
        const params = await context.params;
        const { slug, id, locale } = params;
        const t = await getTranslations({ locale: locale });
        const slugSchema = createSlugSchema(t);
        const slugValidation = slugSchema.safeParse(slug);
        if (!slugValidation.success) {
            console.error('Invalid slug parameter:', slugValidation.error);
            return failure('Invalid slug parameter', slugValidation.error);
        }

        if (!id) {
            return failure('ID parameter is required');
        }

        // 根据 id 获取文章
        const article = await articleService.getArticle(id);

        if (!article) {
            return failure('Article not found');
        }

        if (article.slug !== slug) {
            return failure('Article identifier does not match');
        }

        return success('Article retrieved successfully', article);
    } catch (error) {
        console.error('Failed to retrieve article:', error);
        return failure('Failed to retrieve article');
    }
});

/**
 * Delete an article.
 */
export const DELETE = withTiming(async (_: NextRequest, ...args: unknown[]) => {
    try {
        const context = args[0] as { params: Promise<{ slug: string, id: string }> };
        const { slug, id } = await context.params
        if (!slug || !id) {
            return failure('Deleting an article requires both slug and id parameters');
        }
        await articleService.deleteArticle(slug, id);
        return success('Article deleted successfully', { slug, id });
    } catch (error) {
        const errorMessage = 'Failed to delete article: ' + (error instanceof Error ? error.message : String(error));
        console.error(errorMessage);
        return failure(errorMessage);
    }
})

