import React from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { articleService } from "@/lib/services/article-service";
import { groupListItems } from "@/components/block-note/universal-block-renderer";
import type { BlockData } from "@/components/block-note/meta";
import ArticleNotFound from "./article-not-found";
import SlugNotFound from "./slug-not-found";
import { getDefaultHeadingClasses } from "@/lib/tw-utils";
import I18NLocaleTime from "@/components/i18n-time";

type Props = {
    params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
    const { slug, locale } = await params;
    const t = await getTranslations();
    const articles = await articleService.getArticlesBySlug(slug);
    const article = articles?.find((a) => a.locale === locale);

    if (!article) {
        return {
            title: t("errors.articleNotFound"),
            description: t("errors.articleNotExists"),
        };
    }

    return {
        title: article.title,
        description: article.summary,
    };
}

export default async function ArticleDetailPage({ params }: Props) {
    const { slug, locale } = await params;
    const t = await getTranslations();
    const articles = await articleService.getArticlesBySlug(slug);
    // If no articles found with the slug
    if (!articles || articles.length === 0) {
        return <SlugNotFound slug={slug} locale={locale} />;
    }
    const _article = articles.find((a) => a.locale === locale);
    // If no article found in the requested locale
    if (!_article?.id) {
        return (
            <ArticleNotFound
                slug={slug}
                currentLocale={locale}
                availableLanguages={articles}
            />
        );
    }
    const article = await articleService.getArticle(_article.id);
    // If article not found (should not happen)
    if (!article) {
        return (
            <ArticleNotFound
                slug={slug}
                currentLocale={locale}
                availableLanguages={articles}
            />
        );
    }

    return (
        <article className="w-full">
            <header className="space-y-2 pt-4 pb-4 md:space-y-5">
                <h1 className={getDefaultHeadingClasses(1)}>{article.title}</h1>
                <I18NLocaleTime
                    date={article.updatedAt || article.createdAt!}
                    locale={locale}
                    className="text-base leading-6 font-medium"
                />
            </header>
            {article.image && (
                <section className="mb-6 md:mb-8">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
                        <Image
                            src={article.image}
                            alt={article.title || "Article cover"}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                            priority
                        />
                    </div>
                </section>
            )}
            <section className="space-y-2 pb-4 md:space-y-5">
                <h2 className={getDefaultHeadingClasses(2)}>
                    {t("web.article.summary")}
                </h2>
                <p
                    role="note"
                    className="mt-2 rounded-md border-l-4 border-indigo-500/80 bg-gray-50 px-4 py-3 text-lg text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    {article.summary}
                </p>
            </section>

            <section className="space-y-4">
                {Array.isArray(article.content) &&
                article.content.length > 0 ? (
                    groupListItems(article.content as BlockData[])
                ) : (
                    <section className="text-gray-500 italic">
                        No content available
                    </section>
                )}
            </section>
        </article>
    );
}
