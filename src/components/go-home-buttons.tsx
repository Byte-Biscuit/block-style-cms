"use client";
import { useTranslations } from "next-intl";
import Link from "@/components/link";
import { button } from "@/lib/style-classes";
import { HomeIcon, RightArrowIcon } from "@/components/icons";

const GoHomeOnErrorButtons = ({ locale }: { locale?: string | null }) => {
    const t = useTranslations("errors");
    const redirectUrlPrefix = locale ? `/${locale}` : "";
    return (
        <div className="grid gap-8 px-10 sm:grid-cols-2">
            <Link href={`${redirectUrlPrefix}/`} className={button.primary}>
                <HomeIcon />
                <span className="font-medium">{t("backToHome")}</span>
                <RightArrowIcon />
            </Link>

            <Link
                href={`${redirectUrlPrefix}/articles`}
                className={button.secondary}
            >
                <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <span className="font-medium">{t("viewAllArticles")}</span>
                <RightArrowIcon />
            </Link>
        </div>
    );
};
export default GoHomeOnErrorButtons;
