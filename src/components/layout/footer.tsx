import Link from "@/components/link";
import { getTranslations } from "next-intl/server";
import { VERSION } from "@/config";
const footerLinkTwCls =
    "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300";
const Footer = async () => {
    const t = await getTranslations("web");

    return (
        <footer className="flex flex-col items-center border-t border-gray-200 bg-gray-50 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
            <div className="mb-2 flex space-x-2">
                <div>{t("title")}</div>
                <div>{` • `}</div>
                <div>{`© 2025 - ${t("footer.present")}`}</div>
            </div>
            <div className="mb-2">
                <span>{t("footer.buildWith")}</span>
                <Link
                    href="https://blocknote.dev"
                    className={footerLinkTwCls}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    BlockNote
                </Link>
                <span>{`, `}</span>
                <Link
                    href="https://nextjs.org"
                    className={footerLinkTwCls}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Next.js
                </Link>
                <span>{`, `}</span>
                <Link
                    href="https://mui.com"
                    className={footerLinkTwCls}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    MUI
                </Link>
                <span>{`, `}</span>
                <Link
                    href="https://langchain.com"
                    className={footerLinkTwCls}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    LangChain
                </Link>
                <span>{` ${t("footer.and")} `}</span>
                <Link
                    href="https://tailwindcss.com"
                    className={footerLinkTwCls}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Tailwind CSS
                </Link>
            </div>
            <div>v{VERSION}</div>
        </footer>
    );
};

export default Footer;
