import fs from "node:fs/promises";
import path from "node:path";
import { algoliaSearchService } from "@/lib/services/algolia-search-service";
import { ARTICLE_DIR, META_DIR } from "@/settings";
import {
    type Article,
    type ArticleMetadata,
    keywordsFromTags,
} from "@/types/article";

export type ResolveArticleBySlugLocaleError =
    | "Article not found"
    | "Article not found for locale"
    | "Ambiguous article: multiple entries for slug+locale"
    | "Article id missing";

export type ResolveArticleBySlugLocaleResult =
    | { ok: true; article: Article }
    | { ok: false; error: ResolveArticleBySlugLocaleError };

class ArticleService {
    getArticleFile(id: string): string {
        return path.join(ARTICLE_DIR, `${id}.json`);
    }

    getMetadataFile(): string {
        return path.join(META_DIR, "article_metadata.json");
    }

    /**
     * Save an article.
     * @param article
     */
    async saveArticle(article: Article): Promise<void> {
        if (!article.id) {
            throw new Error("Article ID is required");
        }
        article.keywords = keywordsFromTags(article.tags, article.keywords);
        const articleFile = this.getArticleFile(article.id);
        await fs.writeFile(articleFile, JSON.stringify(article, null, 2));
        await this.updateMetadata(article);
        await algoliaSearchService.saveArticle(article);
    }

    /**
     * Update an existing article.
     * @param article
     */
    async updateArticle(
        article: Article & { content?: Article["content"] }
    ): Promise<void> {
        if (!article.id) {
            throw new Error("Article ID is required");
        }
        const articleFile = this.getArticleFile(article.id);
        try {
            const existingContent = await fs.readFile(articleFile, "utf-8");
            const existingArticle: Article = JSON.parse(existingContent);
            const { content: nextContent, ...rest } = article;
            const updatedArticle: Article = {
                ...existingArticle,
                ...rest,
                // Omit content in request → keep stored blocks (metadata-only / publish toggle).
                content:
                    nextContent === undefined
                        ? existingArticle.content
                        : nextContent,
                updatedAt: new Date(),
            };
            updatedArticle.keywords = keywordsFromTags(
                updatedArticle.tags,
                updatedArticle.keywords
            );
            await fs.writeFile(
                articleFile,
                JSON.stringify(updatedArticle, null, 2)
            );
            await this.updateMetadata(updatedArticle);
            await algoliaSearchService.updateArticle(updatedArticle);
        } catch (error) {
            console.error(`Error updating article ${article.id}:`, error);
            throw new Error(
                `Failed to update article: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Delete an article.
     * @param slug
     * @param id
     */
    async deleteArticle(slug: string, id: string): Promise<void> {
        const articleFile = this.getArticleFile(id);
        try {
            await fs.rm(articleFile, { force: true });

            const metadataMap = await this.getMetadataMap();
            if (metadataMap[slug]) {
                metadataMap[slug] = metadataMap[slug].filter(
                    (meta) => meta.id !== id
                );
                if (metadataMap[slug].length === 0) {
                    delete metadataMap[slug];
                }
                await fs.writeFile(
                    this.getMetadataFile(),
                    JSON.stringify(metadataMap, null, 2)
                );
            }
            await algoliaSearchService.deleteArticle(id);
        } catch (error) {
            console.error(`Error deleting article ${id}:`, error);
            throw new Error(
                `Failed to delete article: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Update metadata for an article.
     * @param article
     */
    async updateMetadata(article: Article): Promise<void> {
        const metadataMap = await this.getMetadataMap();
        const newMetadata: ArticleMetadata = {
            id: article.id,
            slug: article.slug,
            title: article.title,
            summary: article.summary,
            keywords: article.keywords,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            locale: article.locale,
            published: article.published || false,
            image: article.image,
            tags: article.tags,
        };

        if (!metadataMap[article.slug]) {
            metadataMap[article.slug] = [newMetadata];
        } else {
            const existingIndex = metadataMap[article.slug].findIndex(
                (meta) => meta.id === article.id
            );
            if (existingIndex !== -1) {
                const existing = metadataMap[article.slug][existingIndex];
                metadataMap[article.slug][existingIndex] = {
                    ...newMetadata,
                    createdAt: existing.createdAt,
                };
            } else {
                metadataMap[article.slug].push(newMetadata);
            }
        }
        await fs.writeFile(
            this.getMetadataFile(),
            JSON.stringify(metadataMap, null, 2)
        );
    }

    async getArticle(id: string): Promise<Article | null> {
        try {
            const articleFile = this.getArticleFile(id);
            const content = await fs.readFile(articleFile, "utf-8");
            const article = JSON.parse(content);
            return article;
        } catch {
            return null;
        }
    }

    /**
     * Article metadata map
     * @returns
     */
    async getMetadataMap(): Promise<Record<string, ArticleMetadata[]>> {
        const metadataFile = this.getMetadataFile();
        let metadataMap: Record<string, ArticleMetadata[]> = {};
        try {
            const content = await fs.readFile(metadataFile, "utf-8");
            metadataMap = JSON.parse(content);
        } catch {
            metadataMap = {};
        }
        return metadataMap;
    }

    /**
     * Get all articles.
     * @returns
     */
    async getAllArticles(): Promise<ArticleMetadata[]> {
        console.log("Fetching all articles");
        const metadataMap = await this.getMetadataMap();
        const slugGroups = Object.entries(metadataMap).map(
            ([slug, articles]) => {
                const sortedArticles = [...articles].sort(
                    (a, b) =>
                        new Date(b.updatedAt || "0").getTime() -
                        new Date(a.updatedAt || "0").getTime()
                );
                return {
                    slug,
                    articles: sortedArticles,
                    latest:
                        sortedArticles[0]?.updatedAt ||
                        sortedArticles[0]?.createdAt ||
                        "0",
                };
            }
        );
        slugGroups.sort(
            (a, b) =>
                new Date(b.latest).getTime() - new Date(a.latest).getTime()
        );
        const allArticles: ArticleMetadata[] = [];
        for (const group of slugGroups) {
            allArticles.push(...group.articles);
        }
        return allArticles;
    }
    /**
     * Get the total count of articles and draft count.
     * @returns The total count of articles and draft count.
     */
    async getArticlesCount(): Promise<{ total: number; draft: number }> {
        const metadataMap = await this.getMetadataMap();
        const total = Object.values(metadataMap).reduce(
            (count, articles) => count + articles.length,
            0
        );
        const draft = Object.values(metadataMap).reduce(
            (count, articles) =>
                count + articles.filter((article) => !article.published).length,
            0
        );
        return { total, draft };
    }

    async getArticlesWithPage(
        articles: ArticleMetadata[],
        page: number,
        pageSize: number
    ): Promise<ArticleMetadata[] | null> {
        if (page < 1 || pageSize < 1) {
            throw new Error("Page and pageSize must be greater than 0");
        }
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        if (startIndex >= articles.length) {
            return null;
        }
        return articles.slice(startIndex, endIndex);
    }

    async getTotalPageCount(
        articles: ArticleMetadata[],
        pageSize: number
    ): Promise<number> {
        if (pageSize <= 0) {
            throw new Error("Page size must be greater than 0");
        }
        return Math.ceil(articles.length / pageSize);
    }

    async getAllTags(): Promise<string[]> {
        const articles = await this.getAllArticles();
        const tags = new Set<string>();
        for (const article of articles) {
            for (const tag of article.tags) {
                tags.add(tag);
            }
        }
        return Array.from(tags).sort();
    }

    /**
     * Get articles by slug
     * @param slug - Article slug
     * @param includeUnpublished - If true, include unpublished articles (for preview); if false, only published articles
     */
    async getArticlesBySlug(
        slug: string,
        includeUnpublished: boolean = false
    ): Promise<ArticleMetadata[] | null> {
        const metadataMap = await this.getMetadataMap();
        let articles = metadataMap[slug];
        // If unpublished are excluded, keep only published entries.
        if (!includeUnpublished) {
            articles = articles?.filter((article) => article.published) || null;
        }
        if (!articles || articles.length === 0) {
            return null;
        }
        return articles;
    }

    /**
     * Resolve a single full article by slug + locale.
     * Includes drafts when includeUnpublished is true (admin / preview).
     */
    async resolveArticleBySlugLocale(
        slug: string,
        locale: string,
        includeUnpublished: boolean = true
    ): Promise<ResolveArticleBySlugLocaleResult> {
        const variants = await this.getArticlesBySlug(
            slug,
            includeUnpublished
        );
        if (!variants?.length) {
            return { ok: false, error: "Article not found" };
        }
        const matches = variants.filter((v) => v.locale === locale);
        if (matches.length === 0) {
            return { ok: false, error: "Article not found for locale" };
        }
        if (matches.length > 1) {
            return {
                ok: false,
                error: "Ambiguous article: multiple entries for slug+locale",
            };
        }
        const meta = matches[0];
        if (!meta.id) {
            return { ok: false, error: "Article id missing" };
        }
        const article = await this.getArticle(meta.id);
        if (!article) {
            return { ok: false, error: "Article not found" };
        }
        return { ok: true, article };
    }
    /**
     * Get latest articles by locale
     * @param locale
     * @param limit
     * @returns
     */
    async getArticlesByLocale(
        locale: string,
        limit: number = 20
    ): Promise<ArticleMetadata[]> {
        const metadataMap = await this.getMetadataMap();
        // Simulate delay (for testing skeleton screen effects).
        //await new Promise(resolve => setTimeout(resolve, 20000));
        const allArticles: ArticleMetadata[] = [];
        Object.values(metadataMap).forEach((articles) => {
            articles.forEach((article) => {
                if (article.locale === locale && article.published) {
                    allArticles.push(article);
                }
            });
        });

        allArticles.sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.createdAt || "0").getTime();
            const timeB = new Date(b.updatedAt || b.createdAt || "0").getTime();
            return timeB - timeA;
        });
        const articles = allArticles.slice(0, limit);
        return articles;
    }
}

export const articleService = new ArticleService();
export { ArticleService };
