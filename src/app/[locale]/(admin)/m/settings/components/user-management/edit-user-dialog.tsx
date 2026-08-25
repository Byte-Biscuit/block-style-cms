"use client";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import {
    resetUserPassword,
    updateUser,
} from "@/app/actions/settings/user-management";
import { isSuccess } from "@/lib/response";
import type { UserWithProvider } from "@/lib/services/user-management-service";

type NotifySeverity = "success" | "error";

interface EditUserDialogProps {
    open: boolean;
    user: UserWithProvider | null;
    onClose: () => void;
    onDone: () => void;
    onNotify: (message: string, severity: NotifySeverity) => void;
}

const emptyErrors = {
    name: "",
    newPassword: "",
    confirmPassword: "",
};

export default function EditUserDialog({
    open,
    user,
    onClose,
    onDone,
    onNotify,
}: EditUserDialogProps) {
    const t = useTranslations("configuration.userManagement");
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [resetPassword, setResetPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState(emptyErrors);

    const hasCredentialAccount =
        user?.providers.some((p) => p.providerId === "credential") ?? false;

    useEffect(() => {
        if (open && user) {
            setName(user.name);
            setResetPassword(false);
            setNewPassword("");
            setConfirmPassword("");
            setErrors(emptyErrors);
        }
    }, [open, user]);

    const validate = () => {
        const next = { ...emptyErrors };

        if (!name.trim()) {
            next.name = t("validation.nameRequired");
        }

        if (resetPassword) {
            if (!newPassword) {
                next.newPassword = t("validation.passwordRequired");
            } else if (newPassword.length < 8) {
                next.newPassword = t("validation.passwordMinLength");
            }

            if (!confirmPassword) {
                next.confirmPassword = t("validation.confirmPasswordRequired");
            } else if (newPassword !== confirmPassword) {
                next.confirmPassword = t("validation.passwordMismatch");
            }
        }

        setErrors(next);
        return !Object.values(next).some((error) => error !== "");
    };

    const handleSubmit = () => {
        if (!user || !validate()) {
            return;
        }

        startTransition(async () => {
            const updateResult = await updateUser(user.id, {
                name: name.trim(),
            });

            if (!isSuccess(updateResult)) {
                onNotify(updateResult.message, "error");
                return;
            }

            if (resetPassword) {
                const resetResult = await resetUserPassword({
                    userId: user.id,
                    newPassword,
                });

                if (!isSuccess(resetResult)) {
                    onNotify(resetResult.message, "error");
                    return;
                }
            }

            onNotify(t("messages.updateSuccess"), "success");
            onDone();
            onClose();
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t("editDialog.title")}</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        pt: 1,
                    }}
                >
                    <TextField
                        label={t("editDialog.fields.name")}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                        required
                        disabled={isPending}
                    />
                    <TextField
                        label={t("editDialog.fields.email")}
                        type="email"
                        value={user?.email ?? ""}
                        fullWidth
                        disabled
                        helperText={t("editDialog.emailHelper")}
                    />

                    {hasCredentialAccount && (
                        <>
                            <Box sx={{ mt: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setResetPassword((prev) => !prev);
                                        setNewPassword("");
                                        setConfirmPassword("");
                                        setErrors((prev) => ({
                                            ...prev,
                                            newPassword: "",
                                            confirmPassword: "",
                                        }));
                                    }}
                                    disabled={isPending}
                                >
                                    {resetPassword
                                        ? t("buttons.cancelReset")
                                        : t("buttons.resetPassword")}
                                </Button>
                            </Box>

                            {resetPassword && (
                                <>
                                    <TextField
                                        label={t(
                                            "editDialog.fields.newPassword"
                                        )}
                                        name="edit-user-new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setErrors((prev) => ({
                                                ...prev,
                                                newPassword: "",
                                            }));
                                        }}
                                        error={!!errors.newPassword}
                                        helperText={
                                            errors.newPassword ||
                                            t(
                                                "editDialog.helpers.passwordMinLength"
                                            )
                                        }
                                        fullWidth
                                        required
                                        disabled={isPending}
                                    />
                                    <TextField
                                        label={t(
                                            "editDialog.fields.confirmPassword"
                                        )}
                                        name="edit-user-password-confirm"
                                        type="password"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setErrors((prev) => ({
                                                ...prev,
                                                confirmPassword: "",
                                            }));
                                        }}
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                        fullWidth
                                        required
                                        disabled={isPending}
                                    />
                                </>
                            )}
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isPending}>
                    {t("buttons.cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isPending}
                >
                    {t("buttons.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
