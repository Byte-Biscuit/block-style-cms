import { algoliasearch, type SearchClient } from 'algoliasearch';
import type { Article } from '@/types/article';

/**
 * BlockNote block type definition
 */
interface BlockNoteBlock {
    type: string;
    content?: BlockNoteContent[];
    props?: Record<string, unknown>;
    children?: BlockNoteBlock[];
    text?: string;
}

interface BlockNoteContent {
    type?: string;
    text?: string;
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
    private isEnabled: boolean;

    constructor() {
        const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
        const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
        this.indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'articles';

        // Check if all required environment variables are configured
        this.isEnabled = !!(appId && apiKey && this.indexName);

        if (this.isEnabled && appId && apiKey) {
            this.client = algoliasearch(appId, apiKey);
        } else {
            console.warn('Algolia search service is disabled. Please check environment variables: ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_INDEX_NAME');
        }
    }

    /**
     * Convert BlockNote content to Markdown format
     * @param blocks BlockNote blocks array
     * @returns Markdown formatted string
     */
    private convertBlocksToMarkdown(blocks: BlockNoteBlock[]): string {
        if (!blocks || blocks.length === 0) {
            return '';
        }

        const lines: string[] = [];

        for (const block of blocks) {
            const type = block.type;
            const content = this.extractTextContent(block);

            switch (type) {
                case 'heading':
                    const level = typeof block.props?.level === 'number' ? block.props.level : 1;
                    lines.push(`${'#'.repeat(level)} ${content}`);
                    lines.push('');
                    break;

                case 'paragraph':
                    lines.push(content);
                    lines.push('');
                    break;

                case 'bulletListItem':
                    lines.push(`- ${content}`);
                    if (block.children && block.children.length > 0) {
                        const childMarkdown = this.convertBlocksToMarkdown(block.children);
                        const indented = childMarkdown.split('\n').map(line => line ? `  ${line}` : '').join('\n');
                        lines.push(indented);
                    }
                    break;

                case 'numberedListItem':
                    lines.push(`1. ${content}`);
                    if (block.children && block.children.length > 0) {
                        const childMarkdown = this.convertBlocksToMarkdown(block.children);
                        const indented = childMarkdown.split('\n').map(line => line ? `  ${line}` : '').join('\n');
                        lines.push(indented);
                    }
                    break;

                case 'checkListItem':
                    const checked = block.props?.checked ? 'x' : ' ';
                    lines.push(`- [${checked}] ${content}`);
                    break;

                case 'quote':
                    lines.push(`> ${content}`);
                    lines.push('');
                    break;

                case 'code':
                    const language = block.props?.language || '';
                    lines.push(`\`\`\`${language}`);
                    lines.push(content);
                    lines.push('```');
                    lines.push('');
                    break;

                case 'table':
                    // Simplified table handling
                    lines.push('[Table]');
                    lines.push('');
                    break;

                case 'enhancedImage':
                case 'image':
                    const imageUrl = block.props?.url || block.props?.src || '';
                    const imageAlt = block.props?.alt || block.props?.caption || 'image';
                    if (imageUrl) {
                        lines.push(`![${imageAlt}](${imageUrl})`);
                        lines.push('');
                    }
                    break;

                case 'enhancedVideo':
                case 'video':
                    const videoUrl = block.props?.url || block.props?.src || '';
                    if (videoUrl) {
                        lines.push(`[Video: ${videoUrl}]`);
                        lines.push('');
                    }
                    break;

                case 'enhancedAudio':
                case 'audio':
                    const audioUrl = block.props?.url || block.props?.src || '';
                    if (audioUrl) {
                        lines.push(`[Audio: ${audioUrl}]`);
                        lines.push('');
                    }
                    break;

                case 'enhancedFile':
                case 'file':
                    const fileUrl = block.props?.url || block.props?.src || '';
                    const fileName = block.props?.name || 'file';
                    if (fileUrl) {
                        lines.push(`[File: ${fileName}](${fileUrl})`);
                        lines.push('');
                    }
                    break;

                case 'mermaid':
                    lines.push('```mermaid');
                    lines.push(content);
                    lines.push('```');
                    lines.push('');
                    break;

                default:
                    // Other types, extract text content
                    if (content) {
                        lines.push(content);
                        lines.push('');
                    }
            }
        }

        return lines.join('\n').trim();
    }

    /**
     * Extract text content from BlockNote block
     */
    private extractTextContent(block: BlockNoteBlock): string {
        if (!block) return '';

        // If has content array (rich text content)
        if (block.content && Array.isArray(block.content)) {
            return block.content
                .map((item: BlockNoteContent) => {
                    if (typeof item === 'string') return item;
                    if (item.type === 'text') return item.text || '';
                    if (item.text) return item.text;
                    return '';
                })
                .join('');
        }

        // If has direct text property
        if (block.text) return block.text;

        // If in props
        if (block.props?.text && typeof block.props.text === 'string') return block.props.text;
        if (block.props?.content && typeof block.props.content === 'string') return block.props.content;

        return '';
    }

    /**
     * Convert Article to Algolia index object
     */
    private articleToAlgoliaObject(article: Article): AlgoliaArticle {
        const markdownContent = this.convertBlocksToMarkdown(article.content as BlockNoteBlock[]);
        return {
            objectID: article.id!,
            slug: article.slug,
            title: article.title,
            summary: article.summary,
            tags: article.tags,
            locale: article.locale,
            content: markdownContent,
            updatedAt: article.updatedAt,
        };
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
            console.log(`Article ${article.id} is not published, skipping Algolia sync`);
            return;
        }

        try {
            const algoliaObject = this.articleToAlgoliaObject(article);
            await this.client!.saveObject({
                indexName: this.indexName,
                body: algoliaObject,
            });
            console.log(`Article ${article.id} saved to Algolia successfully`);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Record is too big')) {
                console.log("Handling oversized record by truncating content");
                const algoliaObject = this.articleToAlgoliaObject(article);
                algoliaObject.content = "";
                this.client!.saveObject({
                    indexName: this.indexName,
                    body: algoliaObject,
                }).then(() => {
                    console.log(`Article ${article.id} with truncated content saved to Algolia successfully`);
                }).catch(err => {
                    console.error(`Failed to save truncated article ${article.id} to Algolia:`, err);
                    throw err;
                });
            } else {
                console.error(`Failed to save article ${article.id} to Algolia:`, error);
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
                await this.deleteArticle(article.id!);
                console.log(`Article ${article.id} unpublished, removed from Algolia`);
                return;
            }
            this.saveArticle(article);
            console.log(`Article ${article.id} updated in Algolia successfully`);
        } catch (error) {
            console.error(`Failed to update article ${article.id} in Algolia:`, error);
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
            await this.client!.deleteObject({
                indexName: this.indexName,
                objectID: articleId,
            });
            console.log(`Article ${articleId} deleted from Algolia successfully`);
        } catch (error) {
            console.error(`Failed to delete article ${articleId} from Algolia:`, error);
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
            const publishedArticles = articles.filter(article => article.published);

            if (publishedArticles.length === 0) {
                console.log('No published articles to sync to Algolia');
                return;
            }

            const algoliaObjects = publishedArticles.map(article =>
                this.articleToAlgoliaObject(article)
            );

            await this.client!.saveObjects({
                indexName: this.indexName,
                objects: algoliaObjects,
            });

            console.log(`${publishedArticles.length} articles saved to Algolia successfully`);
        } catch (error) {
            console.error('Failed to save articles to Algolia:', error);
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
            await this.client!.deleteObjects({
                indexName: this.indexName,
                objectIDs: articleIds,
            });
            console.log(`${articleIds.length} articles deleted from Algolia successfully`);
        } catch (error) {
            console.error('Failed to delete articles from Algolia:', error);
            throw error;
        }
    }

    /**
     * Clear index
     */
    async clearIndex(): Promise<void> {
        if (!this.isEnabled) return;

        try {
            await this.client!.clearObjects({
                indexName: this.indexName,
            });
            console.log(`Algolia index ${this.indexName} cleared successfully`);
        } catch (error) {
            console.error('Failed to clear Algolia index:', error);
            throw error;
        }
    }
}

export const algoliaSearchService = new AlgoliaSearchService();

/**
 * Failed to update article a61f2cc8-ded2-4913-8b59-2fdbf6e763ef in Algolia: Error [ApiError]: Record is too big size=11226/10000 bytes. Please have a look at https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data/in-depth/index-and-records-size-and-usage-limitations/#record-size-limits
    at async AlgoliaSearchService.updateArticle (src\lib\services\algolia-search-service.ts:278:13)
    at async ArticleService.updateArticle (src\lib\services\article-service.ts:56:13)
    at async eval (src\app\api\m\articles\route.ts:122:9)
    at async eval (src\lib\with-timing.ts:6:21)
  276 |             // Otherwise update article
  277 |             const algoliaObject = this.articleToAlgoliaObject(article);
> 278 |             await this.client!.saveObject({
      |             ^
  279 |                 indexName: this.indexName,
  280 |                 body: algoliaObject,
  281 |             }); {
  stackTrace: [Array],
  status: 400
}
Error updating article a61f2cc8-ded2-4913-8b59-2fdbf6e763ef: Error [ApiError]: Record is too big size=11226/10000 bytes. Please have a look at https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data/in-depth/index-and-records-size-and-usage-limitations/#record-size-limits
 * 
 */