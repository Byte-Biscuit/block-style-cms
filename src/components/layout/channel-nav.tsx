import { getTranslations, getLocale } from "next-intl/server";
import Link from "@/components/link";
import { systemConfigService } from "@/lib/services/system-config-service";
import { ChannelItem } from "@/types/system-config";
import ChannelDropdown from "./channel-dropdown";

const navItemLinkTwCls =
    "hover:text-primary-500 dark:hover:text-primary-400 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap";

interface ChannelNavProps {
    maxVisibleItems?: number; // 最多显示几个，超出则折叠
}

export default async function ChannelNav({
    maxVisibleItems = 5,
}: ChannelNavProps) {
    const t = await getTranslations("web");
    const locale = await getLocale();
    const channels = await systemConfigService.getChannels();

    // 如果 channel 数量超过限制，分为可见和折叠两部分
    const visibleChannels = channels.slice(0, maxVisibleItems);
    const hiddenChannels = channels.slice(maxVisibleItems);

    const getChannelHref = (channel: ChannelItem): string => {
        if (channel.type === "page") {
            return `/${locale}${channel.href!}`;
        }
        // type === 'tag'
        return `/${locale}/channel/${channel.id}`;
    };

    return (
        <div className="ml-4 hidden items-center gap-x-6 leading-5 sm:flex">
            {/* 直接显示的 channels */}
            {visibleChannels.map((channel) => (
                <Link
                    key={`nav-${channel.id}`}
                    className={navItemLinkTwCls}
                    href={getChannelHref(channel)}
                >
                    {t(`channel.${channel.id}`)}
                </Link>
            ))}

            {/* 折叠的 channels */}
            {hiddenChannels.length > 0 && (
                <ChannelDropdown channels={hiddenChannels} />
            )}
        </div>
    );
}
