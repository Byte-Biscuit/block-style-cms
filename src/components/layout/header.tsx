import { getTranslations, getLocale } from "next-intl/server";
import Link from "@/components/link";
import GitHubIconButton from "@/components/github";
import SearchIconButton from "@/components/search";
import SmallScreenNavButton from "@/components/layout/small-screen-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { container } from "@/lib/classes";
import { LanguageToggle } from "@/components/language-toggle";
import { channels, Channel } from "@/channels";
//import Logo from "@/app/assets/logo.svg";
import Image from "next/image";

const navItemLinkTwCls =
    "hover:text-primary-500 dark:hover:text-primary-400 font-medium text-gray-900 dark:text-gray-100";

const Header = async () => {
    const t = await getTranslations("web");
    const locale = await getLocale();

    return (
        <header className={`${container.header}`}>
            <nav className="flex items-center space-x-4">
                <Link
                    href={`/${locale}`}
                    aria-label={t("title")}
                    className="flex items-center gap-2"
                >
                    {/*             <Logo
                        className="h-8 w-auto"
                        style={{ alignSelf: "center" }}
                    /> */}
                    <Image
                        src="/logo.png"
                        alt={t("title")}
                        width={96}
                        height={32}
                        className="h-8 w-auto"
                        priority
                    />
                    <span className="hidden text-xl leading-[1] font-semibold text-gray-900 sm:inline-block lg:text-2xl dark:text-white">
                        {t("title")}
                    </span>
                </Link>
                <div className="ml-4 hidden items-center gap-x-6 leading-5 sm:flex">
                    {channels.map((channel: Channel) => {
                        return (
                            <Link
                                key={`nav-${channel.id}`}
                                className={navItemLinkTwCls}
                                href={channel.href}
                            >
                                {t(`channel.${channel.labelKey}`)}
                            </Link>
                        );
                    })}
                </div>
            </nav>
            <div className="flex items-center space-x-1 sm:space-x-2">
                <SearchIconButton />
                <GitHubIconButton />
                <ThemeToggle />
                <LanguageToggle />
                <SmallScreenNavButton />
            </div>
        </header>
    );
};

export default Header;
