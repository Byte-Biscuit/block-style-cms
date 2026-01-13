"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Box, Alert, Snackbar, CircularProgress } from "@mui/material";
import { ServicesForm, ServicesFormData } from "@/components/configuration";
import { updateServices } from "@/app/actions/settings/services";
import { isSuccess } from "@/lib/response";

interface ServicesTabProps {
    initialData?: ServicesFormData;
}

/**
 * External Services Tab Component
 *
 * Provides interface for editing external services configuration:
 * - Algolia Search (enabled, appId, apiKey, searchKey, indexName)
 * - Umami Analytics (enabled, websiteId, src)
 * - AI Services (enabled, provider, OpenAI/Gemini config)
 * - Pexels API (enabled, apiKey)
 *
 * Uses Server Action for saving changes.
 */
export default function ServicesTab({ initialData }: ServicesTabProps) {
    const t = useTranslations("configuration.services.tab");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (data: ServicesFormData) => {
        startTransition(async () => {
            try {
                const result = await updateServices(data);

                if (isSuccess(result)) {
                    setMessage({
                        type: "success",
                        text:
                            result.message ||
                            t("messages.saveSuccess"),
                    });
                } else {
                    setMessage({
                        type: "error",
                        text:
                            result.message ||
                            t("messages.saveFailed"),
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
        <Box>
            {/* Form Section */}
            <ServicesForm
                mode="edit"
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={isPending}
                submitLabel={
                    isPending ? (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <CircularProgress size={16} color="inherit" />
                            {t("buttons.saving")}
                        </Box>
                    ) : (
                        t("buttons.save")
                    )
                }
            />

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
