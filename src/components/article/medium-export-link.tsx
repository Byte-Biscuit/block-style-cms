"use client";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslations } from "next-intl";
import { useState } from "react";
import MediumIcon from "@/components/icons/medium";

type MediumExportLinkProps = {
    locale: string;
    slug: string;
    baseUrl: string;
};

export default function MediumExportLink({
    locale,
    slug,
    baseUrl,
}: MediumExportLinkProps) {
    const t = useTranslations("web.article");
    const [copied, setCopied] = useState(false);
    const url = `${baseUrl.replace(/\/+$/, "")}/${locale}/export/medium/${slug}`;

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={onCopy}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                title={copied ? t("copied") : t("mediumExportCopy")}
                aria-label={copied ? t("copied") : t("mediumExportCopy")}
            >
                <MediumIcon size={18} />
            </button>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                title={t("mediumExportOpen")}
                aria-label={t("mediumExportOpen")}
            >
                <OpenInNewIcon sx={{ fontSize: 18 }} />
            </a>
        </div>
    );
}
