"use client";

import { useTranslations } from "next-intl";

interface WelcomeFormProps {
    onNext: () => void;
}

/**
 * Welcome Form Component
 *
 * Introduction to the installation process and requirements
 */
export default function WelcomeForm({ onNext }: WelcomeFormProps) {
    const t = useTranslations("configuration.welcome");

    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
            <p className="mt-4 text-lg text-gray-600">{t("subtitle")}</p>
            <div className="mt-8 space-y-4 text-left">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900">
                        {t("stepListTitle")}
                    </h3>
                    <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-gray-700">
                        <li>{t("step1")}</li>
                        <li>{t("step2")}</li>
                        <li>{t("step3")}</li>
                        <li>{t("step4")}</li>
                        <li>{t("step5")}</li>
                    </ol>
                </div>
            </div>
            <button
                onClick={onNext}
                className="mt-8 rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-600"
            >
                {t("button")}
            </button>
        </div>
    );
}
