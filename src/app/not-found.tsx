"use client";
import { useTranslations } from "next-intl";
import GoHomeOnErrorButtons from "@/components/go-home-buttons";
import { container } from "@/lib/style-classes";

export default function NotFound() {
    const t = useTranslations("errors");
    return (
        <div className={`${container.messagePage} space-y-6 pt-30`}>
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                404
            </h1>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("pageNotFound")}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t("pageNotExists")}
            </p>

            <GoHomeOnErrorButtons />

            <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
                {t("contactSupport", {
                    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
                })}
            </div>
        </div>
    );
}
