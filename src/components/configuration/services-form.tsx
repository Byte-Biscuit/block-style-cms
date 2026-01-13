"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Services Form Data Structure
 */
export interface ServicesFormData {
    algolia: {
        enabled: boolean;
        appId?: string;
        apiKey?: string;
        searchKey?: string;
        indexName?: string;
    };
    umami: {
        enabled: boolean;
        websiteId?: string;
        src?: string;
    };
    ai: {
        enabled: boolean;
        provider: "openai" | "gemini";
        openai: {
            apiKey?: string;
            baseUrl?: string;
            model?: string;
        };
        gemini: {
            apiKey?: string;
            baseUrl?: string;
            model?: string;
        };
    };
    pexels: {
        enabled: boolean;
        apiKey?: string;
    };
}

interface ServicesFormProps {
    /** Form mode: 'install' for installation wizard, 'edit' for settings page */
    mode?: "install" | "edit";
    /** Initial form data */
    initialData?: Partial<ServicesFormData>;
    /** Submit handler */
    onSubmit: (data: ServicesFormData) => void;
    /** Cancel/Back handler */
    onCancel?: () => void;
    /** Skip handler for install mode */
    onSkip?: () => void;
    /** Loading state */
    isLoading?: boolean;
    /** Custom submit button label */
    submitLabel?: string | React.ReactNode;
    /** Custom cancel button label */
    cancelLabel?: string;
    /** Custom skip button label */
    skipLabel?: string;
}

/**
 * Services Configuration Form Component
 *
 * Reusable form for configuring external services:
 * 1. Algolia Search (search engine)
 * 2. Umami Analytics (web analytics)
 * 3. AI Services (OpenAI/Gemini)
 * 4. Pexels (stock photos)
 *
 * Can be used in both installation wizard and settings page.
 *
 * @example
 * // Installation mode
 * <ServicesForm
 *   mode="install"
 *   onSubmit={(data) => handleNext(data)}
 *   onCancel={handleBack}
 *   onSkip={handleSkip}
 * />
 *
 * @example
 * // Edit mode
 * <ServicesForm
 *   mode="edit"
 *   initialData={currentSettings}
 *   onSubmit={(data) => handleSave(data)}
 *   isLoading={isSaving}
 *   submitLabel="Save Changes"
 * />
 */
export default function ServicesForm({
    mode = "install",
    initialData,
    onSubmit,
    onCancel,
    onSkip,
    isLoading = false,
    submitLabel,
    cancelLabel,
    skipLabel,
}: ServicesFormProps) {
    const t = useTranslations("configuration.services");
    const [formData, setFormData] = useState<ServicesFormData>({
        algolia: {
            enabled: initialData?.algolia?.enabled ?? false,
            appId: initialData?.algolia?.appId ?? "",
            apiKey: initialData?.algolia?.apiKey ?? "",
            searchKey: initialData?.algolia?.searchKey ?? "",
            indexName: initialData?.algolia?.indexName ?? "articles",
        },
        umami: {
            enabled: initialData?.umami?.enabled ?? false,
            websiteId: initialData?.umami?.websiteId ?? "",
            src: initialData?.umami?.src ?? "https://cloud.umami.is/script.js",
        },
        ai: {
            enabled: initialData?.ai?.enabled ?? false,
            provider: initialData?.ai?.provider ?? "openai",
            openai: {
                apiKey: initialData?.ai?.openai?.apiKey ?? "",
                baseUrl:
                    initialData?.ai?.openai?.baseUrl ??
                    "https://api.openai.com/v1",
                model: initialData?.ai?.openai?.model ?? "gpt-4o-mini",
            },
            gemini: {
                apiKey: initialData?.ai?.gemini?.apiKey ?? "",
                baseUrl:
                    initialData?.ai?.gemini?.baseUrl ??
                    "https://generativelanguage.googleapis.com/v1beta",
                model: initialData?.ai?.gemini?.model ?? "gemini-2.0-flash",
            },
        },
        pexels: {
            enabled: initialData?.pexels?.enabled ?? false,
            apiKey: initialData?.pexels?.apiKey ?? "",
        },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validate Algolia if enabled
        if (formData.algolia.enabled) {
            if (!formData.algolia.appId?.trim()) {
                newErrors.algoliaAppId = t("validation.algoliaAppIdRequired");
            }
            if (!formData.algolia.apiKey?.trim()) {
                newErrors.algoliaApiKey = t(
                    "validation.algoliaAdminApiKeyRequired"
                );
            }
            if (!formData.algolia.searchKey?.trim()) {
                newErrors.algoliaSearchKey = t(
                    "validation.algoliaSearchApiKeyRequired"
                );
            }
        }

        // Validate Umami if enabled
        if (formData.umami.enabled) {
            if (!formData.umami.websiteId?.trim()) {
                newErrors.umamiWebsiteId = t(
                    "validation.umamiWebsiteIdRequired"
                );
            }
            if (!formData.umami.src?.trim()) {
                newErrors.umamiSrc = t("validation.umamiScriptSourceRequired");
            }
        }

        // Validate AI if enabled
        if (formData.ai.enabled) {
            if (formData.ai.provider === "openai") {
                if (!formData.ai.openai.apiKey?.trim()) {
                    newErrors.openaiApiKey = t(
                        "validation.openaiApiKeyRequired"
                    );
                }
            } else if (formData.ai.provider === "gemini") {
                if (!formData.ai.gemini.apiKey?.trim()) {
                    newErrors.geminiApiKey = t(
                        "validation.geminiApiKeyRequired"
                    );
                }
            }
        }

        // Validate Pexels if enabled
        if (formData.pexels.enabled) {
            if (!formData.pexels.apiKey?.trim()) {
                newErrors.pexelsApiKey = t("validation.pexelsApiKeyRequired");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    // Determine button labels based on mode
    const defaultSubmitLabel =
        mode === "install"
            ? t("buttons.completeSetup")
            : t("buttons.saveChanges");
    const defaultCancelLabel =
        mode === "install" ? t("buttons.backInstall") : t("buttons.cancel");
    const defaultSkipLabel = t("buttons.skip");
    const finalSubmitLabel = submitLabel || defaultSubmitLabel;
    const finalCancelLabel = cancelLabel || defaultCancelLabel;
    const finalSkipLabel = skipLabel || defaultSkipLabel;

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
                {/* Algolia Search */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.algolia.enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        algolia: {
                                            ...formData.algolia,
                                            enabled: e.target.checked,
                                        },
                                    })
                                }
                                disabled={isLoading}
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {t("algolia.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("algolia.description")}
                                </p>

                                {formData.algolia.enabled && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("algolia.appId")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.algolia.appId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        algolia: {
                                                            ...formData.algolia,
                                                            appId: e.target
                                                                .value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 block w-full rounded-md border ${
                                                    errors.algoliaAppId
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder={t(
                                                    "algolia.placeholders.appId"
                                                )}
                                            />
                                            {errors.algoliaAppId && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.algoliaAppId}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("algolia.adminApiKey")}
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.algolia.apiKey}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        algolia: {
                                                            ...formData.algolia,
                                                            apiKey: e.target
                                                                .value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 block w-full rounded-md border ${
                                                    errors.algoliaApiKey
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder="Admin API Key (Server-side)"
                                            />
                                            {errors.algoliaApiKey && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.algoliaApiKey}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("algolia.searchApiKey")}
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    formData.algolia.searchKey
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        algolia: {
                                                            ...formData.algolia,
                                                            searchKey:
                                                                e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 block w-full rounded-md border ${
                                                    errors.algoliaSearchKey
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder="Search-Only API Key (Client-side)"
                                            />
                                            {errors.algoliaSearchKey && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.algoliaSearchKey}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("algolia.indexName")}
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    formData.algolia.indexName
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        algolia: {
                                                            ...formData.algolia,
                                                            indexName:
                                                                e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder={t(
                                                    "algolia.placeholders.indexName"
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Umami Analytics */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.umami.enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        umami: {
                                            ...formData.umami,
                                            enabled: e.target.checked,
                                        },
                                    })
                                }
                                disabled={isLoading}
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {t("umami.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("umami.description")}
                                </p>

                                {formData.umami.enabled && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("umami.websiteId")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.umami.websiteId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        umami: {
                                                            ...formData.umami,
                                                            websiteId:
                                                                e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 block w-full rounded-md border ${
                                                    errors.umamiWebsiteId
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder={t(
                                                    "umami.placeholders.websiteId"
                                                )}
                                            />
                                            {errors.umamiWebsiteId && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.umamiWebsiteId}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("umami.scriptSource")}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.umami.src}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        umami: {
                                                            ...formData.umami,
                                                            src: e.target.value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 block w-full rounded-md border ${
                                                    errors.umamiSrc
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder={t(
                                                    "umami.placeholders.scriptSource"
                                                )}
                                            />
                                            {errors.umamiSrc && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.umamiSrc}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Services */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.ai.enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ai: {
                                            ...formData.ai,
                                            enabled: e.target.checked,
                                        },
                                    })
                                }
                                disabled={isLoading}
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {t("ai.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("ai.description")}
                                </p>

                                {formData.ai.enabled && (
                                    <div className="mt-3 max-w-lg space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("ai.provider")}
                                            </label>
                                            <div className="mt-2 flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="aiProvider"
                                                        value="openai"
                                                        checked={
                                                            formData.ai
                                                                .provider ===
                                                            "openai"
                                                        }
                                                        onChange={() =>
                                                            setFormData({
                                                                ...formData,
                                                                ai: {
                                                                    ...formData.ai,
                                                                    provider:
                                                                        "openai",
                                                                },
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                        {t("ai.openai")}
                                                    </span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="aiProvider"
                                                        value="gemini"
                                                        checked={
                                                            formData.ai
                                                                .provider ===
                                                            "gemini"
                                                        }
                                                        onChange={() =>
                                                            setFormData({
                                                                ...formData,
                                                                ai: {
                                                                    ...formData.ai,
                                                                    provider:
                                                                        "gemini",
                                                                },
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                        {t("ai.gemini")}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {formData.ai.provider === "openai" ? (
                                            <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {t("ai.openaiApiKey")}
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={
                                                            formData.ai.openai
                                                                .apiKey
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                ai: {
                                                                    ...formData.ai,
                                                                    openai: {
                                                                        ...formData
                                                                            .ai
                                                                            .openai,
                                                                        apiKey: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                        className={`mt-1 block w-full rounded-md border ${
                                                            errors.openaiApiKey
                                                                ? "border-red-500"
                                                                : "border-gray-300 dark:border-gray-600"
                                                        } px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                        placeholder="sk-..."
                                                    />
                                                    {errors.openaiApiKey && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {
                                                                errors.openaiApiKey
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {t("ai.baseUrl")}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.ai.openai
                                                                .baseUrl
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                ai: {
                                                                    ...formData.ai,
                                                                    openai: {
                                                                        ...formData
                                                                            .ai
                                                                            .openai,
                                                                        baseUrl:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder={t(
                                                            "ai.placeholders.openaiBaseUrl"
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {t("ai.model")}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.ai.openai
                                                                .model
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                ai: {
                                                                    ...formData.ai,
                                                                    openai: {
                                                                        ...formData
                                                                            .ai
                                                                            .openai,
                                                                        model: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder={t(
                                                            "ai.placeholders.openaiModel"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {t("ai.geminiApiKey")}
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={
                                                            formData.ai.gemini
                                                                .apiKey
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                ai: {
                                                                    ...formData.ai,
                                                                    gemini: {
                                                                        ...formData
                                                                            .ai
                                                                            .gemini,
                                                                        apiKey: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                        className={`mt-1 block w-full rounded-md border ${
                                                            errors.geminiApiKey
                                                                ? "border-red-500"
                                                                : "border-gray-300 dark:border-gray-600"
                                                        } px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                        placeholder="API Key"
                                                    />
                                                    {errors.geminiApiKey && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {
                                                                errors.geminiApiKey
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {t("ai.baseUrl")}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.ai.gemini
                                                                .baseUrl
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                ai: {
                                                                    ...formData.ai,
                                                                    gemini: {
                                                                        ...formData
                                                                            .ai
                                                                            .gemini,
                                                                        baseUrl:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder={t(
                                                            "ai.placeholders.geminiBaseUrl"
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {t("ai.model")}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.ai.gemini
                                                                .model
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                ai: {
                                                                    ...formData.ai,
                                                                    gemini: {
                                                                        ...formData
                                                                            .ai
                                                                            .gemini,
                                                                        model: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder={t(
                                                            "ai.placeholders.geminiModel"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pexels Stock Photos */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.pexels.enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        pexels: {
                                            ...formData.pexels,
                                            enabled: e.target.checked,
                                        },
                                    })
                                }
                                disabled={isLoading}
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {t("pexels.title")}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("pexels.description")}
                                </p>

                                {formData.pexels.enabled && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {t("pexels.apiKey")}
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.pexels.apiKey}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        pexels: {
                                                            ...formData.pexels,
                                                            apiKey: e.target
                                                                .value,
                                                        },
                                                    })
                                                }
                                                disabled={isLoading}
                                                className={`mt-1 block w-full rounded-md border ${
                                                    errors.pexelsApiKey
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                } px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white`}
                                                placeholder="API Key"
                                            />
                                            {errors.pexelsApiKey && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.pexelsApiKey}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {mode === "install" && (
                <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {t("tip")}
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div
                className={
                    mode === "install" ? "mt-8 flex justify-between" : "mt-6"
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
                <div
                    className={
                        mode === "install" && onSkip
                            ? "flex gap-3"
                            : "ml-auto flex justify-end"
                    }
                >
                    {mode === "install" && onSkip && (
                        <button
                            type="button"
                            onClick={onSkip}
                            disabled={isLoading}
                            className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {finalSkipLabel}
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {finalSubmitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}
