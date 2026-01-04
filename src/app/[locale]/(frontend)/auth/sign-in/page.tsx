"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { container } from "@/lib/style-classes";
import { EmailPasswordSignIn } from "./email-password-sign-in";
import { TwoFactorAuth } from "./two-factor-auth";
import { SocialAuth } from "./social-auth";

export default function SignInPage() {
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [error, setError] = useState("");
    const t = useTranslations("web.auth.login");
    const tWeb = useTranslations("web");

    return (
        <div
            className={`${container.messagePage} flex flex-col space-y-8 pt-4`}
        >
            <div className="flex flex-col items-center justify-center">
                {/* Sign-in Icon */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-transparent bg-blue-100 dark:border-blue-500/30 dark:bg-blue-900/20">
                    <Image
                        src="/api/logo"
                        alt={tWeb("title")}
                        width={48}
                        height={48}
                        className="h-12 w-12"
                        priority
                    />
                </div>
                {!showTwoFactor && (
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {t("subtitle")}
                    </p>
                )}
            </div>
            {/* Login Form Container */}
            <div className="mx-auto w-full max-w-md">
                {/* Conditional Rendering: 2FA Form or Email/Password Form */}
                {showTwoFactor ? (
                    <TwoFactorAuth
                        onCancel={() => {
                            setShowTwoFactor(false);
                            setError("");
                        }}
                        onError={setError}
                    />
                ) : (
                    <div className="space-y-6">
                        {/* Email Password Sign In */}
                        <EmailPasswordSignIn
                            onRequireTwoFactor={() => setShowTwoFactor(true)}
                            onError={setError}
                        />

                        {/* Divider with "OR" */}
                        <div className="relative flex items-center py-2">
                            <div className="grow border-t border-gray-300 dark:border-gray-600"></div>
                            <span className="mx-4 shrink text-sm text-gray-500 dark:text-gray-400">
                                {t("divider")}
                            </span>
                            <div className="grow border-t border-gray-300 dark:border-gray-600"></div>
                        </div>

                        {/* Social Auth */}
                        <SocialAuth onError={setError} />
                    </div>
                )}

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
