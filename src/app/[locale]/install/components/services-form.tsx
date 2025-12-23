"use client";

import { useState } from "react";
import { InstallServicesConfig } from "@/types/system-config";

interface ServicesFormProps {
    onNext: (data: InstallServicesConfig) => void;
    onBack: () => void;
    onSkip: () => void;
    isLoading?: boolean;
}

/**
 * Services Configuration Form Component
 *
 * Optional configuration for:
 * - Algolia Search
 * - Umami Analytics
 * - AI Services (OpenAI/Gemini)
 * - Pexels Stock Photos
 */
export default function ServicesForm({
    onNext,
    onBack,
    onSkip,
    isLoading,
}: ServicesFormProps) {
    const [formData, setFormData] = useState<InstallServicesConfig>({
        algolia: false,
        algoliaAppId: "",
        algoliaApiKey: "",
        algoliaSearchKey: "",
        algoliaIndexName: "articles",

        umami: false,
        umamiWebsiteId: "",
        umamiSrc: "https://cloud.umami.is/script.js",

        ai: false,
        aiProvider: "openai",
        openaiApiKey: "",
        openaiBaseUrl: "https://api.openai.com/v1",
        openaiModel: "gpt-4o-mini",
        geminiApiKey: "",
        geminiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
        geminiModel: "gemini-1.5-flash",

        pexels: false,
        pexelsApiKey: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.algolia) {
            if (!formData.algoliaAppId?.trim()) {
                newErrors.algoliaAppId = "Algolia App ID is required";
            }
            if (!formData.algoliaApiKey?.trim()) {
                newErrors.algoliaApiKey = "Algolia Admin API Key is required";
            }
            if (!formData.algoliaSearchKey?.trim()) {
                newErrors.algoliaSearchKey =
                    "Algolia Search API Key is required";
            }
        }

        if (formData.umami) {
            if (!formData.umamiWebsiteId?.trim()) {
                newErrors.umamiWebsiteId = "Umami Website ID is required";
            }
            if (!formData.umamiSrc?.trim()) {
                newErrors.umamiSrc = "Umami Script Source is required";
            }
        }

        if (formData.ai) {
            if (formData.aiProvider === "openai") {
                if (!formData.openaiApiKey?.trim()) {
                    newErrors.openaiApiKey = "OpenAI API Key is required";
                }
            } else if (formData.aiProvider === "gemini") {
                if (!formData.geminiApiKey?.trim()) {
                    newErrors.geminiApiKey = "Gemini API Key is required";
                }
            }
        }

        if (formData.pexels) {
            if (!formData.pexelsApiKey?.trim()) {
                newErrors.pexelsApiKey = "Pexels API Key is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onNext(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                External Services (Optional)
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Enable optional services to enhance your CMS functionality. You
                can configure these later in settings.
            </p>

            <div className="mt-6 space-y-4">
                {/* Algolia Search */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.algolia}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        algolia: e.target.checked,
                                    })
                                }
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Algolia Search
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Fast, typo-tolerant search engine
                                </p>

                                {formData.algolia && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Application ID
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.algoliaAppId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        algoliaAppId:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="e.g. ABC123XYZ"
                                            />
                                            {errors.algoliaAppId && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.algoliaAppId}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Admin API Key
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.algoliaApiKey}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        algoliaApiKey:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                                                Search-Only API Key
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.algoliaSearchKey}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        algoliaSearchKey:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                                                Index Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.algoliaIndexName}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        algoliaIndexName:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="e.g. articles"
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
                                checked={formData.umami}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        umami: e.target.checked,
                                    })
                                }
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Umami Analytics
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Privacy-focused website analytics
                                </p>

                                {formData.umami && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Website ID
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.umamiWebsiteId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        umamiWebsiteId:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                            />
                                            {errors.umamiWebsiteId && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.umamiWebsiteId}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Script Source URL
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.umamiSrc}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        umamiSrc:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                placeholder="https://cloud.umami.is/script.js"
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
                                checked={formData.ai}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ai: e.target.checked,
                                    })
                                }
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    AI Services
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    AI-powered content generation and assistance
                                </p>

                                {formData.ai && (
                                    <div className="mt-3 max-w-lg space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                AI Provider
                                            </label>
                                            <div className="mt-2 flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="aiProvider"
                                                        value="openai"
                                                        checked={
                                                            formData.aiProvider ===
                                                            "openai"
                                                        }
                                                        onChange={() =>
                                                            setFormData({
                                                                ...formData,
                                                                aiProvider:
                                                                    "openai",
                                                            })
                                                        }
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                        OpenAI
                                                    </span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="aiProvider"
                                                        value="gemini"
                                                        checked={
                                                            formData.aiProvider ===
                                                            "gemini"
                                                        }
                                                        onChange={() =>
                                                            setFormData({
                                                                ...formData,
                                                                aiProvider:
                                                                    "gemini",
                                                            })
                                                        }
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                        Google Gemini
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {formData.aiProvider === "openai" ? (
                                            <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        OpenAI API Key
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={
                                                            formData.openaiApiKey
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                openaiApiKey:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                                                        API Base URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.openaiBaseUrl
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                openaiBaseUrl:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder="https://api.openai.com/v1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        Model Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.openaiModel
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                openaiModel:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder="gpt-4o-mini"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        Gemini API Key
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={
                                                            formData.geminiApiKey
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                geminiApiKey:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                                                        API Base URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.geminiBaseUrl
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                geminiBaseUrl:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder="https://generativelanguage.googleapis.com/v1beta"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        Model Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.geminiModel
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                geminiModel:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        placeholder="gemini-1.5-flash"
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

                {/* Pexels */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-start">
                            <input
                                type="checkbox"
                                checked={formData.pexels}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        pexels: e.target.checked,
                                    })
                                }
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600"
                            />
                            <div className="ml-3 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Pexels Stock Photos
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Free stock photos integration
                                </p>

                                {formData.pexels && (
                                    <div className="mt-3 max-w-lg space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Pexels API Key
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.pexelsApiKey}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        pexelsApiKey:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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

            <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    💡 Tip: You can skip this step and configure these services
                    later in the admin settings panel.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    ← Back
                </button>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onSkip}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Skip
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isLoading ? "Installing..." : "Complete Setup →"}
                    </button>
                </div>
            </div>
        </form>
    );
}
