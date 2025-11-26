"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { button, container } from "@/lib/style-classes";
import { GitHubIcon, GoogleIcon, LoadingSpinner } from "@/components/icons";

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState({
        google: false,
        github: false,
    });
    const [error, setError] = useState("");
    const t = useTranslations("web.auth.login");

    const handleSocialSignIn = async (provider: "GitHub" | "Google") => {
        setIsLoading({ ...isLoading, [provider]: true });
        setError("");

        try {
            switch (provider) {
                case "GitHub":
                    await authClient.signIn.social({
                        provider: "github",
                        callbackURL: "/m",
                        errorCallbackURL: "/auth/error",
                    });
                    break;
                case "Google":
                    await authClient.signIn.social({
                        provider: "google",
                        callbackURL: "/m",
                        errorCallbackURL: "/auth/error",
                    });
                    break;
            }
        } catch {
            setError(
                t("error.with", {
                    provider: provider,
                })
            );
        } finally {
            setIsLoading({ ...isLoading, [provider]: false });
        }
    };

    return (
        <div className={`${container.messagePage} flex-col space-y-8 pt-10`}>
            <div className="mx-auto flex w-full items-center justify-center">
                {/* Sign-in Icon */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-transparent bg-blue-100 dark:border-blue-500/30 dark:bg-blue-900/20">
                    <svg
                        className="h-10 w-10 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>
            </div>
            {/* Title */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {t("title")}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t("subtitle")}
                </p>
            </div>

            {/* Login Buttons */}
            <div className="mx-auto w-full max-w-sm space-y-4">
                <button
                    className={`${button.secondary} w-full justify-start space-x-3`}
                    onClick={() => handleSocialSignIn("GitHub")}
                    disabled={isLoading.github}
                >
                    {isLoading.github ? <LoadingSpinner /> : <GitHubIcon />}
                    <span>{t("signWith", { provider: "GitHub" })}</span>
                </button>

                <button
                    className={`${button.secondary} w-full justify-start space-x-3`}
                    onClick={() => handleSocialSignIn("Google")}
                    disabled={isLoading.google}
                >
                    {isLoading.google ? <LoadingSpinner /> : <GoogleIcon />}
                    <span>{t("signWith", { provider: "Google" })}</span>
                </button>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-900/20">
                        <div className="flex items-center space-x-2">
                            <svg
                                className="h-5 w-5 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div className="text-left">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {t("error.title")}
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
