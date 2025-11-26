import Link from "@/components/link";
import { button, container } from "@/lib/style-classes";
import { HomeIcon, RightArrowIcon } from "@/components/icons";
import { useTranslations } from "next-intl";

export default function SignOutPage() {
    const t = useTranslations("web.auth.logout");
    return (
        <div className={`${container.messagePage} flex-col space-y-6 pt-10`}>
            {/* Success Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-transparent bg-green-100 dark:border-green-500/30 dark:bg-green-900/20">
                <svg
                    className="h-10 w-10 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t("title")}
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400">{t("subtitle")}</p>

            {/* Action Buttons */}
            <div className="grid gap-8 px-10 sm:grid-cols-2">
                <Link href="/" className={button.primary}>
                    <HomeIcon />
                    {t("button.goHome")}
                    <RightArrowIcon />
                </Link>

                <Link href="/auth/sign-in" className={button.secondary}>
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
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                    </svg>
                    {t("button.signin")}
                    <RightArrowIcon />
                </Link>
            </div>
        </div>
    );
}
