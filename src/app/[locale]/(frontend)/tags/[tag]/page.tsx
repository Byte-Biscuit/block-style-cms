import { tagService } from "@/lib/services/tag-service";
import ArticleItem from "@/components/article-list-item";
import Link from "@/components/link";
import { Locale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

export default async function TagDetailPage({
    params,
}: {
    params: Promise<{ locale: string; tag: string }>;
}) {
    const { locale, tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    const t = await getTranslations("web.tags");

    // Fetch articles with the specified tag
    const articles = await tagService.getArticlesByTag(
        decodedTag,
        locale as Locale,
        true
    );

    // Sort articles by update time (newest first)
    const sortedArticles = articles.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt!).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt!).getTime();
        return dateB - dateA;
    });

    return (
        <div className="container mx-auto max-w-6xl px-4 py-16">
            {/* Breadcrumb & Header */}
            <div className="mb-12">
                <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Link
                        href={`/${locale}/tags`}
                        className="transition-colors hover:text-pink-500 dark:hover:text-pink-400"
                    >
                        {t("title")}
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {decodedTag}
                    </span>
                </nav>

                <div className="flex items-baseline gap-4">
                    <h1 className="text-5xl font-bold text-pink-500 uppercase dark:text-pink-400">
                        {decodedTag}
                    </h1>
                    <span className="text-2xl text-gray-500 dark:text-gray-400">
                        ({t("articleCount", { count: articles.length })})
                    </span>
                </div>
            </div>

            {/* Articles List */}
            {sortedArticles.length > 0 ? (
                <div className="space-y-6">
                    {sortedArticles.map((article) => (
                        <ArticleItem key={article.id} {...article} />
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center">
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        {t("noArticles")}
                    </p>
                    <Link
                        href={`/${locale}/tags`}
                        className="mt-4 inline-block text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300"
                    >
                        ← {t("backToAllTags")}
                    </Link>
                </div>
            )}
        </div>
    );
}

// Generate static params for all tags at build time
export async function generateStaticParams({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const tagMap = await tagService.getTagsWithArticles(locale as Locale, true);
    const tags = Array.from(tagMap.keys());

    return tags.map((tag) => ({
        tag: encodeURIComponent(tag),
    }));
}
