import { getTranslations, getLocale } from "next-intl/server";
import Link from "@/components/link";
import { GitHubIconButton, MediumIconButton } from "@/components/contact";
import SearchIconButton from "@/components/search";
import ManageIconButton from "@/components/manage";
import SmallScreenNavButton from "@/components/layout/small-screen-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import ChannelNav from "@/components/layout/channel-nav";
import MoreMenu from "@/components/layout/more-menu";
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

    const githubUrl = config?.siteInfo.contact.github;
    const mediumUrl = config?.siteInfo.contact.medium;

    return (
        <header className="mx-auto grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2 px-4 py-4 xl:max-w-7xl">
            {/* Col-1: Logo + Title */}
            <Link
                href={`/${locale}`}
                aria-label={t("title")}
                className="flex shrink-0 items-center gap-2"
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

            {/* Col-2: Channel Nav (sm+: horizontal list / sm-: hamburger menu) */}
            <div className="flex min-w-0 items-center overflow-hidden">
                <ChannelNav maxVisibleItems={5} />
                <SmallScreenNavButton channels={channels} />
            </div>

            {/* Col-3: Tool icons (right-aligned) */}
            <div className="flex shrink-0 items-center gap-x-1">
                {/* Always visible */}
                <SearchIconButton algoliaConfig={algoliaConfig} />
                <ThemeToggle />
                <LanguageToggle />
                {/* Inline on sm+ */}
                <div className="hidden items-center gap-x-1 sm:flex">
                    {githubUrl && <GitHubIconButton />}
                    {mediumUrl && <MediumIconButton />}
                    <ManageIconButton />
                </div>
                {/* Collapsed into More menu on sm- */}
                <div className="flex sm:hidden">
                    <MoreMenu
                        githubUrl={githubUrl}
                        mediumUrl={mediumUrl}
                        manageHref={`/${locale}/m`}
                        manageLabel={t("manage")}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
