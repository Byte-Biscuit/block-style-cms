"use client";

import { useState } from "react";
import { AdminCredentials } from "@/types/system-config";
import type { AdminInfo } from "@/app/actions/settings/admin-account";
import { EMAIL_REGEX } from "@/constants";

interface AdminAccountFormProps {
    /** Form mode: 'install' for installation wizard, 'edit' for settings page */
    mode?: "install" | "edit";
    /** Initial form data for install mode */
    initialData?: {
        name?: string;
        email?: string;
    };
    /** Admin info for edit mode */
    adminInfo?: AdminInfo;
    /** Submit handler */
    onSubmit: (data: any) => void;
    /** Cancel/Back handler */
    onCancel?: () => void;
    /** Loading state */
    isLoading?: boolean;
    /** Submit button label */
    submitLabel?: string | React.ReactNode;
    /** Cancel button label */
    cancelLabel?: string;
}

/**
 * Admin Account Form Component (Reusable)
 * 管理员账户表单组件（可复用）
 *
 * Can be used in both installation wizard and settings page.
 *
 * @example
 * // Installation mode
 * <AdminAccountForm
 *   mode="install"
 *   onSubmit={(data) => handleNext(data)}
 *   onCancel={handleBack}
 * />
 *
 * @example
 * // Edit mode (handled by admin-account-tab.tsx)
 * <AdminAccountForm
 *   mode="edit"
 *   adminInfo={currentAdmin}
 *   onSubmit={(action) => handleAction(action)}
 * />
 */
export default function AdminAccountForm({
    mode = "install",
    initialData,
    adminInfo,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel,
    cancelLabel,
}: AdminAccountFormProps) {
    // 安装模式表单
    const [installForm, setInstallForm] = useState({
        name: initialData?.name || "Administrator",
        email: initialData?.email || "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditMode = mode === "edit";
    const defaultSubmitLabel = mode === "install" ? "Continue →" : "Save";
    const defaultCancelLabel = mode === "install" ? "← Back" : "Cancel";
    const finalSubmitLabel = submitLabel || defaultSubmitLabel;
    const finalCancelLabel = cancelLabel || defaultCancelLabel;

    // 验证安装表单
    const validateInstallForm = () => {
        const newErrors: Record<string, string> = {};

        if (!installForm.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!installForm.email) {
            newErrors.email = "Email is required";
        } else if (!EMAIL_REGEX.test(installForm.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!installForm.password) {
            newErrors.password = "Password is required";
        } else if (installForm.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (installForm.password !== installForm.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 处理安装表单提交
    const handleInstallSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateInstallForm()) {
            const credentials: AdminCredentials = {
                name: installForm.name,
                email: installForm.email,
                password: installForm.password,
            };
            onSubmit(credentials);
        }
    };

    // 编辑模式由 admin-account-tab.tsx 处理
    // 这里只返回安装模式的UI
    if (isEditMode) {
        return null; // 编辑模式UI在 tab 组件中
    }

    // ========== 安装模式 ==========
    return (
        <form onSubmit={handleInstallSubmit}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Admin Account
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Set up your administrator account to access the CMS management
                panel.
            </p>

            <div className="mt-6 space-y-4">
                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Admin Name <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        This name is for display purposes only, not for login.
                    </p>
                    <input
                        type="text"
                        value={installForm.name}
                        onChange={(e) =>
                            setInstallForm({
                                ...installForm,
                                name: e.target.value,
                            })
                        }
                        className={`mt-1 w-full rounded-lg border ${
                            errors.name
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        placeholder="Administrator"
                        disabled={isLoading}
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
                        Admin Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={installForm.email}
                        onChange={(e) =>
                            setInstallForm({
                                ...installForm,
                                email: e.target.value,
                            })
                        }
                        className={`mt-1 w-full rounded-lg border ${
                            errors.email
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        placeholder="admin@example.com"
                        disabled={isLoading}
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
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={installForm.password}
                        onChange={(e) =>
                            setInstallForm({
                                ...installForm,
                                password: e.target.value,
                            })
                        }
                        className={`mt-1 w-full rounded-lg border ${
                            errors.password
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        placeholder="Minimum 8 characters"
                        disabled={isLoading}
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
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={installForm.confirmPassword}
                        onChange={(e) =>
                            setInstallForm({
                                ...installForm,
                                confirmPassword: e.target.value,
                            })
                        }
                        className={`mt-1 w-full rounded-lg border ${
                            errors.confirmPassword
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                        placeholder="Re-enter password"
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* 2FA Info Box */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                    <div className="flex items-start gap-3">
                        <svg
                            className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                Two-Factor Authentication (2FA)
                            </h3>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                You can enable 2FA later in Settings → Admin
                                Account for enhanced account protection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
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
                    className="ml-auto rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {finalSubmitLabel}
                </button>
            </div>
        </form>
    );
}
