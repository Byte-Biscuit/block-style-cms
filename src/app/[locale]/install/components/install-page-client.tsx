"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import InstallWizard from "./install-wizard";

/**
 * Client-side content for the installation page
 */
export default function InstallPageClient() {
    const [isClient, setIsClient] = useState(false);
    const locale = useLocale();
    const t = useTranslations("configuration.page");

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        {t("loading")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <InstallWizard
                onComplete={() => {
                    console.log(
                        "[Install] Installation complete, redirecting to sign-in"
                    );
                    // Use window.location.href to force a full page reload
                    // This ensures the layout re-checks isInitialized() with fresh data
                    window.location.href = `/${locale}/auth/sign-in`;
                }}
            />
        </div>
    );
}
