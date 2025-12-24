"use client";

import { useState, useTransition } from "react";
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
 * 网站信息Tab组件
 *
 * Provides interface for editing website basic information.
 * Uses Server Action for saving changes.
 */
export default function SiteInfoTab({ initialData }: SiteInfoTabProps) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (data: SiteInfoConfig) => {
        startTransition(async () => {
            try {
                const result = await updateSiteInfo(data);

                // 使用 isSuccess 辅助函数判断
                if (isSuccess(result)) {
                    setMessage({
                        type: "success",
                        text: result.message || "Settings saved successfully!",
                    });
                } else {
                    setMessage({
                        type: "error",
                        text: result.message || "Failed to save settings",
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
        <Box>
            {/* Form Section */}
            <SiteInfoForm
                mode="edit"
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={isPending}
                submitLabel={
                    isPending ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircularProgress size={16} color="inherit" />
                            Saving...
                        </Box>
                    ) : (
                        "Save Changes"
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
