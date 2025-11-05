import { getTranslations, getLocale } from "next-intl/server";
import Link from "@/components/link";
import GitHubIconButton from "@/components/github";
import SearchIconButton from "@/components/search";
import SmallScreenNavButton from "@/components/layout/small-screen-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { container } from "@/lib/classes";
import { LanguageToggle } from "@/components/language-toggle";
import ChannelNav from "@/components/layout/channel-nav";
import { channelService } from "@/lib/services/channel-service";
import Image from "next/image";

const Header = async () => {
    const t = await getTranslations("web");
    const locale = await getLocale();
    const channels = await channelService.getChannels();

    return (
        <header className={`${container.header}`}>
            <nav className="flex items-center space-x-4">
                <Link
                    href={`/${locale}`}
                    aria-label={t("title")}
                    className="flex items-center gap-2"
                >
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
                <ChannelNav maxVisibleItems={5} />
            </nav>
            <div className="flex items-center space-x-1 sm:space-x-2">
                <SearchIconButton />
                <GitHubIconButton />
                <ThemeToggle />
                <LanguageToggle />
                <SmallScreenNavButton channels={channels} />
            </div>
        </header>
    );
};

export default Header;
