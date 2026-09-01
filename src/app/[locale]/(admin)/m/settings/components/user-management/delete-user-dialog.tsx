"use client";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { deleteUser } from "@/app/actions/settings/user-management";
import { isSuccess } from "@/lib/response";
import type { UserWithProvider } from "@/lib/services/user-management-service";

type NotifySeverity = "success" | "error";

interface DeleteUserDialogProps {
    open: boolean;
    user: UserWithProvider | null;
    onClose: () => void;
    onDone: () => void;
    onNotify: (message: string, severity: NotifySeverity) => void;
}

export default function DeleteUserDialog({
    open,
    user,
    onClose,
    onDone,
    onNotify,
}: DeleteUserDialogProps) {
    const t = useTranslations("configuration.userManagement");
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        if (!user) {
            return;
        }

        startTransition(async () => {
            const result = await deleteUser(user.id);

            if (isSuccess(result)) {
                onNotify(t("messages.deleteSuccess"), "success");
                onDone();
            } else {
                onNotify(result.message, "error");
            }

            onClose();
        });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t("deleteDialog.message", {
                        userName: user?.name ?? "",
                    })}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isPending}>
                    {t("buttons.cancel")}
                </Button>
                <Button
                    onClick={handleConfirm}
                    color="error"
                    variant="contained"
                    disabled={isPending}
                >
                    {t("buttons.delete")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
