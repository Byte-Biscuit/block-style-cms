"use client";

import { useState } from "react";
import { Search } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslations } from "next-intl";
import AlgoliaSearchDialog from "@/components/instant-search";

const SearchIconButton = () => {
    const [open, setOpen] = useState(false);
    const t = useTranslations("web.search");

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Tooltip title={t("title")}>
                <IconButton
                    onClick={handleOpen}
                    color="inherit"
                    className="text-gray-800 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-800 dark:hover:text-white"
                >
                    <Search />
                </IconButton>
            </Tooltip>
            <AlgoliaSearchDialog open={open} onClose={handleClose} />
        </>
    );
};

export default SearchIconButton;
