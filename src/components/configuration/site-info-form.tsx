"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("configuration.siteInfo");
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
            alert(t("messages.pngOnly"));
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
                    alert(result.message || t("messages.uploadFailed"));
                    setIsUploadingLogo(false);
                    return;
                }
            } catch (error) {
                alert(t("messages.uploadError"));
                setIsUploadingLogo(false);
                return;
            }
            setIsUploadingLogo(false);
        }

        onSubmit(formData);
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
            <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
            <p className="mt-2 text-gray-600">{t("subtitle")}</p>

            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold">{t("notice.title")}</p>
                <p className="mt-1">
                    {t("notice.content")}{" "}
                    <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs">
                        CMS_DATA_PATH/locales/
                    </code>
                    .
                </p>
            </div>

            <div className="mt-6 space-y-6">
                {/* Logo Upload */}
                <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                        {t("logo.title")}
                    </h3>
                    <div className="flex items-center space-x-8">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <img
                                src={logoPreview}
                                alt={t("logo.preview")}
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
                                {t("logo.changeButton")}
                            </button>
                            <p className="mt-2 text-xs text-gray-500">
                                {t("logo.requirements")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                        {t("contact.title")}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        {t("contact.subtitle")}
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("contact.labels.email")}
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
                                placeholder={t("contact.placeholders.email")}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("contact.labels.wechat")}
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
                                placeholder={t("contact.placeholders.wechat")}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("contact.labels.x")}
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
                                placeholder={t("contact.placeholders.x")}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("contact.labels.telegram")}
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
                                placeholder={t("contact.placeholders.telegram")}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("contact.labels.discord")}
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
                                placeholder={t("contact.placeholders.discord")}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("contact.labels.whatsapp")}
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
                                placeholder={t("contact.placeholders.whatsapp")}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("contact.labels.linkedin")}
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
                                placeholder={t("contact.placeholders.linkedin")}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t("contact.labels.github")}
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
                                placeholder={t("contact.placeholders.github")}
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
                    {isUploadingLogo
                        ? t("buttons.uploadingLogo")
                        : finalSubmitLabel}
                </button>
            </div>
        </form>
    );
}
