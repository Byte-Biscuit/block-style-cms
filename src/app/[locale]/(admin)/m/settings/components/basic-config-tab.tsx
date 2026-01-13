"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
    Box,
    Alert,
    Snackbar,
    CircularProgress,
    Typography,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Paper,
    Divider,
    Stack,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { BasicConfig } from "@/types/system-config";
import { updateBasicConfig } from "@/app/actions/settings/basic-config";
import { isSuccess } from "@/lib/response";

interface BasicConfigTabProps {
    initialData?: BasicConfig;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: BasicConfig = {
    comment: {
        enabled: true,
        maxTotalComments: 1000,
        limits: {
            contentMinLength: 10,
            contentMaxLength: 1000,
            maxLinksAllowed: 2,
        },
        moderation: {
            requireApproval: true,
        },
    },
    suggestion: {
        enabled: true,
        maxTotalSuggestions: 500,
        limits: {
            contentMinLength: 10,
            contentMaxLength: 2000,
            maxLinksAllowed: 3,
        },
    },
};

/**
 * Merge initial data with default config to ensure all fields are present
 */
function mergeWithDefaults(initialData?: BasicConfig): BasicConfig {
    if (!initialData) {
        return DEFAULT_CONFIG;
    }

    return {
        comment: {
            enabled:
                initialData.comment?.enabled ?? DEFAULT_CONFIG.comment.enabled,
            maxTotalComments:
                initialData.comment?.maxTotalComments ??
                DEFAULT_CONFIG.comment.maxTotalComments,
            limits: {
                contentMinLength:
                    initialData.comment?.limits?.contentMinLength ??
                    DEFAULT_CONFIG.comment.limits.contentMinLength,
                contentMaxLength:
                    initialData.comment?.limits?.contentMaxLength ??
                    DEFAULT_CONFIG.comment.limits.contentMaxLength,
                maxLinksAllowed:
                    initialData.comment?.limits?.maxLinksAllowed ??
                    DEFAULT_CONFIG.comment.limits.maxLinksAllowed,
            },
            moderation: {
                requireApproval:
                    initialData.comment?.moderation?.requireApproval ??
                    DEFAULT_CONFIG.comment.moderation.requireApproval,
            },
        },
        suggestion: {
            enabled:
                initialData.suggestion?.enabled ??
                DEFAULT_CONFIG.suggestion.enabled,
            maxTotalSuggestions:
                initialData.suggestion?.maxTotalSuggestions ??
                DEFAULT_CONFIG.suggestion.maxTotalSuggestions,
            limits: {
                contentMinLength:
                    initialData.suggestion?.limits?.contentMinLength ??
                    DEFAULT_CONFIG.suggestion.limits.contentMinLength,
                contentMaxLength:
                    initialData.suggestion?.limits?.contentMaxLength ??
                    DEFAULT_CONFIG.suggestion.limits.contentMaxLength,
                maxLinksAllowed:
                    initialData.suggestion?.limits?.maxLinksAllowed ??
                    DEFAULT_CONFIG.suggestion.limits.maxLinksAllowed,
            },
        },
    };
}

/**
 * Basic Configuration Tab Component
 *
 */
export default function BasicConfigTab({ initialData }: BasicConfigTabProps) {
    const t = useTranslations("configuration.settings.basicConfig");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    // Form state with merged defaults
    const [formData, setFormData] = useState<BasicConfig>(
        mergeWithDefaults(initialData)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                const result = await updateBasicConfig(formData);

                if (isSuccess(result)) {
                    setMessage({
                        type: "success",
                        text: result.message || t("messages.saveSuccess"),
                    });
                } else {
                    setMessage({
                        type: "error",
                        text: result.message || t("messages.saveFailed"),
                    });
                }
            } catch (error) {
                setMessage({
                    type: "error",
                    text: t("messages.unexpectedError"),
                });
            }
        });
    };

    const handleCloseMessage = () => {
        setMessage(null);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
                {/* Comment System Configuration */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t("comment.title")}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {t("comment.description")}
                    </Typography>

                    <Stack spacing={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.comment.enabled}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            comment: {
                                                ...formData.comment,
                                                enabled: e.target.checked,
                                            },
                                        })
                                    }
                                />
                            }
                            label={t("comment.enabled")}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label={t("comment.maxTotal")}
                            value={formData.comment.maxTotalComments}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    comment: {
                                        ...formData.comment,
                                        maxTotalComments:
                                            parseInt(e.target.value) || "",
                                    },
                                })
                            }
                            helperText={t("comment.maxTotalHelper")}
                        />

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            {t("comment.limits.title")}
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(3, 1fr)",
                                },
                                gap: 2,
                            }}
                        >
                            <TextField
                                fullWidth
                                type="number"
                                label={t("comment.limits.minLength")}
                                value={formData.comment.limits.contentMinLength}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        comment: {
                                            ...formData.comment,
                                            limits: {
                                                ...formData.comment.limits,
                                                contentMinLength:
                                                    parseInt(e.target.value) ||
                                                    "",
                                            },
                                        },
                                    })
                                }
                                helperText={t("comment.limits.minLengthHelper")}
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label={t("comment.limits.maxLength")}
                                value={formData.comment.limits.contentMaxLength}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        comment: {
                                            ...formData.comment,
                                            limits: {
                                                ...formData.comment.limits,
                                                contentMaxLength:
                                                    parseInt(e.target.value) ||
                                                    "",
                                            },
                                        },
                                    })
                                }
                                helperText={t("comment.limits.maxLengthHelper")}
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label={t("comment.limits.maxLinks")}
                                value={formData.comment.limits.maxLinksAllowed}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        comment: {
                                            ...formData.comment,
                                            limits: {
                                                ...formData.comment.limits,
                                                maxLinksAllowed:
                                                    parseInt(e.target.value) ||
                                                    "",
                                            },
                                        },
                                    })
                                }
                                helperText={t("comment.limits.maxLinksHelper")}
                            />
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            {t("comment.moderation.title")}
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        formData.comment.moderation
                                            .requireApproval
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            comment: {
                                                ...formData.comment,
                                                moderation: {
                                                    ...formData.comment
                                                        .moderation,
                                                    requireApproval:
                                                        e.target.checked,
                                                },
                                            },
                                        })
                                    }
                                />
                            }
                            label={t("comment.moderation.requireApproval")}
                        />
                    </Stack>
                </Paper>

                {/* Suggestion System Configuration */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t("suggestion.title")}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {t("suggestion.description")}
                    </Typography>

                    <Stack spacing={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.suggestion.enabled}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            suggestion: {
                                                ...formData.suggestion,
                                                enabled: e.target.checked,
                                            },
                                        })
                                    }
                                />
                            }
                            label={t("suggestion.enabled")}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label={t("suggestion.maxTotal")}
                            value={formData.suggestion.maxTotalSuggestions}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    suggestion: {
                                        ...formData.suggestion,
                                        maxTotalSuggestions:
                                            parseInt(e.target.value) || "",
                                    },
                                })
                            }
                            helperText={t("suggestion.maxTotalHelper")}
                        />

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            {t("suggestion.limits.title")}
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(3, 1fr)",
                                },
                                gap: 2,
                            }}
                        >
                            <TextField
                                fullWidth
                                type="number"
                                label={t("suggestion.limits.minLength")}
                                value={
                                    formData.suggestion.limits.contentMinLength
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        suggestion: {
                                            ...formData.suggestion,
                                            limits: {
                                                ...formData.suggestion.limits,
                                                contentMinLength:
                                                    parseInt(e.target.value) ||
                                                    "",
                                            },
                                        },
                                    })
                                }
                                helperText={t(
                                    "suggestion.limits.minLengthHelper"
                                )}
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label={t("suggestion.limits.maxLength")}
                                value={
                                    formData.suggestion.limits.contentMaxLength
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        suggestion: {
                                            ...formData.suggestion,
                                            limits: {
                                                ...formData.suggestion.limits,
                                                contentMaxLength:
                                                    parseInt(e.target.value) ||
                                                    "",
                                            },
                                        },
                                    })
                                }
                                helperText={t(
                                    "suggestion.limits.maxLengthHelper"
                                )}
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label={t("suggestion.limits.maxLinks")}
                                value={
                                    formData.suggestion.limits.maxLinksAllowed
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        suggestion: {
                                            ...formData.suggestion,
                                            limits: {
                                                ...formData.suggestion.limits,
                                                maxLinksAllowed:
                                                    parseInt(e.target.value) ||
                                                    "",
                                            },
                                        },
                                    })
                                }
                                helperText={t(
                                    "suggestion.limits.maxLinksHelper"
                                )}
                            />
                        </Box>
                    </Stack>
                </Paper>

                {/* Submit Button */}
                <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isPending}
                        startIcon={
                            isPending ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <SaveIcon />
                            )
                        }
                    >
                        {isPending ? t("buttons.saving") : t("buttons.save")}
                    </Button>
                </Box>
            </Stack>

            {/* Success/Error Message Snackbar */}
            <Snackbar
                open={!!message}
                autoHideDuration={4000}
                onClose={handleCloseMessage}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseMessage}
                    severity={message?.type}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {message?.text}
                </Alert>
            </Snackbar>
        </Box>
    );
}
