"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCredentials } from "@/types/system-config";
import { EMAIL_REGEX } from "@/constants";

interface AdminAccountFormProps {
    onNext: (data: AdminCredentials) => void;
    onBack: () => void;
}

/**
 * Generate a secure random secret for Better Auth
 * Uses Web Crypto API to generate 64-character hex string
 */
function generateSecret(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
        ""
    );
}

/**
 * Admin Account Form Component
 *
 * Creates the initial admin account with:
 * - Email address
 * - Password (minimum 8 characters)
 * - Better Auth Secret (auto-generated)
 *
 * Note: 2FA setup has been moved to backend settings (/m/settings/security)
 * for better security and user experience
 */
export default function AdminAccountForm({
    onNext,
    onBack,
}: AdminAccountFormProps) {
    const t = useTranslations("configuration.admin");
    const [formData, setFormData] = useState({
        name: "Administrator",
        email: "",
        password: "",
        confirmPassword: "",
        secret: generateSecret(), // Auto-generate on mount
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("validation.nameRequired");
        }

        if (!formData.email) {
            newErrors.email = t("validation.emailRequired");
        } else if (!EMAIL_REGEX.test(formData.email)) {
            newErrors.email = t("validation.emailInvalid");
        }

        if (!formData.password) {
            newErrors.password = t("validation.passwordRequired");
        } else if (formData.password.length < 8) {
            newErrors.password = t("validation.passwordTooShort");
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t("validation.passwordsNotMatch");
        }

        if (!formData.secret || formData.secret.length !== 64) {
            newErrors.secret = t("validation.secretInvalid");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onNext({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                secret: formData.secret,
            });
        }
    };

    const handleRegenerateSecret = () => {
        setFormData({ ...formData, secret: generateSecret() });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("title")}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                {t("subtitle")}
            </p>

            <div className="mt-6 space-y-4">
                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("labels.name")}{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("labels.nameHelper")}
                    </p>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className={`mt-1 w-full rounded-lg border ${
                            errors.name
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        placeholder={t("placeholders.name")}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("labels.email")}{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className={`mt-1 w-full rounded-lg border ${
                            errors.email
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        placeholder={t("placeholders.email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("labels.password")}{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                        className={`mt-1 w-full rounded-lg border ${
                            errors.password
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        placeholder={t("placeholders.password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("labels.confirmPassword")}{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                            })
                        }
                        className={`mt-1 w-full rounded-lg border ${
                            errors.confirmPassword
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        placeholder={t("placeholders.confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Better Auth Secret */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("labels.secret")}{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                        {t("labels.secretHelper")}
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={formData.secret}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    secret: e.target.value,
                                })
                            }
                            className={`flex-1 rounded-lg border ${
                                errors.secret
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                            placeholder={t("placeholders.secret")}
                            readOnly
                        />
                        <button
                            type="button"
                            onClick={handleRegenerateSecret}
                            className="rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            title={t("buttons.regenerateSecretTitle")}
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                    </div>
                    {errors.secret && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.secret}
                        </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t("helpers.secretWarning")}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    {t("buttons.back")}
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600"
                >
                    {t("buttons.next")}
                </button>
            </div>
        </form>
    );
}
