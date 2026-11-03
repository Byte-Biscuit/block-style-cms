import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { isLocale, resolveLocale } from "@/i18n/config";
import { blocksToMarkdown } from "@/lib/markdown/blocks-to-md";
import { badRequest, failure, success } from "@/lib/response";
import { articleService } from "@/lib/services/article-service";
import { withTiming } from "@/lib/with-timing";
import { createSlugSchema } from "@/types/article";

interface Params {
    slug: string;
    locale?: string;
}

export const GET = withTiming(
    async (request: NextRequest, ...args: unknown[]) => {
        try {
            const context = args[0] as { params: Promise<Params> };
            const params = await context.params;
            const { slug } = params;
            const localeParam =
                request.nextUrl.searchParams.get("locale") ?? params.locale;

            const t = await getTranslations({
                locale: resolveLocale(localeParam),
            });
            const slugValidation = createSlugSchema(t).safeParse(slug);
            if (!slugValidation.success) {
                return failure("Invalid slug parameter", slugValidation.error);
            }
            if (!isLocale(localeParam)) {
                return badRequest(
                    "Query parameter locale is required and must be a supported locale"
                );
            }

            const resolved = await articleService.resolveArticleBySlugLocale(
                slug,
                localeParam,
                true
            );
            if (!resolved.ok) {
                return failure(resolved.error);
            }

            const includeMd =
                request.nextUrl.searchParams.get("includeMdContent") === "1" ||
                request.nextUrl.searchParams.get("includeMdContent") === "true";
            if (!includeMd) {
                return success(
                    "Article retrieved successfully",
                    resolved.article
                );
            }

            const mdContent = await blocksToMarkdown(
                resolved.article.content ?? []
            );
            return success("Article retrieved successfully", {
                ...resolved.article,
                mdContent,
            });
        } catch (error) {
            console.error("Failed to retrieve article by slug:", error);
            return failure("Failed to retrieve article");
        }
    }
);

export const DELETE = withTiming(
    async (request: NextRequest, ...args: unknown[]) => {
        try {
            const context = args[0] as { params: Promise<Params> };
            const params = await context.params;
            const { slug } = params;
            const localeParam =
                request.nextUrl.searchParams.get("locale") ?? params.locale;

            if (!slug) {
                return badRequest("Slug parameter is required");
            }
            if (!isLocale(localeParam)) {
                return badRequest(
                    "Query parameter locale is required and must be a supported locale"
                );
            }

            const resolved = await articleService.resolveArticleBySlugLocale(
                slug,
                localeParam,
                true
            );
            if (!resolved.ok) {
                return failure(resolved.error);
            }

            const id = resolved.article.id as string;
            await articleService.deleteArticle(slug, id);
            revalidatePath("/[locale]/m", "layout");
            return success("Article deleted successfully", {
                slug,
                id,
                locale: localeParam,
            });
        } catch (error) {
            const errorMessage =
                "Failed to delete article: " +
                (error instanceof Error ? error.message : String(error));
            console.error(errorMessage);
            return failure(errorMessage);
        }
    }
);
