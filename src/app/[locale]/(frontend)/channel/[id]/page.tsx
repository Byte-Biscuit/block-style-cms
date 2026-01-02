import { systemConfigService } from "@/lib/services/system-config-service";
import { tagService } from "@/lib/services/tag-service";
import ArticleItem from "@/components/article-list-item";
import Link from "@/components/link";
import { Locale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

/**
 * Generate metadata for channel page
 * Based on internationalization configuration
 */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
    const { locale, id } = await params;
    const t = await getTranslations("web");

    // Get title and description from i18n with fallback to ID
    const title = t(`channel.${id}.title`, { defaultValue: id });
    const description = t(`channel.${id}.description`, { defaultValue: "" });

    return {
        title,
        description: description || undefined,
    };
}

export default async function ChannelDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    const t = await getTranslations("web");

    // Get channel config by id
    const channels = await systemConfigService.getChannels();
    const channel = channels.find((c) => c.id === id);

    // If channel not found or not tag type, 404
    if (!channel || channel.type !== "tag" || !channel.tag) {
        notFound();
    }

    // Fetch articles with the channel's tag
    const articles = await tagService.getArticlesByTag(
        channel.tag,
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
        <div className="container mx-auto max-w-6xl">
            {/* Breadcrumb & Header */}
            <div className="mb-12">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-5xl font-bold text-pink-500 dark:text-pink-400">
                        {t(`channel.${channel.id}.title`)}
                    </h1>
                    <span className="text-2xl text-gray-500 dark:text-gray-400">
                        ({t("channel.articleCount", { count: articles.length })}
                        )
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
                        {t("channel.noArticles")}
                    </p>
                    <Link
                        href={`/${locale}`}
                        className="mt-4 inline-block text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300"
                    >
                        {t("channel.backToHome")}
                    </Link>
                </div>
            )}
        </div>
    );
}
