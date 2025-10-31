import type { MetadataRoute } from 'next';
import { articleService } from '@/lib/services/article-service';

/**
 * Dynamic sitemap generation with ISR
 * Revalidates every hour
 */
// Revalidate every 1 hour
export const revalidate = 3600;
// Pre-render at build time
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio.xiyue.space';

    try {
        // Get metadata map (Record<slug, Article[]>)
        const articleMetadataMap = await articleService.getMetadataMap();

        // ✅ Convert Record to flat array
        const allArticles = Object.values(articleMetadataMap).flat();

        // Filter published articles
        const publishedArticles = allArticles.filter(article => article.published);

        // Generate article URLs
        const articleEntries: MetadataRoute.Sitemap = publishedArticles.map((article) => ({
            url: `${baseUrl}/${article.locale}/articles/${article.slug}`,
            lastModified: article.updatedAt || article.createdAt || new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // Static pages
        const staticEntries: MetadataRoute.Sitemap = [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${baseUrl}/en-US`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${baseUrl}/zh-CN`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${baseUrl}/zh-TW`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
        ];

        console.log(`✅ Generated sitemap with ${publishedArticles.length} published articles`);

        return [...staticEntries, ...articleEntries];
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        // Return minimal sitemap on error
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
            },
        ];
    }
}