"use client";
import { useTranslations } from "next-intl";
import GoHomeOnErrorButtons from "@/components/go-home-buttons";
import { container } from "@/lib/style-classes";

export default function NotFound(props: { email?: string } = {}) {
    const t = useTranslations("errors");
    const { email } = props;
    return (
        <div className={`${container.messagePage} space-y-6 pt-30`}>
            <h1 className="font-bold text-6xl text-gray-900 dark:text-gray-100">
                404
            </h1>
            <h2 className="mt-4 font-semibold text-2xl text-gray-900 dark:text-gray-100">
                {t("pageNotFound")}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t("pageNotExists")}
            </p>

            <GoHomeOnErrorButtons />

            <div className="mt-8 text-gray-500 text-xs dark:text-gray-400">
                {t("contactSupport", {
                    email: email || "",
                })}
            </div>
        </div>
    );
}
