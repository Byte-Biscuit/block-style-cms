import { withTiming } from "@/lib/with-timing"
import { success, failure } from '@/lib/response';
import { localeMap, getLanguageDisplayName } from '@/i18n/config'
import { generate, generateBatch } from '@/lib/ai';
import { articleService } from '@/lib/services/article-service';

export const POST = withTiming(async (request: Request) => {
    const body = await request.json();
    const { genType, input, language } = body;

    if (!genType) {
        return failure('The genType parameter is required');
    }
    if (!input || typeof input !== 'string') {
        return failure('The input must be a string');
    }

    const needsLanguage = ['summary', 'keywords', 'suggestion', 'batch'].includes(genType);
    if (needsLanguage && (!language || !(language in localeMap))) {
        return failure('The language parameter is required and must be one of the supported languages');
    }

    const lang = needsLanguage ? getLanguageDisplayName(language) : undefined;

    const taskHandlers = {
        slug: async () => {
            const result = await generate('slug', { input });
            if (!result) {
                return failure('Slug generation failed, please try again');
            }

            const metadataMap = await articleService.getMetadataMap();
            let finalSlug = result;
            let counter = 1;

            while (metadataMap[finalSlug] && metadataMap[finalSlug].length > 0) {
                counter++;
                finalSlug = `${result}-${counter}`;
            }
            return success('Slug generated successfully', {
                slug: finalSlug,
            });
        },
        summary: async () => {
            const result = await generate('summary', { input, lang });
            if (!result) {
                return failure('Summary generation failed, please try again');
            }
            return success('Summary generated successfully', { summary: result });
        },
        keywords: async () => {
            const result = await generate('keywords', { input, lang });
            if (!result) {
                return failure('Keyword generation failed, please try again');
            }
            return success('Keywords generated successfully', { keywords: result });
        },
        suggestion: async () => {
            const result = await generate('suggestion', { input, lang });
            if (!result) {
                return failure('Suggestion generation failed, please try again');
            }
            return success('Suggestion generated successfully', { suggestion: result });
        },
        batch: async () => {
            const result = await generateBatch({ input, lang });
            if (!result) {
                return failure('Batch generation failed, please try again or use single generation');
            }
            return success('Batch generation succeeded', result);
        }
    };

    const handler = taskHandlers[genType as keyof typeof taskHandlers];
    if (handler) {
        return await handler();
    }
    return failure('The provided genType parameter is not recognized; please check your request');
})