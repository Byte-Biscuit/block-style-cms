"use client";
import React from "react";
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { MoreHoriz, GitHub, Login } from "@mui/icons-material";
import Link from "@/components/link";

const MediumIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1044 593"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
    >
        <ellipse cx="294.5" cy="296.5" rx="294.5" ry="296.5" />
        <ellipse cx="764.5" cy="296.5" rx="147.5" ry="279" />
        <ellipse cx="992" cy="296.5" rx="52" ry="250" />
    </svg>
);

interface MoreMenuProps {
    githubUrl?: string;
    mediumUrl?: string;
    manageHref: string;
    manageLabel: string;
}

const itemCls =
    "hover:bg-primary-600 block text-gray-900 hover:text-white dark:bg-gray-800 dark:text-white";

export default function MoreMenu({
    githubUrl,
    mediumUrl,
    manageHref,
    manageLabel,
}: MoreMenuProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                color="inherit"
                className="rounded-lg p-2 text-gray-800 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-800 dark:hover:text-white"
            >
                <MoreHoriz />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: { sx: { py: 0 } },
                    list: { sx: { py: 0 } },
                }}
            >
                {githubUrl && (
                    <Link href={githubUrl} className={itemCls}>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon sx={{ color: "inherit" }}>
                                <GitHub fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>GitHub</ListItemText>
                        </MenuItem>
                    </Link>
                )}

                {mediumUrl && (
                    <Link href={mediumUrl} className={itemCls}>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon sx={{ color: "inherit" }}>
                                <MediumIcon />
                            </ListItemIcon>
                            <ListItemText>Medium</ListItemText>
                        </MenuItem>
                    </Link>
                )}

                <Link href={manageHref} className={itemCls}>
                    <MenuItem onClick={handleClose}>
                        <ListItemIcon sx={{ color: "inherit" }}>
                            <Login fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{manageLabel}</ListItemText>
                    </MenuItem>
                </Link>
            </Menu>
        </>
    );
}
