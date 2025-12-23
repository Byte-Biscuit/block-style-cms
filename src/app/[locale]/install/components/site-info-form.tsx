"use client";

import { useState } from "react";
import { SiteInfoConfig } from "@/types/system-config";

interface SiteInfoFormProps {
    onNext: (data: SiteInfoConfig) => void;
    onBack: () => void;
    isLoading?: boolean;
}

/**
 * Site Information Form Component
 * 网站基本信息表单组件
 *
 * Collects basic website information and contact methods
 */
export default function SiteInfoForm({
    onNext,
    onBack,
    isLoading,
}: SiteInfoFormProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        contact: {
            email: "",
            wechat: "",
            x: "",
            telegram: "",
            discord: "",
            whatsapp: "",
            linkedin: "",
            github: "",
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-900">
                Website Information
            </h2>
            <p className="mt-2 text-gray-600">
                Configure basic website information and contact methods. These
                will be displayed on your website.
            </p>

            <div className="mt-6 space-y-6">
                {/* Basic Information */}
                <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                        Basic Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Website Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="My Awesome Site"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Website Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="A place to share my thoughts and ideas..."
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                        Contact Information (Optional)
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        Add contact methods for users to reach you. All fields
                        are optional.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                📧 Email
                            </label>
                            <input
                                type="email"
                                value={formData.contact.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: {
                                            ...formData.contact,
                                            email: e.target.value,
                                        },
                                    })
                                }
                                placeholder="contact@example.com"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                💬 WeChat ID
                            </label>
                            <input
                                type="text"
                                value={formData.contact.wechat}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: {
                                            ...formData.contact,
                                            wechat: e.target.value,
                                        },
                                    })
                                }
                                placeholder="your-wechat-id"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                𝕏 X (Twitter)
                            </label>
                            <input
                                type="text"
                                value={formData.contact.x}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: {
                                            ...formData.contact,
                                            x: e.target.value,
                                        },
                                    })
                                }
                                placeholder="@username"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                ✈️ Telegram
                            </label>
                            <input
                                type="text"
                                value={formData.contact.telegram}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: {
                                            ...formData.contact,
                                            telegram: e.target.value,
                                        },
                                    })
                                }
                                placeholder="@username"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                🎮 Discord
                            </label>
                            <input
                                type="text"
                                value={formData.contact.discord}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: {
                                            ...formData.contact,
                                            discord: e.target.value,
                                        },
                                    })
                                }
                                placeholder="username#1234 or invite link"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                📱 WhatsApp
                            </label>
                            <input
                                type="text"
                                value={formData.contact.whatsapp}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: {
                                            ...formData.contact,
                                            whatsapp: e.target.value,
                                        },
                                    })
                                }
                                placeholder="+1234567890"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                💼 LinkedIn
                            </label>
                            <input
                                type="text"
                                value={formData.contact.linkedin}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: {
                                            ...formData.contact,
                                            linkedin: e.target.value,
                                        },
                                    })
                                }
                                placeholder="linkedin.com/in/username"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                🐙 GitHub
                            </label>
                            <input
                                type="text"
                                value={formData.contact.github}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: {
                                            ...formData.contact,
                                            github: e.target.value,
                                        },
                                    })
                                }
                                placeholder="github.com/username"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                    ← Back
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600 disabled:opacity-50"
                >
                    Continue →
                </button>
            </div>
        </form>
    );
}
