"use client";

/**
 * User Management Tab
 *
 * Orchestrates user list, snackbar, and dialog open/close.
 * Dialogs own their form state and server actions.
 */

import AddIcon from "@mui/icons-material/Add";
import { Alert, Box, Button, Snackbar } from "@mui/material";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
    disableTwoFactor,
    getUsers,
} from "@/app/actions/settings/user-management";
import { isSuccess } from "@/lib/response";
import type { UserWithProvider } from "@/lib/services/user-management-service";
import AddUserDialog from "./add-user-dialog";
import DeleteUserDialog from "./delete-user-dialog";
import EditUserDialog from "./edit-user-dialog";
import TwoFactorDialog from "./two-factor-dialog";
import UserTable from "./user-table";

export default function UserManagementTab() {
    const t = useTranslations("configuration.userManagement");
    const [users, setUsers] = useState<UserWithProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [, startTransition] = useTransition();
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const [addOpen, setAddOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithProvider | null>(
        null
    );
    const [deletingUser, setDeletingUser] = useState<UserWithProvider | null>(
        null
    );
    const [twoFactorUser, setTwoFactorUser] = useState<UserWithProvider | null>(
        null
    );

    const notify = useCallback(
        (message: string, severity: "success" | "error") => {
            setSnackbar({ open: true, message, severity });
        },
        []
    );

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const result = await getUsers();

        if (isSuccess(result)) {
            setUsers(result.payload);
        } else {
            notify(result.message, "error");
        }
        setLoading(false);
    }, [notify]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleDisable2FA = (user: UserWithProvider) => {
        if (!confirm(t("confirm.disable2FA", { userName: user.name }))) {
            return;
        }

        startTransition(async () => {
            const result = await disableTwoFactor(user.id);

            if (isSuccess(result)) {
                notify(t("messages.disable2FASuccess"), "success");
                await loadUsers();
            } else {
                notify(result.message, "error");
            }
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Box>
                    <h2 style={{ margin: 0 }}>{t("page.title")}</h2>
                    <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                        {t("page.subtitle")}
                    </p>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddOpen(true)}
                >
                    {t("buttons.addUser")}
                </Button>
            </Box>

            <UserTable
                users={users}
                loading={loading}
                onEdit={setEditingUser}
                onDelete={setDeletingUser}
                onEnable2FA={setTwoFactorUser}
                onDisable2FA={handleDisable2FA}
            />

            <AddUserDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onDone={loadUsers}
                onNotify={notify}
            />

            <EditUserDialog
                open={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onDone={loadUsers}
                onNotify={notify}
            />

            <DeleteUserDialog
                open={!!deletingUser}
                user={deletingUser}
                onClose={() => setDeletingUser(null)}
                onDone={loadUsers}
                onNotify={notify}
            />

            <TwoFactorDialog
                open={!!twoFactorUser}
                user={twoFactorUser}
                onClose={() => setTwoFactorUser(null)}
                onDone={loadUsers}
                onNotify={notify}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
