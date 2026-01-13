"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Box,
    TextField,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    IconButton,
    Paper,
    Typography,
    Divider,
    Alert,
    Autocomplete,
    CircularProgress,
    Tooltip,
    Card,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    Info as InfoIcon,
} from "@mui/icons-material";
import { ChannelItem } from "@/types/system-config";
import { ADMIN_API_PREFIX } from "@/settings";

/**
 * Channel Form Data Structure
 */
export type ChannelFormData = ChannelItem[];

interface ChannelFormProps {
    /** Initial form data */
    initialData?: ChannelFormData;
    /** Submit handler */
    onSubmit: (data: ChannelFormData) => void;
    /** Loading state */
    isLoading?: boolean;
    /** Custom submit button label */
    submitLabel?: string | React.ReactNode;
}

/**
 * Channel Configuration Form Component
 *
 * Provides interface for managing channel navigation items.
 * Each channel can be either a tag-based filter or a page link.
 *
 * Features:
 * - Add/Remove channel items
 * - Toggle between 'tag' and 'page' types
 * - Select from system tags or enter custom tag
 * - Form validation
 * - Drag to reorder (visual only, manual ordering)
 *
 * @example
 * <ChannelForm
 *   initialData={channels}
 *   onSubmit={(data) => handleSave(data)}
 *   isLoading={isSaving}
 *   submitLabel="Save Changes"
 * />
 */
export default function ChannelForm({
    initialData = [],
    onSubmit,
    isLoading = false,
    submitLabel = "Save",
}: ChannelFormProps) {
    const t = useTranslations("configuration.channel");
    const [channels, setChannels] = useState<ChannelItem[]>(
        initialData.length > 0
            ? initialData
            : [
                  {
                      id: "",
                      type: "tag",
                      href: "",
                      tag: "",
                      icon: "",
                  },
              ]
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [systemTags, setSystemTags] = useState<string[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);

    // Fetch system tags
    useEffect(() => {
        const fetchTags = async () => {
            setLoadingTags(true);
            try {
                const response = await fetch(
                    `${ADMIN_API_PREFIX}/tags?locale=en-US`
                );
                const result = await response.json();
                if (result.code === 200 && result?.payload) {
                    setSystemTags(result.payload);
                }
            } catch (error) {
                console.error("Failed to fetch system tags:", error);
            } finally {
                setLoadingTags(false);
            }
        };
        fetchTags();
    }, []);

    /**
     * Add a new channel item
     */
    const handleAddChannel = () => {
        setChannels([
            ...channels,
            {
                id: "",
                type: "tag",
                href: "",
                tag: "",
                icon: "",
            },
        ]);
    };

    /**
     * Remove a channel item
     */
    const handleRemoveChannel = (index: number) => {
        const newChannels = channels.filter((_, i) => i !== index);
        setChannels(newChannels);
        // Clear errors for this index
        const newErrors = { ...errors };
        Object.keys(newErrors).forEach((key) => {
            if (key.startsWith(`${index}-`)) {
                delete newErrors[key];
            }
        });
        setErrors(newErrors);
    };

    /**
     * Update a channel field
     */
    const handleChannelChange = (
        index: number,
        field: keyof ChannelItem,
        value: string
    ) => {
        const newChannels = [...channels];
        newChannels[index] = {
            ...newChannels[index],
            [field]: value,
        };

        // Auto-generate href when ID changes (for tag type)
        if (field === "id" && newChannels[index].type === "tag") {
            // Generate href from ID: /channel/{id}
            newChannels[index].href = `/channel/${value.toLowerCase()}`;
        }

        // Auto-generate href for tag type
        if (field === "type" && value === "tag") {
            const id = newChannels[index].id || "";
            if (id) {
                newChannels[index].href = `/channel/${id.toLowerCase()}`;
            }
            // If no tag, leave href empty until tag is filled
        }
        setChannels(newChannels);

        // Clear error for this field
        const errorKey = `${index}-${field}`;
        if (errors[errorKey]) {
            const newErrors = { ...errors };
            delete newErrors[errorKey];
            setErrors(newErrors);
        }
    };

    /**
     * Validate the form
     */
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        const usedIds = new Set<string>();

        channels.forEach((channel, index) => {
            // Validate ID
            if (!channel.id.trim()) {
                newErrors[`${index}-id`] = t("form.idErrorRequired");
            } else if (usedIds.has(channel.id)) {
                newErrors[`${index}-id`] = t("form.idErrorUnique");
            } else {
                usedIds.add(channel.id);
            }

            // Validate href
            if (!channel.href.trim()) {
                newErrors[`${index}-href`] = t("form.pathErrorRequired");
            }

            // Validate tag for type=tag
            if (channel.type === "tag" && !channel.tag?.trim()) {
                newErrors[`${index}-tag`] = t("form.tagErrorRequired");
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(channels);
        }
    };

    /**
     * Move channel up/down
     */
    const handleMoveChannel = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === channels.length - 1)
        ) {
            return;
        }

        const newChannels = [...channels];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newChannels[index], newChannels[targetIndex]] = [
            newChannels[targetIndex],
            newChannels[index],
        ];
        setChannels(newChannels);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {t("title")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t("subtitle")}
                </Typography>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
                <Typography variant="body2">
                    <strong>{t("info.title")}</strong>{" "}
                    {t.rich("info.content", {
                        code: (chunks) => <code>{chunks}</code>,
                    })}
                </Typography>
            </Alert>

            {/* Channel Items */}
            <Box sx={{ mb: 3 }}>
                {channels.map((channel, index) => (
                    <Card
                        key={index}
                        sx={{
                            mb: 2,
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                            }}
                        >
                            {/* Drag Handle */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                    pt: 1,
                                }}
                            >
                                <Tooltip title={t("actions.moveUp")}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleMoveChannel(index, "up")
                                            }
                                            disabled={index === 0}
                                        >
                                            <ArrowUpIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title={t("actions.moveDown")}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleMoveChannel(index, "down")
                                            }
                                            disabled={
                                                index === channels.length - 1
                                            }
                                        >
                                            <ArrowDownIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>

                            {/* Form Fields */}
                            <Box sx={{ flex: 1 }}>
                                {/* ID and Icon */}
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 2,
                                        mb: 2,
                                    }}
                                >
                                    {/* ID */}
                                    <TextField
                                        label={t("form.id") + " *"}
                                        value={channel.id}
                                        onChange={(e) =>
                                            handleChannelChange(
                                                index,
                                                "id",
                                                e.target.value
                                            )
                                        }
                                        error={!!errors[`${index}-id`]}
                                        helperText={
                                            errors[`${index}-id`] ||
                                            t("form.idHelper")
                                        }
                                        size="small"
                                        fullWidth
                                    />

                                    {/* Icon Field */}
                                    <TextField
                                        label={t("form.icon")}
                                        value={channel.icon || ""}
                                        onChange={(e) =>
                                            handleChannelChange(
                                                index,
                                                "icon",
                                                e.target.value
                                            )
                                        }
                                        helperText={t("form.iconHelper")}
                                        size="small"
                                        fullWidth
                                        placeholder={t("form.icon")}
                                    />
                                </Box>

                                {/* Type Selection */}
                                <FormControl
                                    component="fieldset"
                                    sx={{ mb: 2 }}
                                >
                                    <FormLabel component="legend">
                                        {t("form.type")}
                                    </FormLabel>
                                    <RadioGroup
                                        row
                                        value={channel.type}
                                        onChange={(e) =>
                                            handleChannelChange(
                                                index,
                                                "type",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <FormControlLabel
                                            value="tag"
                                            control={<Radio size="small" />}
                                            label={t("form.types.tag")}
                                        />
                                        <FormControlLabel
                                            value="page"
                                            control={<Radio size="small" />}
                                            label={t("form.types.page")}
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            channel.type === "tag"
                                                ? "1fr 1fr"
                                                : "1fr",
                                        gap: 2,
                                    }}
                                >
                                    {/* Tag Field (only for type=tag) */}
                                    {channel.type === "tag" && (
                                        <Autocomplete
                                            freeSolo
                                            options={systemTags}
                                            value={channel.tag || ""}
                                            onInputChange={(
                                                _event,
                                                newValue
                                            ) => {
                                                handleChannelChange(
                                                    index,
                                                    "tag",
                                                    newValue
                                                );
                                            }}
                                            loading={loadingTags}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={t("form.tag") + " *"}
                                                    error={
                                                        !!errors[`${index}-tag`]
                                                    }
                                                    helperText={
                                                        errors[
                                                            `${index}-tag`
                                                        ] || t("form.tagHelper")
                                                    }
                                                    size="small"
                                                    slotProps={{
                                                        input: {
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <>
                                                                    {loadingTags ? (
                                                                        <CircularProgress
                                                                            color="inherit"
                                                                            size={
                                                                                20
                                                                            }
                                                                        />
                                                                    ) : null}
                                                                    {
                                                                        params
                                                                            .InputProps
                                                                            .endAdornment
                                                                    }
                                                                </>
                                                            ),
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                    )}

                                    {/* Href Path */}
                                    <TextField
                                        label={t("form.path") + " *"}
                                        value={channel.href}
                                        onChange={(e) =>
                                            handleChannelChange(
                                                index,
                                                "href",
                                                e.target.value
                                            )
                                        }
                                        error={!!errors[`${index}-href`]}
                                        helperText={
                                            errors[`${index}-href`] ||
                                            (channel.type === "tag"
                                                ? t("form.pathHelperTag")
                                                : t("form.pathHelperPage"))
                                        }
                                        size="small"
                                        fullWidth
                                        disabled={channel.type === "tag"}
                                    />
                                </Box>
                            </Box>

                            {/* Delete Button */}
                            <Tooltip title={t("actions.remove")}>
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveChannel(index)}
                                    disabled={channels.length === 1}
                                    sx={{ mt: 1 }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Card>
                ))}
            </Box>

            {/* Add Channel Button */}
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddChannel}
                sx={{ mb: 3 }}
            >
                {t("actions.add")}
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || channels.length === 0}
                    size="large"
                >
                    {submitLabel}
                </Button>
            </Box>
        </Box>
    );
}
