"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/auth-client";
import { button } from "@/lib/style-classes";
import { LoadingSpinner } from "@/components/icons";

interface EmailPasswordSignInProps {
    onRequireTwoFactor: () => void;
    onError: (message: string) => void;
}

export function EmailPasswordSignIn({
    onRequireTwoFactor,
    onError,
}: EmailPasswordSignInProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const t = useTranslations("web.auth.login");

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!email || !password) {
            onError(t("error.required"));
            return;
        }

        setIsEmailLoading(true);
        onError("");

        try {
            const result = await authClient.signIn.email({
                email,
                password,
                callbackURL: "/m",
            });

            if (result.error) {
                onError(result.error.message || t("error.invalid"));
                return;
            }

            if (result.data && !result.data.redirect) {
                onRequireTwoFactor();
                onError("");
                return;
            }

            console.log("Email sign-in successful:", result);
        } catch (err) {
            console.error("Email sign-in error:", err);
            onError(t("error.invalid"));
        } finally {
            setIsEmailLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <form className="space-y-4" onSubmit={handleEmailSignIn}>
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t("email")}
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                        required
                        disabled={isEmailLoading}
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t("password")}
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                        required
                        disabled={isEmailLoading}
                    />
                </div>

                <button
                    type="submit"
                    className={`${button.primary} w-full`}
                    disabled={isEmailLoading || !email || !password}
                >
                    {isEmailLoading ? (
                        <>
                            <LoadingSpinner />
                            <span>{t("submitting")}</span>
                        </>
                    ) : (
                        <span>{t("submit")}</span>
                    )}
                </button>
            </form>
        </div>
    );
}
