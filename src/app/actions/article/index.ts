"use server";

import { randomUUID } from "crypto";
import { articleService } from "@/lib/services/article-service";
import { withAuth } from "@/lib/auth/permissions";
import { HttpStatus, Result } from "@/lib/response";
import { locales } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export interface CreateLocaleVariantResult {
    id: string;
    /** true = jumped to existing article, false = newly created */
    existed: boolean;
}

/**
 * Create a locale variant of an article.
 *
 * - If the slug already has a version in targetLocale → return its id directly.
 * - Otherwise → copy source article, replace id/locale/timestamps → save → return new id.
 */
export const createLocaleVariant = withAuth(
    async (params: {
        sourceId: string;
        slug: string;
        targetLocale: string;
    }): Promise<Result<CreateLocaleVariantResult>> => {
        const { sourceId, slug, targetLocale } = params;

        // Validate targetLocale against config
        if (!(locales as readonly string[]).includes(targetLocale)) {
            return {
                code: HttpStatus.BAD_REQUEST,
                message: `Invalid locale: ${targetLocale}`,
                payload: { id: "", existed: false },
            };
        }

        // 1. Check if a version in targetLocale already exists (including drafts)
        const variants = await articleService.getArticlesBySlug(slug, true);
        const existing = variants?.find((v) => v.locale === targetLocale);
        if (existing?.id) {
            return {
                code: HttpStatus.OK,
                message: "Article already exists",
                payload: { id: existing.id, existed: true },
            };
        }

        // 2. Read source article
        const source = await articleService.getArticle(sourceId);
        if (!source) {
            return {
                code: HttpStatus.NOT_FOUND,
                message: `Source article not found: ${sourceId}`,
                payload: { id: "", existed: false },
            };
        }

        // 3. Build new article: new id + target locale + reset timestamps
        const now = new Date();
        const newArticle = {
            ...source,
            id: randomUUID(),
            locale: targetLocale as Locale,
            published: false,
            createdAt: now,
            updatedAt: now,
        };

        // 4. Persist
        await articleService.saveArticle(newArticle);

        return {
            code: HttpStatus.CREATED,
            message: "Article created",
            payload: { id: newArticle.id, existed: false },
        };
    }
);

/**
 * Get all locale codes that already exist for a given slug (including drafts).
 */
export const getLocalesForSlug = withAuth(
    async (params: { slug: string }): Promise<Result<{ locales: string[] }>> => {
        const variants = await articleService.getArticlesBySlug(params.slug, true);
        const existingLocales = (variants ?? []).map((v) => v.locale);
        return {
            code: HttpStatus.OK,
            message: "OK",
            payload: { locales: existingLocales },
        };
    }
);
