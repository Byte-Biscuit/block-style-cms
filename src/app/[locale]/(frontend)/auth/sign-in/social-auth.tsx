"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/auth-client";
import { button } from "@/lib/style-classes";
import { GitHubIcon, GoogleIcon, LoadingSpinner } from "@/components/icons";

interface SocialAuthProps {
    onError: (message: string) => void;
}

interface AuthMethodsConfig {
    github: { enabled: boolean };
    google: { enabled: boolean };
    passkey: { enabled: boolean };
}

export function SocialAuth({ onError }: SocialAuthProps) {
    const [isLoading, setIsLoading] = useState({
        google: false,
        github: false,
    });
    const [authMethods, setAuthMethods] = useState<AuthMethodsConfig | null>(
        null
    );
    const [isConfigLoading, setIsConfigLoading] = useState(true);
    const t = useTranslations("web.auth.login");

    // Fetch authentication methods configuration on mount
    useEffect(() => {
        const fetchAuthMethods = async () => {
            try {
                const response = await fetch("/api/auth/methods");
                if (response.ok) {
                    const data = await response.json();
                    setAuthMethods(data);
                } else {
                    // Fallback to default config
                    setAuthMethods({
                        github: { enabled: false },
                        google: { enabled: false },
                        passkey: { enabled: false },
                    });
                }
            } catch (error) {
                console.error("Failed to fetch auth methods:", error);
                // Fallback to default config
                setAuthMethods({
                    github: { enabled: false },
                    google: { enabled: false },
                    passkey: { enabled: false },
                });
            } finally {
                setIsConfigLoading(false);
            }
        };

        fetchAuthMethods();
    }, []);

    const handleSocialSignIn = async (provider: "GitHub" | "Google") => {
        const providerKey = provider.toLowerCase() as "github" | "google";
        setIsLoading((prev) => ({ ...prev, [providerKey]: true }));
        onError("");

        try {
            await authClient.signIn.social({
                provider: providerKey,
                callbackURL: "/m",
                errorCallbackURL: "/auth/error",
            });
        } catch {
            onError(
                t("error.with", {
                    provider: provider,
                })
            );
        } finally {
            setIsLoading((prev) => ({ ...prev, [providerKey]: false }));
        }
    };

    // Show loading state while fetching configuration
    if (isConfigLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    // Check if any social auth method is enabled
    const hasAnySocialAuth =
        authMethods?.github.enabled || authMethods?.google.enabled;

    // If no social auth methods are enabled, don't render anything
    if (!hasAnySocialAuth) {
        return null;
    }

    return (
        <>
            {/* Divider with "OR" */}
            <div className="relative flex items-center py-2">
                <div className="grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="mx-4 shrink text-sm text-gray-500 dark:text-gray-400">
                    {t("divider")}
                </span>
                <div className="grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <div className="space-y-3">
                {authMethods?.github.enabled && (
                    <button
                        className={`${button.secondary} w-full space-x-3`}
                        onClick={() => handleSocialSignIn("GitHub")}
                        disabled={isLoading.github}
                    >
                        {isLoading.github ? <LoadingSpinner /> : <GitHubIcon />}
                        <span>{t("signWith", { provider: "GitHub" })}</span>
                    </button>
                )}

                {authMethods?.google.enabled && (
                    <button
                        className={`${button.secondary} w-full space-x-3`}
                        onClick={() => handleSocialSignIn("Google")}
                        disabled={isLoading.google}
                    >
                        {isLoading.google ? <LoadingSpinner /> : <GoogleIcon />}
                        <span>{t("signWith", { provider: "Google" })}</span>
                    </button>
                )}
            </div>
        </>
    );
}
