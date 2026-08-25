import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { LOCALE_PARAM_NAME } from "@/constants";
import { defaultLocale, localeMap } from "@/i18n/config";
import {
    markdownToBlocks,
    UnresolvedImagePathsError,
} from "@/lib/markdown/md-to-blocks";
import { badRequest, failure, success } from "@/lib/response";
import { articleService } from "@/lib/services/article-service";
import { ImageService } from "@/lib/services/image-service";
import { systemConfigService } from "@/lib/services/system-config-service";
import { withTiming } from "@/lib/with-timing";
import { type Article, createArticleSchemas } from "@/types/article";

const localeCodes = Object.values(localeMap).map((l) => l.code) as [
    string,
    ...string[],
];

const fromMarkdownBodySchema = z
    .object({
        title: z.string().min(1),
        slug: z.string().min(1),
        summary: z.string().optional().default(""),
        tags: z.array(z.string()).optional().default([]),
        keywords: z.array(z.string()).optional().default([]),
        language: z.enum(localeCodes),
        mdContent: z.string().optional(),
        "md-content": z.string().optional(),
        cover: z.string().optional().default(""),
        published: z.boolean().optional().default(false),
        [LOCALE_PARAM_NAME]: z.string().optional(),
    })
    .refine((data) => Boolean(data.mdContent || data["md-content"]), {
        message: "mdContent is required",
        path: ["mdContent"],
    });

type LooseBlock = {
    type: string;
    props?: Record<string, unknown>;
    children?: LooseBlock[];
};

function filenameFromImagesPath(src: string): string | null {
    if (!src.startsWith("/images/")) return null;
    const name = src.slice("/images/".length).split("?")[0];
    return name || null;
}

async function enrichEnhancedImageDimensions(
    blocks: LooseBlock[]
): Promise<void> {
    for (const block of blocks) {
        if (block.type === "enhancedImage" && block.props) {
            const src = String(block.props.src ?? "");
            const filename = filenameFromImagesPath(src);
            if (filename) {
                const meta = await ImageService.getImageInfo(filename);
                if (meta?.width) block.props.width = String(meta.width);
                if (meta?.height) block.props.height = String(meta.height);
            }
        }
        if (block.children?.length) {
            await enrichEnhancedImageDimensions(block.children);
        }
    }
}

async function normalizeCoverUrl(cover: string): Promise<string> {
    if (!cover) return "";
    if (/^https?:\/\//i.test(cover)) return cover;
    if (cover.startsWith("/images/")) {
        const config = await systemConfigService.readConfig();
        const base = (config?.siteInfo?.baseUrl ?? "").replace(/\/+$/, "");
        if (base) return `${base}${cover}`;
    }
    return cover;
}

/**
 * Create an article from markdown body content.
 * Images in md must already be /images/{filename} or http(s) URLs.
 */
export const POST = withTiming(async (request) => {
    try {
        const requestBody = await request.json();
        const parsedBody = fromMarkdownBodySchema.safeParse(requestBody);
        if (!parsedBody.success) {
            return badRequest(
                "Request body validation failed",
                parsedBody.error
            );
        }

        const data = parsedBody.data;
        const mdContent = data.mdContent ?? data["md-content"] ?? "";
        const uiLocale =
            (data[LOCALE_PARAM_NAME] as string | undefined) || defaultLocale;
        const t = await getTranslations({ locale: uiLocale });

        let content: Article["content"];
        try {
            content = await markdownToBlocks(mdContent, {
                title: data.title,
            });
        } catch (error) {
            if (error instanceof UnresolvedImagePathsError) {
                return badRequest(error.message, { paths: error.paths });
            }
            throw error;
        }

        await enrichEnhancedImageDimensions(content as LooseBlock[]);

        const cover = await normalizeCoverUrl(data.cover ?? "");
        const articlePayload = {
            slug: data.slug,
            title: data.title,
            summary: data.summary ?? "",
            tags: data.tags ?? [],
            keywords: data.keywords ?? [],
            locale: data.language,
            image: cover,
            content,
            published: data.published ?? false,
        };

        const { articleSchema, draftArticleSchema } = createArticleSchemas(t);
        const schema = articlePayload.published
            ? articleSchema
            : draftArticleSchema;
        const validation = schema.safeParse(articlePayload);
        if (!validation.success) {
            return failure("Data validation failed.", validation.error);
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
            updatedAt: now,
        };
        await articleService.saveArticle(article);
        revalidatePath("/[locale]/m", "layout");
        return success("Article created from markdown successfully", {
            id: article.id,
            slug: article.slug,
            locale: article.locale,
        });
    } catch (error) {
        const errorMessage =
            "Failed to create article from markdown: " +
            (error instanceof Error ? error.message : String(error));
        console.error(errorMessage);
        return failure(errorMessage);
    }
});
