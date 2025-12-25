"use client";

import { useState } from "react";
import { InstallAuthMethodsConfig } from "@/types/system-config";
import { EMAIL_REGEX } from "@/constants";

interface AuthMethodsFormProps {
    adminEmail: string;
    onNext: (data: InstallAuthMethodsConfig) => void;
    onBack: () => void;
}

/**
 * Authentication Methods Form Component
 * 认证方式配置表单组件
 *
 * Allows configuration of 4 authentication methods:
 * 1. Email/Password (always enabled)
 * 2. GitHub OAuth
 * 3. Google OAuth
 * 4. Passkey (WebAuthn)
 */
export default function AuthMethodsForm({
    adminEmail,
    onNext,
    onBack,
}: AuthMethodsFormProps) {
    const [formData, setFormData] = useState({
        emailPassword: true, // Always enabled
        twoFactor: false,
        github: false,
        githubClientId: "",
        githubClientSecret: "",
        google: false,
        googleClientId: "",
        googleClientSecret: "",
        passkey: false,
        allowedEmails: adminEmail,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validate GitHub credentials if enabled
        if (formData.github) {
            if (!formData.githubClientId.trim()) {
                newErrors.githubClientId = "GitHub Client ID is required";
            }
            if (!formData.githubClientSecret.trim()) {
                newErrors.githubClientSecret =
                    "GitHub Client Secret is required";
            }
        }

        // Validate Google credentials if enabled
        if (formData.google) {
            if (!formData.googleClientId.trim()) {
                newErrors.googleClientId = "Google Client ID is required";
            }
            if (!formData.googleClientSecret.trim()) {
                newErrors.googleClientSecret =
                    "Google Client Secret is required";
            }
        }

        // Validate allowed emails
        if (!formData.allowedEmails.trim()) {
            newErrors.allowedEmails = "At least one admin email is required";
        } else {
            const emails = formData.allowedEmails
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean);
            for (const email of emails) {
                if (!EMAIL_REGEX.test(email)) {
                    newErrors.allowedEmails = `Invalid email format: ${email}`;
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
            onNext({
                emailPassword: true,
                twoFactor: formData.twoFactor,
                github: formData.github,
                githubClientId: formData.githubClientId,
                githubClientSecret: formData.githubClientSecret,
                google: formData.google,
                googleClientId: formData.googleClientId,
                googleClientSecret: formData.googleClientSecret,
                passkey: formData.passkey,
                allowedEmails: formData.allowedEmails
                    .split(",")
                    .map((e) => e.trim().toLowerCase())
                    .filter(Boolean),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Authentication Methods
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Choose which authentication methods to enable for your CMS.
            </p>

            <div className="mt-6 space-y-4">
                {/* Email/Password (Always Enabled) */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={true}
                                disabled
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                    Email/Password Authentication
                                </h3>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Basic authentication (always enabled)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.twoFactor}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        twoFactor: e.target.checked,
                                    })
                                }
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Two-Factor Authentication (2FA)
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Allow users to enable TOTP/Authenticator
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Recommended
                        </span>
                    </div>
                </div>

                {/* GitHub OAuth */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.github}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        github: e.target.checked,
                                    })
                                }
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    GitHub OAuth
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sign in with GitHub account
                                </p>
                                {formData.github && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Client ID
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.githubClientId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        githubClientId:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`mt-1 w-full rounded border ${
                                                    errors.githubClientId
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder="GitHub Client ID"
                                            />
                                            {errors.githubClientId && (
                                                <p className="mt-1 text-[10px] text-red-500">
                                                    {errors.githubClientId}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Client Secret
                                            </label>
                                            <input
                                                type="password"
                                                value={
                                                    formData.githubClientSecret
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        githubClientSecret:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`mt-1 w-full rounded border ${
                                                    errors.githubClientSecret
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder="GitHub Client Secret"
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
                                checked={formData.google}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        google: e.target.checked,
                                    })
                                }
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Google OAuth
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sign in with Google account
                                </p>
                                {formData.google && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Client ID
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.googleClientId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        googleClientId:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`mt-1 w-full rounded border ${
                                                    errors.googleClientId
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder="Google Client ID"
                                            />
                                            {errors.googleClientId && (
                                                <p className="mt-1 text-[10px] text-red-500">
                                                    {errors.googleClientId}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Client Secret
                                            </label>
                                            <input
                                                type="password"
                                                value={
                                                    formData.googleClientSecret
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        googleClientSecret:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`mt-1 w-full rounded border ${
                                                    errors.googleClientSecret
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder="Google Client Secret"
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

                {/* Passkey */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.passkey}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        passkey: e.target.checked,
                                    })
                                }
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Passkey (WebAuthn)
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Biometric and hardware key authentication
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            Modern
                        </span>
                    </div>
                </div>

                {/* Admin Email Whitelist */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Admin Email Whitelist{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Only these emails can access the admin panel
                        (comma-separated)
                    </p>
                    <textarea
                        value={formData.allowedEmails}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                allowedEmails: e.target.value,
                            })
                        }
                        className={`mt-2 w-full rounded-lg border ${
                            errors.allowedEmails
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        rows={3}
                        placeholder="admin@example.com, editor@example.com"
                    />
                    {errors.allowedEmails && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.allowedEmails}
                        </p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    ← Back
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600"
                >
                    Continue →
                </button>
            </div>
        </form>
    );
}
