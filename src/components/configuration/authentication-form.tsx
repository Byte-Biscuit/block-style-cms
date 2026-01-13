"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EMAIL_REGEX } from "@/constants";

/**
 * Authentication Form Data Structure
 */
export interface AuthFormData {
    github: {
        enabled: boolean;
        clientId: string;
        clientSecret: string;
    };
    google: {
        enabled: boolean;
        clientId: string;
        clientSecret: string;
    };
    allowedEmails: string[];
}

interface AuthenticationFormProps {
    /** Form mode: 'install' for installation wizard, 'edit' for settings page */
    mode?: "install" | "edit";
    /** Initial form data */
    initialData?: {
        github?: { enabled: boolean; clientId?: string; clientSecret?: string };
        google?: { enabled: boolean; clientId?: string; clientSecret?: string };
        allowedEmails?: string[];
    };
    /** Submit handler */
    onSubmit: (data: AuthFormData) => void;
    /** Cancel/Back handler */
    onCancel?: () => void;
    /** Loading state */
    isLoading?: boolean;
    /** Custom submit button label */
    submitLabel?: string | React.ReactNode;
    /** Custom cancel button label */
    cancelLabel?: string;
}

/**
 * Authentication Form Component
 *
 * Reusable form for configuring:
 * 1. GitHub OAuth (enabled, clientId, clientSecret)
 * 2. Google OAuth (enabled, clientId, clientSecret)
 * 3. Allowed Emails (admin whitelist)
 *
 * Can be used in both installation wizard and settings page.
 *
 * @example
 * // Installation mode
 * <AuthenticationForm
 *   mode="install"
 *   initialData={{ allowedEmails: [adminEmail] }}
 *   onSubmit={(data) => handleNext(data)}
 *   onCancel={handleBack}
 * />
 *
 * @example
 * // Edit mode
 * <AuthenticationForm
 *   mode="edit"
 *   initialData={currentSettings}
 *   onSubmit={(data) => handleSave(data)}
 *   isLoading={isSaving}
 *   submitLabel="Save Changes"
 * />
 */
export default function AuthenticationForm({
    mode = "install",
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel,
    cancelLabel,
}: AuthenticationFormProps) {
    const t = useTranslations("configuration.authentication");
    const [formData, setFormData] = useState({
        github: {
            enabled: initialData?.github?.enabled ?? false,
            clientId: initialData?.github?.clientId ?? "",
            clientSecret: initialData?.github?.clientSecret ?? "",
        },
        google: {
            enabled: initialData?.google?.enabled ?? false,
            clientId: initialData?.google?.clientId ?? "",
            clientSecret: initialData?.google?.clientSecret ?? "",
        },
        allowedEmails: initialData?.allowedEmails?.join(", ") ?? "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validate GitHub credentials if enabled
        if (formData.github.enabled) {
            if (!formData.github.clientId.trim()) {
                newErrors.githubClientId = t(
                    "validation.githubClientIdRequired"
                );
            }
            if (!formData.github.clientSecret.trim()) {
                newErrors.githubClientSecret = t(
                    "validation.githubClientSecretRequired"
                );
            }
        }

        // Validate Google credentials if enabled
        if (formData.google.enabled) {
            if (!formData.google.clientId.trim()) {
                newErrors.googleClientId = t(
                    "validation.googleClientIdRequired"
                );
            }
            if (!formData.google.clientSecret.trim()) {
                newErrors.googleClientSecret = t(
                    "validation.googleClientSecretRequired"
                );
            }
        }

        // Validate allowed emails
        if (!formData.allowedEmails.trim()) {
            newErrors.allowedEmails = t("validation.emailsRequired");
        } else {
            const emails = formData.allowedEmails
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean);
            for (const email of emails) {
                if (!EMAIL_REGEX.test(email)) {
                    newErrors.allowedEmails = t(
                        "validation.invalidEmailFormat",
                        { email }
                    );
                    break;
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const data: AuthFormData = {
                github: {
                    enabled: formData.github.enabled,
                    clientId: formData.github.clientId,
                    clientSecret: formData.github.clientSecret,
                },
                google: {
                    enabled: formData.google.enabled,
                    clientId: formData.google.clientId,
                    clientSecret: formData.google.clientSecret,
                },
                allowedEmails: formData.allowedEmails
                    .split(",")
                    .map((e) => e.trim().toLowerCase())
                    .filter(Boolean),
            };

            onSubmit(data);
        }
    };

    // Determine button labels based on mode
    const defaultSubmitLabel =
        mode === "install"
            ? t("buttons.continueInstall")
            : t("buttons.saveChanges");
    const defaultCancelLabel =
        mode === "install" ? t("buttons.backInstall") : t("buttons.cancel");
    const finalSubmitLabel = submitLabel || defaultSubmitLabel;
    const finalCancelLabel = cancelLabel || defaultCancelLabel;

    return (
        <form onSubmit={handleSubmit}>
            {mode === "install" && (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t("title")}
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {t("subtitle")}
                    </p>
                </>
            )}

            <div
                className={mode === "install" ? "mt-6 space-y-4" : "space-y-4"}
            >
                {/* GitHub OAuth */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.github.enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        github: {
                                            ...formData.github,
                                            enabled: e.target.checked,
                                        },
                                    })
                                }
                                disabled={isLoading}
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {t("github.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("github.description")}
                                </p>
                                {formData.github.enabled && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("github.clientId")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.github.clientId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        github: {
                                                            ...formData.github,
                                                            clientId:
                                                                e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 w-full rounded border ${
                                                    errors.githubClientId
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder={t(
                                                    "github.placeholders.clientId"
                                                )}
                                            />
                                            {errors.githubClientId && (
                                                <p className="mt-1 text-[10px] text-red-500">
                                                    {errors.githubClientId}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("github.clientSecret")}
                                            </label>
                                            <input
                                                type="password"
                                                value={
                                                    formData.github.clientSecret
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        github: {
                                                            ...formData.github,
                                                            clientSecret:
                                                                e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 w-full rounded border ${
                                                    errors.githubClientSecret
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder={t(
                                                    "github.placeholders.clientSecret"
                                                )}
                                            />
                                            {errors.githubClientSecret && (
                                                <p className="mt-1 text-[10px] text-red-500">
                                                    {errors.githubClientSecret}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Google OAuth */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.google.enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        google: {
                                            ...formData.google,
                                            enabled: e.target.checked,
                                        },
                                    })
                                }
                                disabled={isLoading}
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {t("google.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("google.description")}
                                </p>
                                {formData.google.enabled && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("google.clientId")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.google.clientId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        google: {
                                                            ...formData.google,
                                                            clientId:
                                                                e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 w-full rounded border ${
                                                    errors.googleClientId
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder={t(
                                                    "google.placeholders.clientId"
                                                )}
                                            />
                                            {errors.googleClientId && (
                                                <p className="mt-1 text-[10px] text-red-500">
                                                    {errors.googleClientId}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("google.clientSecret")}
                                            </label>
                                            <input
                                                type="password"
                                                value={
                                                    formData.google.clientSecret
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        google: {
                                                            ...formData.google,
                                                            clientSecret:
                                                                e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 w-full rounded border ${
                                                    errors.googleClientSecret
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder={t(
                                                    "google.placeholders.clientSecret"
                                                )}
                                            />
                                            {errors.googleClientSecret && (
                                                <p className="mt-1 text-[10px] text-red-500">
                                                    {errors.googleClientSecret}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Email Whitelist */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("adminEmails.label")}{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {t("adminEmails.helper")}
                    </p>
                    <textarea
                        value={formData.allowedEmails}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                allowedEmails: e.target.value,
                            })
                        }
                        disabled={isLoading}
                        className={`mt-2 w-full rounded-lg border ${
                            errors.allowedEmails
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        rows={3}
                        placeholder={t("adminEmails.placeholder")}
                    />
                    {errors.allowedEmails && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.allowedEmails}
                        </p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div
                className={
                    mode === "install"
                        ? "mt-8 flex justify-between"
                        : "mt-6 flex justify-end"
                }
            >
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {finalCancelLabel}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {finalSubmitLabel}
                </button>
            </div>
        </form>
    );
}
