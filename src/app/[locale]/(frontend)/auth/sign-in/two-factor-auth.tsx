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
    const [useBackupCode, setUseBackupCode] = useState(false);
    const t = useTranslations("web.auth.login.twoFactor");

    const handleTwoFactorVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        // 验证码格式：6位数字 或 backup code格式（XXXXX-XXXXX）
        const isValidTOTP = !useBackupCode && twoFactorCode.length === 6;
        const isValidBackupCode =
            useBackupCode &&
            /^[A-Za-z0-9]{5}-[A-Za-z0-9]{5}$/.test(twoFactorCode);

        if (!twoFactorCode || (!isValidTOTP && !isValidBackupCode)) {
            onError(
                useBackupCode
                    ? t("error.invalidBackupCode")
                    : t("error.required")
            );
            return;
        }

        setIs2FALoading(true);
        onError("");

        try {
            let result;

            if (useBackupCode) {
                console.log(
                    "🍪 Cookies before verifyBackupCode:",
                    document.cookie
                );
                result = await authClient.twoFactor.verifyBackupCode({
                    code: twoFactorCode,
                });
            } else {
                result = await authClient.twoFactor.verifyTotp({
                    code: twoFactorCode,
                });
            }

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
                        {useBackupCode ? t("backupCodeLabel") : t("label")}
                    </label>
                    <input
                        id="twoFactorCode"
                        type="text"
                        inputMode={useBackupCode ? "text" : "numeric"}
                        pattern={useBackupCode ? undefined : "[0-9]*"}
                        maxLength={useBackupCode ? 11 : 6}
                        value={twoFactorCode}
                        onChange={(e) => {
                            const value = e.target.value;
                            setTwoFactorCode(value);
                        }}
                        placeholder={useBackupCode ? "XXXXX-XXXXX" : "000000"}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-2xl tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                        required
                        disabled={is2FALoading}
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setUseBackupCode(!useBackupCode);
                            setTwoFactorCode("");
                            onError("");
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        disabled={is2FALoading}
                    >
                        {useBackupCode
                            ? t("useAuthenticator")
                            : t("useBackupCode")}
                    </button>
                </div>

                <button
                    type="submit"
                    className={`${button.primary} w-full`}
                    disabled={is2FALoading || twoFactorCode.length === 0}
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
