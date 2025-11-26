"use client";

import React from "react";
import { useTranslations } from "next-intl";
import GoHomeOnErrorButtons from "@/components/go-home-buttons";
import { container } from "@/lib/style-classes";

interface SlugNotFoundProps {
    slug: string;
    locale: string;
}

export default function SlugNotFound({ slug, locale }: SlugNotFoundProps) {
    const t = useTranslations("errors");

    return (
        <div className={`${container.messagePage} space-y-6 pt-10`}>
            <div className="flex justify-center">
                <div className="relative">
                    <svg
                        className="h-24 w-24 text-orange-500 dark:text-orange-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        404
                    </div>
                </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {t("articleNotFound")}
            </h1>

            <div className="mb-8 space-y-4">
                <div className="mx-auto w-full max-w-xs rounded-lg bg-gray-100 p-4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl dark:bg-gray-800">
                    <p className="mb-2 text-left text-sm text-gray-500 dark:text-gray-400">
                        {t("errorArticleIdentifier")}
                    </p>
                    <code className="font-mono text-lg font-semibold break-all text-red-600 dark:text-red-400">
                        {slug}
                    </code>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                    {t("articleNotExists")}
                </p>
            </div>

            <div className="space-y-6">
                <h2 className="mb-4 text-left text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {t("tryOtherOptions")}
                </h2>
                <GoHomeOnErrorButtons locale={locale} />
            </div>
        </div>
    );
}
