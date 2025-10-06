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
import {
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    SettingsBrightness as SystemIcon,
} from "@mui/icons-material";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { button } from "@/lib/classes";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { themes, setTheme, resolvedTheme } = useTheme();
    const t = useTranslations("web.theme");
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    useEffect(() => setMounted(true), []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        handleClose();
    };

    return (
        <>
            <Tooltip title={t("title")}>
                <IconButton
                    onClick={handleClick}
                    color="inherit"
                    className={button.icon}
                >
                    {mounted ? (
                        resolvedTheme === "dark" ? (
                            <DarkModeIcon />
                        ) : (
                            <LightModeIcon />
                        )
                    ) : (
                        <SystemIcon />
                    )}
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
                {themes?.map((thm) => {
                    return (
                        <MenuItem
                            key={`theme-${thm}`}
                            onClick={() => handleThemeChange(thm)}
                            className="group hover:bg-primary-600 hover:text-white dark:bg-gray-800 dark:text-white"
                        >
                            <ListItemIcon className="group-hover:text-white dark:text-white">
                                {(() => {
                                    switch (thm) {
                                        case "light":
                                            return (
                                                <LightModeIcon fontSize="small" />
                                            );
                                        case "dark":
                                            return (
                                                <DarkModeIcon fontSize="small" />
                                            );
                                        case "system":
                                            return (
                                                <SystemIcon fontSize="small" />
                                            );
                                        default:
                                            return (
                                                <LightModeIcon fontSize="small" />
                                            );
                                    }
                                })()}
                            </ListItemIcon>
                            <ListItemText>{t(thm)}</ListItemText>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
