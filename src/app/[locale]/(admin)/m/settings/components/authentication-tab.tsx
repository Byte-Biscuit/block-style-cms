"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Box, Alert, Snackbar, CircularProgress } from "@mui/material";
import { AuthenticationForm, AuthFormData } from "@/components/configuration";
import { updateAuthentication } from "@/app/actions/settings/authentication";
import { isSuccess } from "@/lib/response";

interface AuthenticationTabProps {
    initialData?: AuthFormData;
}

/**
 * Authentication Tab Component
 *
 * Provides interface for editing authentication configuration:
 * - GitHub OAuth (enabled, clientId, clientSecret)
 * - Google OAuth (enabled, clientId, clientSecret)
 * - Admin Email Whitelist (allowedEmails)
 *
 * Note: Email/Password and 2FA are enabled by default and not configurable here.
 *
 * Uses Server Action for saving changes.
 */
export default function AuthenticationTab({
    initialData,
}: AuthenticationTabProps) {
    const t = useTranslations("configuration.authentication.tab");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (data: AuthFormData) => {
        startTransition(async () => {
            try {
                const result = await updateAuthentication(data);

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
            <AuthenticationForm
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
