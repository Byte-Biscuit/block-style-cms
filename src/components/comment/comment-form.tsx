"use client";

/**
 * CommentForm Component
 * Form for submitting new comments or replies
 */

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useCommentSubmission } from "@/lib/comment-hooks";
import type { Comment } from "@/types/comment";

interface CommentFormProps {
    articleId: string;
    articleTitle: string;
    replyTo?: Comment | null;
    onCancelReply?: () => void;
    onSuccess?: () => void;
}

export default function CommentForm({
    articleId,
    articleTitle,
    replyTo = null,
    onCancelReply,
    onSuccess,
}: CommentFormProps) {
    const t = useTranslations("web.comment.form");
    const locale = useLocale();
    const { submitComment, submitting, submitError } = useCommentSubmission();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        website: "",
        content: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Load saved user info from localStorage
    useEffect(() => {
        const savedName = localStorage.getItem("comment_author_name");
        const savedEmail = localStorage.getItem("comment_author_email");
        const savedWebsite = localStorage.getItem("comment_author_website");

        if (savedName) setFormData((prev) => ({ ...prev, name: savedName }));
        if (savedEmail) setFormData((prev) => ({ ...prev, email: savedEmail }));
        if (savedWebsite)
            setFormData((prev) => ({ ...prev, website: savedWebsite }));
    }, []);

    const handleChange =
        (field: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData((prev) => ({ ...prev, [field]: e.target.value }));
            // Clear error when user starts typing
            if (errors[field]) {
                setErrors((prev) => ({ ...prev, [field]: "" }));
            }
        };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("errors.nameRequired");
        } else if (formData.name.length > 50) {
            newErrors.name = t("errors.nameTooLong");
        }

        if (!formData.email.trim()) {
            newErrors.email = t("errors.emailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("errors.emailInvalid");
        }

        if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
            newErrors.website = t("errors.websiteInvalid");
        }

        if (!formData.content.trim()) {
            newErrors.content = t("errors.contentRequired");
        } else if (formData.content.length < 10) {
            newErrors.content = t("errors.contentTooShort");
        } else if (formData.content.length > 1000) {
            newErrors.content = t("errors.contentTooLong");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Save user info to localStorage
        localStorage.setItem("comment_author_name", formData.name);
        localStorage.setItem("comment_author_email", formData.email);
        if (formData.website) {
            localStorage.setItem("comment_author_website", formData.website);
        }

        const result = await submitComment({
            articleId,
            articleTitle,
            content: formData.content,
            author: {
                name: formData.name,
                email: formData.email,
                website: formData.website || undefined,
            },
            replyToId: replyTo?.id,
            locale,
        });

        if (result.success) {
            setFormData((prev) => ({ ...prev, content: "" }));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
            if (onSuccess) onSuccess();
            if (onCancelReply) onCancelReply();
        }
    };

    return (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                {replyTo ? t("replyTitle") : t("title")}
            </h3>

            {replyTo && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm dark:bg-blue-900">
                    <span className="text-gray-700 dark:text-gray-200">
                        {t("replyingTo")}: {replyTo.author.name}
                    </span>
                    {onCancelReply && (
                        <button
                            onClick={onCancelReply}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    )}
                </div>
            )}

            {showSuccess && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {t("success")}
                </div>
            )}

            {submitError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("name")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleChange("name")}
                            disabled={submitting}
                            className={`w-full rounded-lg border ${
                                errors.name
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:bg-gray-700 dark:text-white`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("email")}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={handleChange("email")}
                            disabled={submitting}
                            className={`w-full rounded-lg border ${
                                errors.email
                                    ? "border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                            } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:bg-gray-700 dark:text-white`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("website")}
                    </label>
                    <input
                        type="url"
                        value={formData.website}
                        onChange={handleChange("website")}
                        disabled={submitting}
                        placeholder="https://example.com"
                        className={`w-full rounded-lg border ${
                            errors.website
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.website && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.website}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("content")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={handleChange("content")}
                        disabled={submitting}
                        rows={4}
                        className={`w-full rounded-lg border ${
                            errors.content
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.content ? (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.content}
                        </p>
                    ) : (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {formData.content.length}/1000
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-gray-800"
                    >
                        {submitting ? (
                            <>
                                <svg
                                    className="h-4 w-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                {t("submitting")}
                            </>
                        ) : (
                            <>
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                                {t("submit")}
                            </>
                        )}
                    </button>

                    {replyTo && onCancelReply && (
                        <button
                            type="button"
                            onClick={onCancelReply}
                            disabled={submitting}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                        >
                            {t("cancel")}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
