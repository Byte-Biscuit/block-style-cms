"use client";

import { Save as SaveIcon } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Snackbar,
    Stack,
    Tab,
    Tabs,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState, useTransition } from "react";
import { updateBasicConfig } from "@/app/actions/settings/basic-config";
import { isSuccess } from "@/lib/response";
import type { BasicConfig } from "@/types/system-config";
import CommentPanel from "./comment-panel";
import { mergeWithDefaults } from "./defaults";
import OtherPanel from "./other-panel";
import SuggestionPanel from "./suggestion-panel";

interface BasicConfigTabProps {
    initialData?: BasicConfig;
}

function InnerTabPanel({
    children,
    value,
    index,
}: {
    children?: React.ReactNode;
    value: number;
    index: number;
}) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`basic-config-tabpanel-${index}`}
            aria-labelledby={`basic-config-tab-${index}`}
        >
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

export default function BasicConfigTab({ initialData }: BasicConfigTabProps) {
    const t = useTranslations("configuration.settings.basicConfig");
    const [activeTab, setActiveTab] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

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
            } catch {
                setMessage({
                    type: "error",
                    text: t("messages.unexpectedError"),
                });
            }
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Tabs
                value={activeTab}
                onChange={(_, next) => setActiveTab(next)}
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab label={t("tabs.comment")} id="basic-config-tab-0" />
                <Tab label={t("tabs.suggestion")} id="basic-config-tab-1" />
                <Tab label={t("tabs.other")} id="basic-config-tab-2" />
            </Tabs>

            <InnerTabPanel value={activeTab} index={0}>
                <CommentPanel
                    value={formData.comment}
                    onChange={(comment) =>
                        setFormData({ ...formData, comment })
                    }
                />
            </InnerTabPanel>

            <InnerTabPanel value={activeTab} index={1}>
                <SuggestionPanel
                    value={formData.suggestion}
                    onChange={(suggestion) =>
                        setFormData({ ...formData, suggestion })
                    }
                />
            </InnerTabPanel>

            <InnerTabPanel value={activeTab} index={2}>
                <OtherPanel
                    value={formData.other}
                    onChange={(other) => setFormData({ ...formData, other })}
                />
            </InnerTabPanel>

            <Stack spacing={3} sx={{ mt: 3 }}>
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

            <Snackbar
                open={!!message}
                autoHideDuration={4000}
                onClose={() => setMessage(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setMessage(null)}
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
