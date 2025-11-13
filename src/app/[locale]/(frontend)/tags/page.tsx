import { tagService } from "@/lib/services/tag-service";
import Link from "@/components/link";
import { Locale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

export default async function TagsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations("web.tags");
    // Get all tags with their article counts
    const tagMap = await tagService.getTagsWithArticles(locale as Locale, true);
    // Convert to array and sort by article count (descending)
    const tagsWithCounts = Array.from(tagMap.entries())
        .filter(([tag]) => !tagService.isChannelTag(tag))
        .map(([tag, articles]) => ({
            tag,
            count: articles.length,
        }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="container mx-auto max-w-6xl px-4 py-16">
            <article className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
                {/* Left Side - Page Title */}
                <header className="flex-shrink-0 lg:w-32">
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                        {t("title")}
                    </h1>
                </header>

                {/* Vertical Divider - Hidden on mobile */}
                <div
                    className="hidden h-32 w-px flex-shrink-0 bg-gray-300 lg:block dark:bg-gray-700"
                    role="separator"
                    aria-orientation="vertical"
                />

                {/* Right Side - Tags Cloud */}
                <section className="min-w-0 flex-1 overflow-hidden">
                    {tagsWithCounts.length > 0 ? (
                        <nav
                            aria-label="Tag navigation"
                            className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6"
                        >
                            {tagsWithCounts.map(({ tag, count }) => (
                                <Link
                                    key={tag}
                                    href={`/${locale}/tags/${encodeURIComponent(tag)}`}
                                    className="group inline-flex max-w-full items-center gap-2 break-words transition-colors duration-200"
                                    aria-label={`View ${count} articles tagged with ${tag}`}
                                >
                                    <span className="truncate text-xl font-bold tracking-wide text-pink-500 uppercase group-hover:text-pink-600 sm:text-2xl dark:text-pink-400 dark:group-hover:text-pink-300">
                                        {tag}
                                    </span>
                                    <span className="flex-shrink-0 text-base text-gray-500 sm:text-lg dark:text-gray-400">
                                        ({count})
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {t("noTags")}
                            </p>
                        </div>
                    )}
                </section>
            </article>
        </div>
    );
}
