"use client";

import { useState, useTransition } from "react";
import { Box, Alert, Snackbar, CircularProgress } from "@mui/material";
import ChannelForm, {
    ChannelFormData,
} from "@/components/configuration/channel-form";
import { updateChannel } from "@/app/actions/settings/channel";
import { isSuccess } from "@/lib/response";

interface ChannelTabProps {
    initialData?: ChannelFormData;
}

/**
 * Channel Configuration Tab Component
 * 频道配置Tab组件
 *
 * Provides interface for editing channel navigation configuration.
 * Channels can be tag-based filters or page links.
 *
 * Uses Server Action for saving changes.
 */
export default function ChannelTab({ initialData }: ChannelTabProps) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (data: ChannelFormData) => {
        startTransition(async () => {
            try {
                const result = await updateChannel(data);

                if (isSuccess(result)) {
                    setMessage({
                        type: "success",
                        text:
                            result.message ||
                            "Channel configuration saved successfully!",
                    });
                } else {
                    setMessage({
                        type: "error",
                        text:
                            result.message ||
                            "Failed to save channel configuration",
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
            <ChannelForm
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
