"use client";

import {
    Box,
    Divider,
    FormControlLabel,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { SuggestionConfig } from "@/types/system-config";

type SuggestionPanelProps = {
    value: SuggestionConfig;
    onChange: (value: SuggestionConfig) => void;
};

export default function SuggestionPanel({
    value,
    onChange,
}: SuggestionPanelProps) {
    const t = useTranslations("configuration.settings.basicConfig.suggestion");

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {t("title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("description")}
            </Typography>

            <Stack spacing={2}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={value.enabled}
                            onChange={(e) =>
                                onChange({
                                    ...value,
                                    enabled: e.target.checked,
                                })
                            }
                        />
                    }
                    label={t("enabled")}
                />

                <TextField
                    fullWidth
                    type="number"
                    label={t("maxTotal")}
                    value={value.maxTotalSuggestions}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            maxTotalSuggestions:
                                parseInt(e.target.value, 10) || "",
                        })
                    }
                    helperText={t("maxTotalHelper")}
                />

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                    {t("limits.title")}
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
                        label={t("limits.minLength")}
                        value={value.limits.contentMinLength}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                limits: {
                                    ...value.limits,
                                    contentMinLength:
                                        parseInt(e.target.value, 10) || "",
                                },
                            })
                        }
                        helperText={t("limits.minLengthHelper")}
                    />

                    <TextField
                        fullWidth
                        type="number"
                        label={t("limits.maxLength")}
                        value={value.limits.contentMaxLength}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                limits: {
                                    ...value.limits,
                                    contentMaxLength:
                                        parseInt(e.target.value, 10) || "",
                                },
                            })
                        }
                        helperText={t("limits.maxLengthHelper")}
                    />

                    <TextField
                        fullWidth
                        type="number"
                        label={t("limits.maxLinks")}
                        value={value.limits.maxLinksAllowed}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                limits: {
                                    ...value.limits,
                                    maxLinksAllowed:
                                        parseInt(e.target.value, 10) || "",
                                },
                            })
                        }
                        helperText={t("limits.maxLinksHelper")}
                    />
                </Box>
            </Stack>
        </Paper>
    );
}
