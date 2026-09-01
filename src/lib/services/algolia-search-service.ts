import { algoliasearch, type SearchClient } from "algoliasearch";
import type { LocalBlock } from "@/block-note/schema";
import { extractTextFromContent } from "@/lib/toc-utils";
import type { Article } from "@/types/article";
import { systemConfigService } from "./system-config-service";

function isMermaidLanguage(language: string): boolean {
    const normalized = language.trim().toLowerCase();
    return normalized === "mermaid" || normalized === "mmd";
}

function isSvgLanguage(language: string): boolean {
    return language.trim().toLowerCase() === "svg";
}

function blockProps(block: LocalBlock): Record<string, unknown> | undefined {
    return block.props as Record<string, unknown> | undefined;
}

function extractBlockTextContent(block: LocalBlock): string {
    if (block.content && Array.isArray(block.content)) {
        return extractTextFromContent(block.content);
    }

    const props = blockProps(block);
    if (props?.text && typeof props.text === "string") return props.text;
    if (props?.content && typeof props.content === "string")
        return props.content;
    if (props?.code && typeof props.code === "string") return props.code;

    return "";
}

/**
 * Convert BlockNote blocks to searchable markdown for Algolia.
 * ponytail: mermaid/svg source omitted — not useful for search and blows the 10KB record limit.
 */
export function convertBlocksToAlgoliaMarkdown(blocks: LocalBlock[]): string {
    if (!blocks || blocks.length === 0) {
        return "";
    }

    const lines: string[] = [];

    for (const block of blocks) {
        // ponytail: persisted JSON may include legacy block type names outside LocalBlock union
        const type = block.type as string;
        const content = extractBlockTextContent(block);
        const props = blockProps(block);

        switch (type) {
            case "heading": {
                const level =
                    typeof props?.level === "number" ? props.level : 1;
                lines.push(`${"#".repeat(level)} ${content}`);
                lines.push("");
                break;
            }

            case "paragraph":
                lines.push(content);
                lines.push("");
                break;

            case "bulletListItem":
                lines.push(`- ${content}`);
                if (block.children && block.children.length > 0) {
                    const childMarkdown = convertBlocksToAlgoliaMarkdown(
                        block.children
                    );
                    const indented = childMarkdown
                        .split("\n")
                        .map((line) => (line ? `  ${line}` : ""))
                        .join("\n");
                    lines.push(indented);
                }
                break;

            case "numberedListItem":
                lines.push(`1. ${content}`);
                if (block.children && block.children.length > 0) {
                    const childMarkdown = convertBlocksToAlgoliaMarkdown(
                        block.children
                    );
                    const indented = childMarkdown
                        .split("\n")
                        .map((line) => (line ? `  ${line}` : ""))
                        .join("\n");
                    lines.push(indented);
                }
                break;

            case "checkListItem": {
                const checked = props?.checked ? "x" : " ";
                lines.push(`- [${checked}] ${content}`);
                break;
            }

            case "quote":
                lines.push(`> ${content}`);
                lines.push("");
                break;

            case "code":
            case "codeBlock": {
                const language = String(props?.language ?? "");
                if (isMermaidLanguage(language)) {
                    lines.push("[Mermaid]");
                    lines.push("");
                    break;
                }
                if (isSvgLanguage(language)) {
                    lines.push("[SVG]");
                    lines.push("");
                    break;
                }
                lines.push(`\`\`\`${language}`);
                lines.push(content);
                lines.push("```");
                lines.push("");
                break;
            }

            case "table":
                lines.push("[Table]");
                lines.push("");
                break;

            case "enhancedImage":
            case "image": {
                const imageUrl = props?.url || props?.src || "";
                const imageAlt = props?.alt || props?.caption || "image";
                if (imageUrl) {
                    lines.push(`![${imageAlt}](${imageUrl})`);
                    lines.push("");
                }
                break;
            }

            case "enhancedVideo":
            case "video": {
                const videoUrl = props?.url || props?.src || "";
                if (videoUrl) {
                    lines.push(`[Video: ${videoUrl}]`);
                    lines.push("");
                }
                break;
            }

            case "enhancedAudio":
            case "audio": {
                const audioUrl = props?.url || props?.src || "";
                if (audioUrl) {
                    lines.push(`[Audio: ${audioUrl}]`);
                    lines.push("");
                }
                break;
            }

            case "enhancedFile":
            case "file": {
                const fileUrl = props?.url || props?.src || "";
                const fileName = props?.name || "file";
                if (fileUrl) {
                    lines.push(`[File: ${fileName}](${fileUrl})`);
                    lines.push("");
                }
                break;
            }

            case "mermaid":
                lines.push("[Mermaid]");
                lines.push("");
                break;

            case "svg":
                lines.push("[SVG]");
                lines.push("");
                break;

            default:
                if (content) {
                    lines.push(content);
                    lines.push("");
                }
        }
    }

    return lines.join("\n").trim();
}

/**
 * Algolia index object interface
 */
export interface AlgoliaArticle extends Record<string, unknown> {
    objectID: string;
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    locale: string;
    content: string;
    updatedAt?: Date;
}

/**
 * Algolia Search Service
 * Responsible for syncing article data to Algolia search platform
 */
class AlgoliaSearchService {
    private client: SearchClient | null = null;
    private indexName: string;
    private isEnabled: boolean | undefined;

    constructor() {
        const config = systemConfigService.readConfigSync();
        const algoliaConfig = config?.services.algolia;

        const appId = algoliaConfig?.appId;
        const apiKey = algoliaConfig?.apiKey;
        this.indexName = algoliaConfig?.indexName || "articles";

        // Check if all required configuration is provided
        this.isEnabled =
            algoliaConfig?.enabled && !!(appId && apiKey && this.indexName);

        if (this.isEnabled && appId && apiKey) {
            this.client = algoliasearch(appId, apiKey);
        } else if (algoliaConfig?.enabled) {
            console.warn(
                "Algolia search service is enabled but missing configuration (appId, apiKey, or indexName)."
            );
        }
    }

    /**
     * Convert Article to Algolia index object
     */
    private articleToAlgoliaObject(article: Article): AlgoliaArticle {
        if (!article.id) {
            throw new Error("Article ID is required for Algolia sync");
        }

        const markdownContent = convertBlocksToAlgoliaMarkdown(
            article.content as LocalBlock[]
        );
        return {
            objectID: article.id,
            slug: article.slug,
            title: article.title,
            summary: article.summary,
            tags: article.tags,
            locale: article.locale,
            content: markdownContent,
            updatedAt: article.updatedAt,
        };
    }

    private getClient(): SearchClient {
        if (!this.client) {
            throw new Error("Algolia client is not configured");
        }
        return this.client;
    }

    /**
     * Create or update article to Algolia
     * Only sync when article is published
     * @param article Article object
     */
    async saveArticle(article: Article): Promise<void> {
        if (!this.isEnabled) return;

        // Only sync published articles to Algolia
        if (!article.published) {
            console.log(
                `Article ${article.id} is not published, skipping Algolia sync`
            );
            return;
        }

        try {
            const algoliaObject = this.articleToAlgoliaObject(article);
            await this.getClient().saveObject({
                indexName: this.indexName,
                body: algoliaObject,
            });
            console.log(`Article ${article.id} saved to Algolia successfully`);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes("Record is too big")
            ) {
                console.log("Handling oversized record by truncating content");
                const algoliaObject = this.articleToAlgoliaObject(article);
                algoliaObject.content = "";
                this.getClient()
                    .saveObject({
                    indexName: this.indexName,
                    body: algoliaObject,
                })
                    .then(() => {
                        console.log(
                            `Article ${article.id} with truncated content saved to Algolia successfully`
                        );
                    })
                    .catch((err) => {
                        console.error(
                            `Failed to save truncated article ${article.id} to Algolia:`,
                            err
                        );
                        throw err;
                    });
            } else {
                console.error(
                    `Failed to save article ${article.id} to Algolia:`,
                    error
                );
                throw error;
            }
        }
    }

    /**
     * Update article to Algolia
     * Delete if article becomes unpublished; otherwise update
     * @param article Article object
     */
    async updateArticle(article: Article): Promise<void> {
        if (!this.isEnabled) return;

        try {
            // If article becomes unpublished, remove from Algolia
            if (!article.published) {
                if (!article.id) {
                    throw new Error(
                        "Article ID is required to remove from Algolia"
                    );
                }
                await this.deleteArticle(article.id);
                console.log(
                    `Article ${article.id} unpublished, removed from Algolia`
                );
                return;
            }
            this.saveArticle(article);
            console.log(
                `Article ${article.id} updated in Algolia successfully`
            );
        } catch (error) {
            console.error(
                `Failed to update article ${article.id} in Algolia:`,
                error
            );
            throw error;
        }
    }

    /**
     * Delete article from Algolia
     * @param articleId Article ID
     */
    async deleteArticle(articleId: string): Promise<void> {
        if (!this.isEnabled) return;

        try {
            await this.getClient().deleteObject({
                indexName: this.indexName,
                objectID: articleId,
            });
            console.log(
                `Article ${articleId} deleted from Algolia successfully`
            );
        } catch (error) {
            console.error(
                `Failed to delete article ${articleId} from Algolia:`,
                error
            );
            throw error;
        }
    }

    /**
     * Batch save articles to Algolia
     * @param articles Articles array
     */
    async saveArticles(articles: Article[]): Promise<void> {
        if (!this.isEnabled) return;

        try {
            // Only save published articles
            const publishedArticles = articles.filter(
                (article) => article.published
            );

            if (publishedArticles.length === 0) {
                console.log("No published articles to sync to Algolia");
                return;
            }

            const algoliaObjects = publishedArticles.map((article) =>
                this.articleToAlgoliaObject(article)
            );

            await this.getClient().saveObjects({
                indexName: this.indexName,
                objects: algoliaObjects,
            });

            console.log(
                `${publishedArticles.length} articles saved to Algolia successfully`
            );
        } catch (error) {
            console.error("Failed to save articles to Algolia:", error);
            throw error;
        }
    }

    /**
     * Batch delete articles
     * @param articleIds Article IDs array
     */
    async deleteArticles(articleIds: string[]): Promise<void> {
        if (!this.isEnabled) return;

        try {
            await this.getClient().deleteObjects({
                indexName: this.indexName,
                objectIDs: articleIds,
            });
            console.log(
                `${articleIds.length} articles deleted from Algolia successfully`
            );
        } catch (error) {
            console.error("Failed to delete articles from Algolia:", error);
            throw error;
        }
    }

    /**
     * Clear index
     */
    async clearIndex(): Promise<void> {
        if (!this.isEnabled) return;

        try {
            await this.getClient().clearObjects({
                indexName: this.indexName,
            });
            console.log(`Algolia index ${this.indexName} cleared successfully`);
        } catch (error) {
            console.error("Failed to clear Algolia index:", error);
            throw error;
        }
    }
}

export const algoliaSearchService = new AlgoliaSearchService();
