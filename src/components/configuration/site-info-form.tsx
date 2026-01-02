"use client";

import { useState, useRef } from "react";
import { SiteInfoConfig } from "@/types/system-config";
import { uploadLogo } from "@/app/actions/settings/site-info";
import { isSuccess } from "@/lib/response";

interface SiteInfoFormProps {
    /** Form mode: 'install' for installation wizard, 'edit' for settings page */
    mode?: "install" | "edit";
    /** Initial form data for edit mode */
    initialData?: SiteInfoConfig;
    /** Submit handler */
    onSubmit: (data: SiteInfoConfig) => void;
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
 * Site Information Form Component (Reusable)
 * Website basic information form component (reusable)
 *
 * Collects basic website information and contact methods.
 * Can be used in both installation wizard and settings page.
 */
export default function SiteInfoForm({
    mode = "install",
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel,
    cancelLabel,
}: SiteInfoFormProps) {
    const [formData, setFormData] = useState<SiteInfoConfig>(
        initialData || {
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
        }
    );

    const [logoPreview, setLogoPreview] = useState<string>("/api/logo");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "image/png") {
            alert("Please upload a PNG file.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If there's a new logo file, upload it first
        if (fileInputRef.current?.files?.[0]) {
            setIsUploadingLogo(true);
            const logoFormData = new FormData();
            logoFormData.append("logo", fileInputRef.current.files[0]);

            try {
                const result = await uploadLogo(logoFormData);
                if (!isSuccess(result)) {
                    alert(result.message || "Failed to upload logo");
                    setIsUploadingLogo(false);
                    return;
                }
            } catch (error) {
                alert("An error occurred while uploading the logo");
                setIsUploadingLogo(false);
                return;
            }
            setIsUploadingLogo(false);
        }

        onSubmit(formData);
    };

    // Determine button labels based on mode
    const defaultSubmitLabel =
        mode === "install" ? "Continue →" : "Save Changes";
    const defaultCancelLabel = mode === "install" ? "← Back" : "Cancel";
    const finalSubmitLabel = submitLabel || defaultSubmitLabel;
    const finalCancelLabel = cancelLabel || defaultCancelLabel;

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-900">
                Website Information
            </h2>
            <p className="mt-2 text-gray-600">
                Configure basic website information and contact methods. These
                will be displayed on your website.
            </p>

            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold">Note:</p>
                <p className="mt-1">
                    Website title, sub-title, and description are managed
                    through internationalization (i18n) files in{" "}
                    <code>CMS_DATA_PATH/locales/</code>.
                </p>
            </div>

            <div className="mt-6 space-y-6">
                {/* Logo Upload */}
                <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                        Website Logo
                    </h3>
                    <div className="flex items-center space-x-8">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <img
                                src={logoPreview}
                                alt="Logo Preview"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        "https://placehold.co/200x200?text=Logo";
                                }}
                            />
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/png"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleLogoChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Change Logo
                            </button>
                            <p className="mt-2 text-xs text-gray-500">
                                PNG only. Recommended size: 512x512px. This logo
                                will also be used as the website favicon.
                            </p>
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
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading || isUploadingLogo}
                        className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        {finalCancelLabel}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading || isUploadingLogo}
                    className="ml-auto rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {isUploadingLogo ? "Uploading Logo..." : finalSubmitLabel}
                </button>
            </div>
        </form>
    );
}
