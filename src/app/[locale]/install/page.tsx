"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import InstallWizard from "./components/install-wizard";

/**
 * Installation Page
 * 初始化安装页面
 *
 * This page is only accessible when the system has not been initialized.
 * After successful initialization, users will be redirected to the login page.
 */
export default function InstallPage() {
    const [isClient, setIsClient] = useState(false);
    const locale = useLocale();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading...
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
