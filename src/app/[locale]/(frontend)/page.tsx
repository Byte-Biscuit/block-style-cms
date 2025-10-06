import { articleService } from "@/lib/services/article-service";
import { getLocale, getTranslations } from "next-intl/server";
import ArticleItem from "@/components/article-list-item";

export default async function Home() {
    const locale = await getLocale();
    const t = await getTranslations("web.home");
    const latestArticles = await articleService.getArticlesByLocale(locale);

    if (!latestArticles || latestArticles?.length === 0) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {t("emptyTitle")}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t("emptyDescription")}
                    </p>
                </div>
            </div>
        );
    }

    const featuredArticles = latestArticles.slice(0, 3);
    const otherArticles = latestArticles.slice(3);

    return (
        <div className="space-y-12">
            <section>
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {t("title")}
                    </h1>
                    <div className="h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                </div>

                <div className="space-y-4">
                    {featuredArticles.map((article) => (
                        <ArticleItem
                            key={article.id}
                            {...article}
                            className="transform transition-all duration-300 hover:-translate-y-1"
                        />
                    ))}
                </div>
            </section>

            {otherArticles.length > 0 && (
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                            {t("more")}
                        </span>
                    </div>
                </div>
            )}

            {otherArticles.length > 0 && (
                <section>
                    <div className="space-y-4">
                        {otherArticles.map((article) => (
                            <ArticleItem
                                key={article.id}
                                {...article}
                                className="transform transition-all duration-300 hover:-translate-y-1"
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
