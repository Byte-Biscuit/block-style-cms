"use client";

import { useState, useTransition } from "react";
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
                        text:
                            result.message ||
                            "Configuration saved successfully!",
                    });
                } else {
                    setMessage({
                        type: "error",
                        text: result.message || "Failed to save configuration",
                    });
                }
            } catch (error) {
                setMessage({
                    type: "error",
                    text: "An unexpected error occurred",
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
                        Comment System Configuration
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Configure comment system settings and limitations
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
                            label="Enable Comment System"
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Maximum Total Comments"
                            value={formData.comment.maxTotalComments}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    comment: {
                                        ...formData.comment,
                                        maxTotalComments:
                                            parseInt(e.target.value) || 0,
                                    },
                                })
                            }
                            helperText="Maximum number of comments allowed in the system"
                        />

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            Content Limitations
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
                                label="Minimum Length"
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
                                                    0,
                                            },
                                        },
                                    })
                                }
                                helperText="Minimum characters"
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Maximum Length"
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
                                                    0,
                                            },
                                        },
                                    })
                                }
                                helperText="Maximum characters"
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Max Links Allowed"
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
                                                    0,
                                            },
                                        },
                                    })
                                }
                                helperText="Maximum links in comment"
                            />
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            Moderation Settings
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
                            label="Require Manual Approval Before Publishing"
                        />
                    </Stack>
                </Paper>

                {/* Suggestion System Configuration */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Suggestion System Configuration
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Configure suggestion system settings and limitations
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
                            label="Enable Suggestion System"
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Maximum Total Suggestions"
                            value={formData.suggestion.maxTotalSuggestions}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    suggestion: {
                                        ...formData.suggestion,
                                        maxTotalSuggestions:
                                            parseInt(e.target.value) || 0,
                                    },
                                })
                            }
                            helperText="Maximum number of suggestions allowed in the system"
                        />

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            Content Limitations
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
                                label="Minimum Length"
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
                                                    0,
                                            },
                                        },
                                    })
                                }
                                helperText="Minimum characters"
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Maximum Length"
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
                                                    0,
                                            },
                                        },
                                    })
                                }
                                helperText="Maximum characters"
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Max Links Allowed"
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
                                                    0,
                                            },
                                        },
                                    })
                                }
                                helperText="Maximum links in suggestion"
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
                        {isPending ? "Saving..." : "Save Changes"}
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
