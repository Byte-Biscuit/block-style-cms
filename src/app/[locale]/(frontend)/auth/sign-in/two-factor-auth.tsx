"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/auth-client";
import { button } from "@/lib/style-classes";
import { LoadingSpinner } from "@/components/icons";

interface TwoFactorAuthProps {
    onCancel: () => void;
    onError: (message: string) => void;
}

export function TwoFactorAuth({ onCancel, onError }: TwoFactorAuthProps) {
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [is2FALoading, setIs2FALoading] = useState(false);
    const t = useTranslations("web.auth.login.twoFactor");

    const handleTwoFactorVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!twoFactorCode || twoFactorCode.length !== 6) {
            onError(t("error.required"));
            return;
        }

        setIs2FALoading(true);
        onError("");

        try {
            const result = await authClient.twoFactor.verifyTotp({
                code: twoFactorCode,
            });

            if (result.error) {
                onError(result.error.message || t("error.invalid"));
                return;
            }

            console.log("2FA verification successful:", result);
            window.location.href = "/m";
        } catch (err) {
            console.error("2FA verification error:", err);
            onError(t("error.failed"));
        } finally {
            setIs2FALoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {t("title")}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t("subtitle")}
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleTwoFactorVerify}>
                <div>
                    <label
                        htmlFor="twoFactorCode"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t("label")}
                    </label>
                    <input
                        id="twoFactorCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={twoFactorCode}
                        onChange={(e) =>
                            setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="000000"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-2xl tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                        required
                        disabled={is2FALoading}
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    className={`${button.primary} w-full`}
                    disabled={is2FALoading || twoFactorCode.length !== 6}
                >
                    {is2FALoading ? (
                        <>
                            <LoadingSpinner />
                            <span>{t("verifying")}</span>
                        </>
                    ) : (
                        <span>{t("verify")}</span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setTwoFactorCode("");
                        onCancel();
                    }}
                    className={`${button.secondary} w-full`}
                    disabled={is2FALoading}
                >
                    {t("cancel")}
                </button>
            </form>
        </div>
    );
}
