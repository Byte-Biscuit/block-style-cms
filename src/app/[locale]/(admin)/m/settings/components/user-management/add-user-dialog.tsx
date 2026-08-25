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
import { createUser } from "@/app/actions/settings/user-management";
import { EMAIL_REGEX } from "@/constants";
import { isSuccess } from "@/lib/response";

type NotifySeverity = "success" | "error";

interface AddUserDialogProps {
    open: boolean;
    onClose: () => void;
    onDone: () => void;
    onNotify: (message: string, severity: NotifySeverity) => void;
}

const emptyErrors = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

export default function AddUserDialog({
    open,
    onClose,
    onDone,
    onNotify,
}: AddUserDialogProps) {
    const t = useTranslations("configuration.userManagement");
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState(emptyErrors);

    useEffect(() => {
        if (open) {
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setErrors(emptyErrors);
        }
    }, [open]);

    const validate = () => {
        const next = { ...emptyErrors };

        if (!name.trim()) {
            next.name = t("validation.nameRequired");
        }

        if (!email.trim()) {
            next.email = t("validation.emailRequired");
        } else if (!EMAIL_REGEX.test(email)) {
            next.email = t("validation.emailInvalid");
        }

        if (!password) {
            next.password = t("validation.passwordRequired");
        } else if (password.length < 8) {
            next.password = t("validation.passwordMinLength");
        }

        if (!confirmPassword) {
            next.confirmPassword = t("validation.confirmPasswordRequired");
        } else if (password !== confirmPassword) {
            next.confirmPassword = t("validation.passwordMismatch");
        }

        setErrors(next);
        return !Object.values(next).some((error) => error !== "");
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        startTransition(async () => {
            const result = await createUser({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            if (isSuccess(result)) {
                onNotify(t("messages.createSuccess"), "success");
                onDone();
                onClose();
            } else {
                onNotify(result.message, "error");
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t("addDialog.title")}</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        pt: 1,
                    }}
                >
                    {/* ponytail: Chrome fills the first username/password pair for this origin; off-screen decoys absorb it. Ceiling: heuristic change → autocomplete tokens on the real fields suffice. */}
                    <Box
                        aria-hidden
                        sx={{
                            position: "absolute",
                            left: -10000,
                            width: 1,
                            height: 1,
                            overflow: "hidden",
                        }}
                    >
                        <input
                            type="text"
                            name="prevent-autofill-user"
                            autoComplete="username"
                            tabIndex={-1}
                        />
                        <input
                            type="password"
                            name="prevent-autofill-pass"
                            autoComplete="current-password"
                            tabIndex={-1}
                        />
                    </Box>
                    <TextField
                        label={t("addDialog.fields.name")}
                        name="new-user-name"
                        autoComplete="new-user-name"
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
                        label={t("addDialog.fields.email")}
                        name="new-user-email"
                        type="email"
                        autoComplete="new-user-email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        error={!!errors.email}
                        helperText={errors.email}
                        fullWidth
                        required
                        disabled={isPending}
                    />
                    <TextField
                        label={t("addDialog.fields.password")}
                        name="new-user-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        error={!!errors.password}
                        helperText={
                            errors.password ||
                            t("addDialog.helpers.passwordMinLength")
                        }
                        fullWidth
                        required
                        disabled={isPending}
                    />
                    <TextField
                        label={t("addDialog.fields.confirmPassword")}
                        name="new-user-password-confirm"
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
                    {t("buttons.addUser")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
