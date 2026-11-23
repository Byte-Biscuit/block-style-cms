"use client";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import Link from "@/components/link";
import type { ChannelItem } from "@/types/system-config";

interface ChannelDropdownProps {
    channels: ChannelItem[];
}

const itemCls =
    "hover:bg-primary-600 block text-gray-900 hover:text-white dark:bg-gray-800 dark:text-white";

export default function ChannelDropdown({ channels }: ChannelDropdownProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const t = useTranslations("web");
    const locale = useLocale();

    const getChannelHref = (channel: ChannelItem): string => {
        if (channel.type === "page" && channel.href) {
            return `/${locale}${channel.href}`;
        }
        return `/${locale}/channel/${channel.id}`;
    };

    return (
        <>
            <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
                aria-label="More channels"
                className="text-gray-900 dark:text-gray-100"
            >
                <MoreHorizIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: { sx: { py: 0 } },
                    list: { sx: { py: 0 } },
                }}
            >
                {channels.map((channel) => (
                    <Link
                        key={`dropdown-${channel.id}`}
                        href={getChannelHref(channel)}
                        className={itemCls}
                    >
                        <MenuItem onClick={() => setAnchorEl(null)}>
                            {t(`channel.${channel.id}.title`)}
                        </MenuItem>
                    </Link>
                ))}
            </Menu>
        </>
    );
}
