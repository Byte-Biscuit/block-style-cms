"use client";

import {
    FormControlLabel,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { OtherBasicConfig } from "@/types/system-config";

type OtherPanelProps = {
    value: OtherBasicConfig;
    onChange: (value: OtherBasicConfig) => void;
};

export default function OtherPanel({ value, onChange }: OtherPanelProps) {
    const t = useTranslations("configuration.settings.basicConfig.other");

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {t("exportMark.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("exportMark.description")}
            </Typography>

            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label={t("exportMark.text")}
                    placeholder="bsc"
                    value={value.exportMark.text}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            exportMark: {
                                ...value.exportMark,
                                text: e.target.value,
                            },
                        })
                    }
                    helperText={t("exportMark.textHelper")}
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={value.exportMark.uppercase}
                            onChange={(e) =>
                                onChange({
                                    ...value,
                                    exportMark: {
                                        ...value.exportMark,
                                        uppercase: e.target.checked,
                                    },
                                })
                            }
                        />
                    }
                    label={t("exportMark.uppercase")}
                />
            </Stack>
        </Paper>
    );
}
