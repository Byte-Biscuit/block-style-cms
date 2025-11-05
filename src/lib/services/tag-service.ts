import { ArticleMetadata } from '@/types/article';
import { lruCacheService } from "@/lib/services/lru-cache-service";
import { articleService, ArticleService } from './article-service';
import { Locale } from "@/i18n/config"

/**
 * Tag Service - Manages article tags and tag-article relationships
 */
class TagService {
    private articleService: ArticleService;

    constructor(articleService: ArticleService) {
        this.articleService = articleService;
    }

    /**
     * Get all unique tags for a specific locale
     * Note: Automatically filters out channel tags (tags with format _channel_)
     * 
     * @param locale - Target locale
     * @param publishedOnly - Only include tags from published articles
     * @returns Array of unique tag names (excluding channel tags)
     */
    async getTagsByLocale(locale: Locale, publishedOnly: boolean = true): Promise<string[]> {
        const tagsCacheKey4LocaleKey = `tags_${locale}_key`;
        if (lruCacheService.has(tagsCacheKey4LocaleKey)) {
            return lruCacheService.get(tagsCacheKey4LocaleKey) as string[];
        }
        const articleMetaMap = await this.articleService.getMetadataMap();
        const articleMetas = Object.values(articleMetaMap)
            .flat()
            .filter(article =>
                article.locale === locale &&
                (publishedOnly ? article.published : true)
            );

        const tags = new Set<string>();
        articleMetas.forEach((article) => {
            article.tags?.forEach((tag) => {
                const trimmedTag = tag.trim();
                tags.add(trimmedTag);
            });
        });
        const _tags = Array.from(tags).sort()
        if (_tags.length !== 0) {
            lruCacheService.set(tagsCacheKey4LocaleKey, _tags);
        }
        return _tags;
    }

    /**
     * Get all tags with their associated articles
     * Note: Automatically filters out channel tags (tags with format _channel_)
     * 
     * @param locale - Target locale
     * @param publishedOnly - Only include published articles
     * @returns Map of tag to array of article metadata (excluding channel tags)
     */
    async getTagsWithArticles(
        locale: Locale,
        publishedOnly: boolean = true
    ): Promise<Map<string, ArticleMetadata[]>> {
        const tagsCacheKey4LocaleArticles = `tags_${locale}_articles_key`;
        if (lruCacheService.has(tagsCacheKey4LocaleArticles)) {
            // Correctly deserialize Map from cache
            const cachedData = lruCacheService.get(tagsCacheKey4LocaleArticles) as string;
            const entries = JSON.parse(cachedData) as Array<[string, ArticleMetadata[]]>;
            return new Map(entries);
        }
        const articleMetaMap = await this.articleService.getMetadataMap();
        const articleMetas = Object.values(articleMetaMap)
            .flat()
            .filter(article =>
                article.locale === locale &&
                (publishedOnly ? article.published : true)
            );

        const tagArticleMap = new Map<string, ArticleMetadata[]>();

        articleMetas.forEach((article) => {
            article.tags?.forEach((tag) => {
                const trimmedTag = tag.trim();
                if (!tagArticleMap.has(trimmedTag)) {
                    tagArticleMap.set(trimmedTag, []);
                }
                tagArticleMap.get(trimmedTag)!.push(article);
            });
        });
        // Correctly serialize Map to cache - convert to array first
        if (tagsCacheKey4LocaleArticles.length > 0) {
            lruCacheService.set(tagsCacheKey4LocaleArticles, JSON.stringify(Array.from(tagArticleMap.entries())));
        }
        return tagArticleMap;
    }

    /**
     * Get articles by specific tag
     * @param tag - Tag name
     * @param locale - Target locale
     * @param publishedOnly - Only include published articles
     * @returns Array of article metadata
     */
    async getArticlesByTag(
        tag: string,
        locale: Locale,
        publishedOnly: boolean = true
    ): Promise<ArticleMetadata[]> {
        const tagArticleMap = await this.getTagsWithArticles(locale, publishedOnly);
        return tagArticleMap.get(tag.trim()) || [];
    }

    /**
     * Get tag statistics with article counts
     * @param locale - Target locale
     * @param publishedOnly - Only include published articles
     * @returns Array of tag statistics sorted by article count (descending)
     */
    async getTagStatistics(
        locale: Locale,
        publishedOnly: boolean = true
    ): Promise<Array<{ tag: string; count: number; articles: ArticleMetadata[] }>> {
        const tagArticleMap = await this.getTagsWithArticles(locale, publishedOnly);

        const statistics = Array.from(tagArticleMap.entries()).map(([tag, articles]) => ({
            tag,
            count: articles.length,
            articles
        }));

        // Sort by count (descending), then by tag name (ascending)
        return statistics.sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            return a.tag.localeCompare(b.tag);
        });
    }

    /**
     * Get related tags (tags that frequently appear together)
     * @param tag - Source tag
     * @param locale - Target locale
     * @param limit - Maximum number of related tags to return
     * @returns Array of related tags with occurrence count
     */
    async getRelatedTags(
        tag: string,
        locale: Locale,
        limit: number = 5
    ): Promise<Array<{ tag: string; count: number }>> {
        const articles = await this.getArticlesByTag(tag, locale);
        const relatedTagCount = new Map<string, number>();

        articles.forEach(article => {
            article.tags?.forEach(t => {
                const trimmedTag = t.trim();
                if (trimmedTag !== tag.trim()) {
                    relatedTagCount.set(
                        trimmedTag,
                        (relatedTagCount.get(trimmedTag) || 0) + 1
                    );
                }
            });
        });

        return Array.from(relatedTagCount.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * Check if a tag exists in a specific locale
     * @param tag - Tag name to check
     * @param locale - Target locale
     * @returns True if tag exists
     */
    async tagExists(tag: string, locale: Locale): Promise<boolean> {
        const tags = await this.getTagsByLocale(locale);
        return tags.includes(tag.trim());
    }



    /**
     * Check if a tag is a channel tag
     * Channel tags are used for internal categorization/navigation (format: _channel_)
     * 
     * @param tag - Tag name to check
     * @returns true if it's a channel tag, false otherwise
     * 
     * @example
     * isChannelTag("_ai_") // true
     * isChannelTag("_education_") // true
     * isChannelTag("react") // false
     */
    isChannelTag(tag: string): boolean {
        const trimmedTag = tag.trim();
        // Filter out channel tags (format: _channel_)
        if (trimmedTag.startsWith("_") && trimmedTag.endsWith("_")) {
            return true;
        }
        return false;
    }
}

export const tagService = new TagService(articleService);
export { TagService };