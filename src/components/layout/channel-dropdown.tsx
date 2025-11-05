"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "@/components/link";
import { Channel } from "@/lib/services/channel-service";
import { IconButton } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface ChannelDropdownProps {
    channels: Channel[];
}

export default function ChannelDropdown({ channels }: ChannelDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("web");
    const locale = useLocale();

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const getChannelHref = (channel: Channel): string => {
        if (channel.type === "page") {
            return channel.href!;
        }
        // type === 'tag' - use channel route
        return `/${locale}/channel/${channel.id}`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <IconButton
                onClick={() => setIsOpen(!isOpen)}
                size="small"
                aria-label="More channels"
                className="text-gray-900 dark:text-gray-100"
            >
                <MoreHorizIcon />
            </IconButton>

            {isOpen && (
                <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-0 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {channels.map((channel, index) => (
                        <Link
                            key={`dropdown-${channel.id}`}
                            href={getChannelHref(channel)}
                            className={`hover:bg-primary-600 block px-4 py-2 text-sm hover:text-white dark:bg-gray-800 dark:text-white ${index === 0 ? "rounded-t-md" : ""} ${index === channels.length - 1 ? "rounded-b-md" : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {t(`channel.${channel.labelKey}`)}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
