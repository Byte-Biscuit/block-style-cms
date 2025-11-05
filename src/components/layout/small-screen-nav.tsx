"use client";
import React from "react";
import { IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useTranslations, useLocale } from "next-intl";
import Link from "@/components/link";
import { Channel } from "@/lib/services/channel-service";

interface SmallScreenNavButtonProps {
    channels: Channel[];
}

export default function SmallScreenNavButton({
    channels,
}: SmallScreenNavButtonProps) {
    const t = useTranslations("web");
    const locale = useLocale();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getChannelHref = (channel: Channel): string => {
        if (channel.type === "page") {
            return channel.href!;
        }
        // type === 'tag' - use channel route
        return `/${locale}/channel/${channel.id}`;
    };

    return (
        <>
            <Tooltip title={t("channel.title")}>
                <IconButton
                    onClick={handleClick}
                    color="inherit"
                    className="text-gray-800 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:hidden dark:text-white dark:hover:bg-gray-800 dark:hover:text-white"
                >
                    <MenuIcon />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                slotProps={{
                    paper: {
                        sx: { py: 0 },
                    },
                    list: {
                        sx: { py: 0 },
                    },
                }}
            >
                {channels?.map((channel: Channel) => {
                    return (
                        <Link
                            key={`nav-${channel.id}`}
                            href={getChannelHref(channel)}
                            className="hover:bg-primary-600 block min-w-3xs hover:text-white dark:bg-gray-800 dark:text-white"
                        >
                            <MenuItem onClick={handleClose}>
                                {t(`channel.${channel.labelKey}`)}
                            </MenuItem>
                        </Link>
                    );
                })}
            </Menu>
        </>
    );
}
