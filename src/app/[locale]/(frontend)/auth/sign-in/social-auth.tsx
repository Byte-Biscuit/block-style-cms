"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/auth-client";
import { button } from "@/lib/style-classes";
import { GitHubIcon, GoogleIcon, LoadingSpinner } from "@/components/icons";

interface SocialAuthProps {
    onError: (message: string) => void;
}

export function SocialAuth({ onError }: SocialAuthProps) {
    const [isLoading, setIsLoading] = useState({
        google: false,
        github: false,
    });
    const t = useTranslations("web.auth.login");

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

    return (
        <div className="space-y-3">
            <button
                className={`${button.secondary} w-full space-x-3`}
                onClick={() => handleSocialSignIn("GitHub")}
                disabled={isLoading.github}
            >
                {isLoading.github ? <LoadingSpinner /> : <GitHubIcon />}
                <span>{t("signWith", { provider: "GitHub" })}</span>
            </button>

            <button
                className={`${button.secondary} w-full space-x-3`}
                onClick={() => handleSocialSignIn("Google")}
                disabled={isLoading.google}
            >
                {isLoading.google ? <LoadingSpinner /> : <GoogleIcon />}
                <span>{t("signWith", { provider: "Google" })}</span>
            </button>
        </div>
    );
}
