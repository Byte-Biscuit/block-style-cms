"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Chip,
    Card,
    Autocomplete,
    TextField,
    CircularProgress,
} from "@mui/material";
import { LocalOffer as LocalOfferIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { ADMIN_API_PREFIX } from "@/settings";

interface ArticleFormTagsProps {
    tags: string[];
    locale: string;
    onTagsChange: (tags: string[]) => void;
}

const ArticleFormTags: React.FC<ArticleFormTagsProps> = ({
    tags,
    locale,
    onTagsChange,
}) => {
    const t = useTranslations("admin.article_form");
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getTags = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${ADMIN_API_PREFIX}/tags?locale=${locale}`
                );
                const result = await response.json();
                if (result.code === 200 && result?.payload) {
                    setSuggestions(result.payload);
                }
            } catch (error) {
                console.error("Failed to fetch tag suggestions:", error);
            } finally {
                setLoading(false);
            }
        };
        getTags();
    }, [locale]);

    return (
        <Card sx={{ mb: 2, p: 0, boxShadow: "none" }}>
            <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <LocalOfferIcon /> {t("sections.tags")}
            </Typography>

            <Autocomplete
                multiple
                freeSolo
                options={suggestions}
                value={tags}
                inputValue={inputValue}
                onInputChange={(_event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                onChange={(_event: React.SyntheticEvent, value: string[]) => {
                    onTagsChange(value);
                }}
                renderOption={(props, tag) => {
                    const { key, ...otherProps } = props;
                    return (
                        <Box
                            component="li"
                            key={key}
                            {...otherProps}
                            sx={{
                                p: "2px !important",
                                m: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                "&:hover": {
                                    backgroundColor: "transparent !important",
                                },
                            }}
                        >
                            <Chip
                                label={tag}
                                variant="outlined"
                                sx={{
                                    height: 24,
                                    fontSize: "0.8125rem",
                                    borderRadius: 1.5,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    "& .MuiChip-label": {
                                        px: 1,
                                        py: 0,
                                    },
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        color: "primary.main",
                                        backgroundColor: "primary.50",
                                        transform: "translateY(-1px)",
                                    },
                                }}
                            />
                        </Box>
                    );
                }}
                renderValue={(value, getTagProps) =>
                    value.map((tag, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                            <Chip
                                key={key}
                                {...tagProps}
                                label={tag}
                                color="warning"
                                size="medium"
                                variant="filled"
                                sx={{ borderRadius: 2 }}
                                onDelete={() =>
                                    onTagsChange(tags.filter((t) => t !== tag))
                                }
                            />
                        );
                    })
                }
                loading={loading}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={t("labels.addTag")}
                        placeholder={
                            tags.length === 0 ? t("placeholders.tag") : ""
                        }
                        size="small"
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? (
                                            <CircularProgress
                                                color="inherit"
                                                size={20}
                                            />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            },
                        }}
                    />
                )}
                slotProps={{
                    listbox: {
                        sx: {
                            display: "flex",
                            p: 0.5,
                            gap: 0.5,
                            flexWrap: "wrap",
                            maxHeight: 240,
                            overflowY: "auto",
                            bgcolor: "background.paper",
                            "& .MuiAutocomplete-option": {
                                p: 0,
                                minHeight: "auto",
                                backgroundColor: "transparent !important",
                            },
                        },
                    },
                }}
                filterSelectedOptions
                sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                    },
                }}
            />

            {tags.length === 0 && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 1 }}
                >
                    {t("helper.noTags")}
                </Typography>
            )}
        </Card>
    );
};

export default ArticleFormTags;
