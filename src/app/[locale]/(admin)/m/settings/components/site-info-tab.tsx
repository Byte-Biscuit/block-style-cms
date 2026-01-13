"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Box, Alert, Snackbar, CircularProgress } from "@mui/material";
import { SiteInfoForm } from "@/components/configuration";
import { SiteInfoConfig } from "@/types/system-config";
import { updateSiteInfo } from "@/app/actions/settings/site-info";
import { isSuccess } from "@/lib/response";

interface SiteInfoTabProps {
    initialData?: SiteInfoConfig;
}

/**
 * Site Information Tab Component
 *
 * Provides interface for editing website basic information.
 * Uses Server Action for saving changes.
 */
export default function SiteInfoTab({ initialData }: SiteInfoTabProps) {
    const t = useTranslations("configuration.siteInfo");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (data: SiteInfoConfig) => {
        startTransition(async () => {
            try {
                const result = await updateSiteInfo(data);

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
        <Box>
            {/* Form Section */}
            <SiteInfoForm
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
                        t("buttons.saveChanges")
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
