import { getTranslations, getLocale } from "next-intl/server";
import Link from "@/components/link";
import GitHubIconButton from "@/components/github";
import SearchIconButton from "@/components/search";
import SmallScreenNavButton from "@/components/layout/small-screen-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { container } from "@/lib/style-classes";
import { LanguageToggle } from "@/components/language-toggle";
import ChannelNav from "@/components/layout/channel-nav";
import { systemConfigService } from "@/lib/services/system-config-service";
import Image from "next/image";

const Header = async () => {
    const t = await getTranslations("web");
    const locale = await getLocale();
    const channels = await systemConfigService.getChannels();
    const config = await systemConfigService.readConfig();

    const algoliaConfig = config?.services.algolia.enabled
        ? {
              appId: config.services.algolia.appId || "",
              searchKey: config.services.algolia.searchKey || "",
              indexName: config.services.algolia.indexName || "articles",
          }
        : undefined;

    return (
        <header className={`${container.header}`}>
            <nav className="flex items-center space-x-4">
                <Link
                    href={`/${locale}`}
                    aria-label={t("title")}
                    className="flex items-center gap-2"
                >
                    <Image
                        src="/api/logo"
                        alt={t("title")}
                        width={32}
                        height={32}
                        className="h-8 w-8"
                        priority
                    />
                    <span className="hidden text-xl leading-none font-semibold text-gray-900 sm:inline-block lg:text-2xl dark:text-white">
                        {t("title")}
                    </span>
                </Link>
                <ChannelNav maxVisibleItems={5} />
            </nav>
            <div className="flex items-center space-x-1 sm:space-x-2">
                <SearchIconButton algoliaConfig={algoliaConfig} />
                <GitHubIconButton />
                <ThemeToggle />
                <LanguageToggle />
                <SmallScreenNavButton channels={channels} />
            </div>
        </header>
    );
};

export default Header;
