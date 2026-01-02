"use client";
import React from "react";
import Link from "@/components/link";
import { useTranslations } from "next-intl";
import GoHomeOnErrorButtons from "@/components/go-home-buttons";
import { ArticleMetadata } from "@/types/article";
import { getLanguageDisplayName } from "@/i18n/config";
import { container } from "@/lib/style-classes";

interface ArticleNotFoundProps {
    slug: string;
    currentLocale: string;
    email: string;
    availableLanguages?: ArticleMetadata[];
}

export default function ArticleNotFound({
    slug,
    currentLocale,
    email,
    availableLanguages = [],
}: ArticleNotFoundProps) {
    const t = useTranslations("errors");
    return (
        <div className={`${container.messagePage} space-y-6 pt-10`}>
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("articleNotFound")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                {t("articleNotInLanguage", {
                    slug: slug,
                    language: getLanguageDisplayName(currentLocale),
                })}
            </p>

            {availableLanguages.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-left text-lg font-medium text-gray-900 dark:text-gray-100">
                        {t("availableLanguages")}
                    </h3>
                    <div className="space-y-3">
                        {availableLanguages.map((article) => (
                            <Link
                                key={article.locale}
                                href={`/${article.locale}/articles/${slug}`}
                                className="hover:border-primary-500 dark:hover:border-primary-400 block rounded-md border border-gray-200 p-3 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {article.title}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {t("language")}:{" "}
                                            {getLanguageDisplayName(
                                                article.locale
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-primary-500 dark:text-primary-400">
                                        →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <GoHomeOnErrorButtons locale={currentLocale} />

            <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("contactSupport", {
                    email: email || "",
                })}
            </div>
        </div>
    );
}
