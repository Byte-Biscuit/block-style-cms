"use client";

import { useState, useTransition } from "react";
import { Box, Alert, Snackbar, CircularProgress } from "@mui/material";
import { ServicesForm, ServicesFormData } from "@/components/configuration";
import { updateServices } from "@/app/actions/settings/services";
import { isSuccess } from "@/lib/response";

interface ServicesTabProps {
    initialData?: ServicesFormData;
}

/**
 * External Services Tab Component
 * 外部服务配置Tab组件
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
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (data: ServicesFormData) => {
        startTransition(async () => {
            try {
                const result = await updateServices(data);

                // 使用 isSuccess 辅助函数判断
                if (isSuccess(result)) {
                    setMessage({
                        type: "success",
                        text:
                            result.message ||
                            "Services configuration saved successfully!",
                    });
                } else {
                    setMessage({
                        type: "error",
                        text:
                            result.message ||
                            "Failed to save services configuration",
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
