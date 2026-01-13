"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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
 *
 * Provides interface for editing channel navigation configuration.
 * Channels can be tag-based filters or page links.
 *
 * Uses Server Action for saving changes.
 */
export default function ChannelTab({ initialData }: ChannelTabProps) {
    const t = useTranslations("configuration.channel");
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
                            {t("actions.saving")}
                        </Box>
                    ) : (
                        t("actions.save")
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
