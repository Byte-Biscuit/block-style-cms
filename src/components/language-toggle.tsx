"use client";

import React, { useState, useEffect } from "react";
import {
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { Language as LanguageIcon } from "@mui/icons-material";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { locales, localeMap } from "@/i18n/config";
import { button } from "@/lib/style-classes";

type LanguageToggleProps = {
    className?: string;
};

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
    const [mounted, setMounted] = useState(false);
    const locale = useLocale();
    const t = useTranslations("web");
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    useEffect(() => setMounted(true), []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (newLocale: string) => {
        const path = pathname || "/";
        const queryString = searchParams.toString();
        if (path.startsWith(`/${newLocale}/`) || path === `/${newLocale}`) {
            handleClose();
            return;
        }
        let targetPath = path;
        for (const loc of locales) {
            if (path.startsWith(`/${loc}/`)) {
                targetPath = path.replace(`/${loc}/`, `/${newLocale}/`);
                break;
            } else if (path === `/${loc}`) {
                targetPath = `/${newLocale}`;
                break;
            }
        }
        if (targetPath === path) {
            targetPath =
                path === "/" ? `/${newLocale}` : `/${newLocale}${path}`;
        }

        const finalPath = queryString
            ? `${targetPath}?${queryString}`
            : targetPath;
        handleClose();
        window.location.href = finalPath;
    };

    return (
        <>
            <Tooltip title={t("language")}>
                <IconButton
                    onClick={handleClick}
                    color="inherit"
                    className={`${className} ${button.icon} `}
                >
                    {mounted ? (
                        <span className="min-w-6 text-center text-base leading-6 font-medium">
                            {localeMap[locale as keyof typeof localeMap]
                                ?.flag || "EN"}
                        </span>
                    ) : (
                        <LanguageIcon />
                    )}
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableScrollLock
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                slotProps={{
                    paper: {
                        sx: { py: 0, bgcolor: "transparent" },
                    },
                    list: {
                        sx: { py: 0 },
                    },
                }}
            >
                {locales.map((_locale) => {
                    const langInfo =
                        localeMap[_locale as keyof typeof localeMap];
                    return (
                        <MenuItem
                            key={langInfo.code}
                            onClick={() => handleLanguageChange(langInfo.code)}
                            className={
                                "group hover:bg-primary-600 bg-white px-4 py-2 text-gray-900 hover:text-white dark:bg-gray-800 dark:text-white"
                            }
                        >
                            <ListItemIcon
                                className={
                                    "group-hover:text-white dark:text-gray-300"
                                }
                            >
                                <span className="block h-full min-w-5 text-center align-middle text-base leading-6 font-medium">
                                    {langInfo.flag}
                                </span>
                            </ListItemIcon>
                            <ListItemText>{langInfo.nativeName}</ListItemText>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
