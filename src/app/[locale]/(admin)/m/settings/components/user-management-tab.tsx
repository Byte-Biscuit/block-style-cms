"use client";

/**
 * User Management Tab
 *
 * User management UI:
 * - Display user list (basic table)
 * - Add user
 * - Edit user
 * - Delete user
 *
 * Accessible by authenticated users
 */

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SecurityIcon from "@mui/icons-material/Security";
import { UserWithProvider } from "@/lib/services/user-management-service";
import {
    getUsers,
    deleteUser,
    createUser,
    updateUser,
    resetUserPassword,
    disableTwoFactor,
    generateTwoFactorSecret,
    verifyAndEnableTwoFactor,
} from "@/app/actions/settings/user-management";
import { isSuccess } from "@/lib/response";
import { EMAIL_REGEX } from "@/constants";

export default function UserManagementTab() {
    const t = useTranslations("configuration.userManagement");
    const [users, setUsers] = useState<UserWithProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    // Delete confirmation dialog
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        userId: string;
        userName: string;
    }>({
        open: false,
        userId: "",
        userName: "",
    });

    // Add user dialog
    const [addDialog, setAddDialog] = useState({
        open: false,
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        errors: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Two-factor authentication (2FA) dialog
    const [twoFactorDialog, setTwoFactorDialog] = useState({
        open: false,
        userId: "",
        userName: "",
        step: 1, // 1: show QR code, 2: enter verification code, 3: show backup codes
        secret: "",
        otpauthUrl: "",
        backupCodes: [] as string[],
        verificationCode: "",
        error: "",
        copied: false,
    });

    // Edit user dialog
    const [editDialog, setEditDialog] = useState({
        open: false,
        userId: "",
        name: "",
        email: "",
        hasCredentialAccount: false,
        resetPassword: false,
        newPassword: "",
        confirmPassword: "",
        errors: {
            name: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Load user list
    const loadUsers = async () => {
        setLoading(true);
        const result = await getUsers();

        if (isSuccess(result)) {
            setUsers(result.payload);
        } else {
            setSnackbar({
                open: true,
                message: result.message,
                severity: "error",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Handle delete user
    const handleDeleteClick = (userId: string, userName: string) => {
        setDeleteDialog({
            open: true,
            userId,
            userName,
        });
    };

    const handleDeleteConfirm = () => {
        startTransition(async () => {
            const result = await deleteUser(deleteDialog.userId);

            if (isSuccess(result)) {
                setSnackbar({
                    open: true,
                    message: t("messages.deleteSuccess"),
                    severity: "success",
                });
                // Reload user list
                await loadUsers();
            } else {
                setSnackbar({
                    open: true,
                    message: result.message,
                    severity: "error",
                });
            }

            setDeleteDialog({ open: false, userId: "", userName: "" });
        });
    };

    // Enable 2FA: open dialog and generate secret
    const handleEnable2FA = async (userId: string, userName: string) => {
        setTwoFactorDialog({
            open: true,
            userId,
            userName,
            step: 1,
            secret: "",
            otpauthUrl: "",
            backupCodes: [],
            verificationCode: "",
            error: "",
            copied: false,
        });

        // Generate 2FA secret
        startTransition(async () => {
            const result = await generateTwoFactorSecret(userId);

            if (isSuccess(result)) {
                setTwoFactorDialog((prev) => ({
                    ...prev,
                    secret: result.payload.secret,
                    otpauthUrl: result.payload.otpauthUrl,
                    backupCodes: result.payload.backupCodes || [],
                }));
            } else {
                setTwoFactorDialog((prev) => ({
                    ...prev,
                    error: result.message,
                }));
            }
        });
    };

    // Handle verify 2FA code
    const handleVerify2FA = () => {
        const { userId, verificationCode } = twoFactorDialog;

        if (!verificationCode || verificationCode.length !== 6) {
            setTwoFactorDialog((prev) => ({
                ...prev,
                error: t("validation.verificationCodeRequired"),
            }));
            return;
        }

        startTransition(async () => {
            const result = await verifyAndEnableTwoFactor(
                userId,
                verificationCode
            );

            if (isSuccess(result)) {
                // 跳转到step 3显示备份码
                setTwoFactorDialog((prev) => ({
                    ...prev,
                    step: 3,
                    verificationCode: "",
                    error: "",
                }));
            } else {
                setTwoFactorDialog((prev) => ({
                    ...prev,
                    error: result.message,
                }));
            }
        });
    };

    // Copy backup codes to clipboard
    const handleCopyBackupCodes = () => {
        const codes = twoFactorDialog.backupCodes.join("\n");
        navigator.clipboard.writeText(codes).then(() => {
            setTwoFactorDialog((prev) => ({ ...prev, copied: true }));
            setTimeout(() => {
                setTwoFactorDialog((prev) => ({ ...prev, copied: false }));
            }, 2000);
        });
    };

    // Complete 2FA setup
    const handleComplete2FA = async () => {
        setSnackbar({
            open: true,
            message: t("messages.enable2FASuccess"),
            severity: "success",
        });
        setTwoFactorDialog({
            open: false,
            userId: "",
            userName: "",
            step: 1,
            secret: "",
            otpauthUrl: "",
            backupCodes: [],
            verificationCode: "",
            error: "",
            copied: false,
        });
        // 重新加载用户列表
        await loadUsers();
    };

    // Handle disable 2FA
    const handleDisable2FA = (userId: string, userName: string) => {
        if (!confirm(t("confirm.disable2FA", { userName }))) {
            return;
        }

        startTransition(async () => {
            const result = await disableTwoFactor(userId);

            if (isSuccess(result)) {
                setSnackbar({
                    open: true,
                    message: t("messages.disable2FASuccess"),
                    severity: "success",
                });
                // 重新加载用户列表
                await loadUsers();
            } else {
                setSnackbar({
                    open: true,
                    message: result.message,
                    severity: "error",
                });
            }
        });
    };

    // Render authentication provider badges
    const renderProviders = (providers: UserWithProvider["providers"]) => {
        return (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {providers.map((provider) => {
                    let color: "default" | "primary" | "secondary" | "success" =
                        "default";
                    let label = "";

                    if (provider.providerId === "credential") {
                        color = "primary";
                        label = t("providers.credential");
                    } else if (provider.providerId === "github") {
                        color = "secondary";
                        label = t("providers.github");
                    } else if (provider.providerId === "google") {
                        color = "success";
                        label = t("providers.google");
                    }

                    return (
                        <Chip
                            key={provider.providerId}
                            label={label}
                            color={color}
                            size="small"
                        />
                    );
                })}
            </Box>
        );
    };

    // Edit user
    const handleEditClick = (user: UserWithProvider) => {
        const hasCredentialAccount = user.providers.some(
            (p) => p.providerId === "credential"
        );
        setEditDialog({
            open: true,
            userId: user.id,
            name: user.name,
            email: user.email,
            hasCredentialAccount,
            resetPassword: false,
            newPassword: "",
            confirmPassword: "",
            errors: {
                name: "",
                newPassword: "",
                confirmPassword: "",
            },
        });
    };

    // Validate edit user form
    const validateEditForm = () => {
        const errors = {
            name: "",
            newPassword: "",
            confirmPassword: "",
        };

        if (!editDialog.name.trim()) {
            errors.name = t("validation.nameRequired");
        }

        if (editDialog.resetPassword) {
            if (!editDialog.newPassword) {
                errors.newPassword = t("validation.passwordRequired");
            } else if (editDialog.newPassword.length < 8) {
                errors.newPassword = t("validation.passwordMinLength");
            }

            if (!editDialog.confirmPassword) {
                errors.confirmPassword = t(
                    "validation.confirmPasswordRequired"
                );
            } else if (editDialog.newPassword !== editDialog.confirmPassword) {
                errors.confirmPassword = t("validation.passwordMismatch");
            }
        }

        setEditDialog({ ...editDialog, errors });
        return !Object.values(errors).some((error) => error !== "");
    };

    // Submit edit user
    const handleEditSubmit = () => {
        if (!validateEditForm()) {
            return;
        }

        startTransition(async () => {
            const updateResult = await updateUser(editDialog.userId, {
                name: editDialog.name.trim(),
            });

            if (!isSuccess(updateResult)) {
                setSnackbar({
                    open: true,
                    message: updateResult.message,
                    severity: "error",
                });
                return;
            }

            if (editDialog.resetPassword) {
                const resetResult = await resetUserPassword({
                    userId: editDialog.userId,
                    newPassword: editDialog.newPassword,
                });

                if (!isSuccess(resetResult)) {
                    setSnackbar({
                        open: true,
                        message: resetResult.message,
                        severity: "error",
                    });
                    return;
                }
            }

            setSnackbar({
                open: true,
                message: t("messages.updateSuccess"),
                severity: "success",
            });
            setEditDialog({
                open: false,
                userId: "",
                name: "",
                email: "",
                hasCredentialAccount: false,
                resetPassword: false,
                newPassword: "",
                confirmPassword: "",
                errors: { name: "", newPassword: "", confirmPassword: "" },
            });
            await loadUsers();
        });
    };

    // Validate add user form
    const validateAddForm = () => {
        const errors = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        };

        if (!addDialog.name.trim()) {
            errors.name = t("validation.nameRequired");
        }

        if (!addDialog.email.trim()) {
            errors.email = t("validation.emailRequired");
        } else if (!EMAIL_REGEX.test(addDialog.email)) {
            errors.email = t("validation.emailInvalid");
        }

        if (!addDialog.password) {
            errors.password = t("validation.passwordRequired");
        } else if (addDialog.password.length < 8) {
            errors.password = t("validation.passwordMinLength");
        }

        if (!addDialog.confirmPassword) {
            errors.confirmPassword = t("validation.confirmPasswordRequired");
        } else if (addDialog.password !== addDialog.confirmPassword) {
            errors.confirmPassword = t("validation.passwordMismatch");
        }

        setAddDialog({ ...addDialog, errors });
        return !Object.values(errors).some((error) => error !== "");
    };

    // Open add user dialog
    const handleAddClick = () => {
        setAddDialog({
            open: true,
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            errors: {
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            },
        });
    };

    // Submit add user
    const handleAddSubmit = () => {
        if (!validateAddForm()) {
            return;
        }

        startTransition(async () => {
            const result = await createUser({
                name: addDialog.name.trim(),
                email: addDialog.email.trim(),
                password: addDialog.password,
            });

            if (isSuccess(result)) {
                setSnackbar({
                    open: true,
                    message: t("messages.createSuccess"),
                    severity: "success",
                });
                setAddDialog({
                    open: false,
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    errors: {
                        name: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                    },
                });
                // Reload user list
                await loadUsers();
            } else {
                setSnackbar({
                    open: true,
                    message: result.message,
                    severity: "error",
                });
            }
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Top action bar */}
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
                    onClick={handleAddClick}
                    disabled={isPending}
                >
                    {t("buttons.addUser")}
                </Button>
            </Box>

            {/* User list table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t("table.columns.name")}</TableCell>
                            <TableCell>{t("table.columns.email")}</TableCell>
                            <TableCell>
                                {t("table.columns.authMethods")}
                            </TableCell>
                            <TableCell align="center">
                                {t("table.columns.twoFactorStatus")}
                            </TableCell>
                            <TableCell align="center">
                                {t("table.columns.emailVerified")}
                            </TableCell>
                            <TableCell>
                                {t("table.columns.createdAt")}
                            </TableCell>
                            <TableCell align="center">
                                {t("table.columns.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    {t("table.empty")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {renderProviders(user.providers)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {/* 2FA Status - shown only for credential users */}
                                        {user.providers.some(
                                            (p) => p.providerId === "credential"
                                        ) ? (
                                            user.twoFactorEnabled ? (
                                                <Chip
                                                    label={t(
                                                        "table.twoFactor.enabled"
                                                    )}
                                                    color="success"
                                                    size="small"
                                                    icon={<SecurityIcon />}
                                                />
                                            ) : (
                                                <Chip
                                                    label={t(
                                                        "table.twoFactor.disabled"
                                                    )}
                                                    color="default"
                                                    size="small"
                                                />
                                            )
                                        ) : (
                                            <span style={{ color: "#999" }}>
                                                {t(
                                                    "table.twoFactor.notApplicable"
                                                )}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {user.emailVerified ? (
                                            <Chip
                                                label={t(
                                                    "table.emailVerification.verified"
                                                )}
                                                color="success"
                                                size="small"
                                                icon={<CheckCircleIcon />}
                                            />
                                        ) : (
                                            <Chip
                                                label={t(
                                                    "table.emailVerification.unverified"
                                                )}
                                                color="default"
                                                size="small"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() =>
                                                handleEditClick(user)
                                            }
                                            title={t("tooltips.edit")}
                                            disabled={isPending}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        {/* 2FA management buttons - shown only for credential users */}
                                        {user.providers.some(
                                            (p) => p.providerId === "credential"
                                        ) &&
                                            (user.twoFactorEnabled ? (
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() =>
                                                        handleDisable2FA(
                                                            user.id,
                                                            user.name
                                                        )
                                                    }
                                                    title={t(
                                                        "tooltips.disable2FA"
                                                    )}
                                                    disabled={isPending}
                                                >
                                                    <SecurityIcon fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() =>
                                                        handleEnable2FA(
                                                            user.id,
                                                            user.name
                                                        )
                                                    }
                                                    title={t(
                                                        "tooltips.enable2FA"
                                                    )}
                                                    disabled={isPending}
                                                >
                                                    <SecurityIcon fontSize="small" />
                                                </IconButton>
                                            ))}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                handleDeleteClick(
                                                    user.id,
                                                    user.name
                                                )
                                            }
                                            title={t("tooltips.delete")}
                                            disabled={isPending}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete confirmation dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() =>
                    setDeleteDialog({ open: false, userId: "", userName: "" })
                }
            >
                <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("deleteDialog.message", {
                            userName: deleteDialog.userName,
                        })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setDeleteDialog({
                                open: false,
                                userId: "",
                                userName: "",
                            })
                        }
                        disabled={isPending}
                    >
                        {t("buttons.cancel")}
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={isPending}
                    >
                        {t("buttons.delete")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add user dialog */}
            <Dialog
                open={addDialog.open}
                onClose={() =>
                    setAddDialog({
                        ...addDialog,
                        open: false,
                        errors: {
                            name: "",
                            email: "",
                            password: "",
                            confirmPassword: "",
                        },
                    })
                }
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t("addDialog.title")}</DialogTitle>
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
                            label={t("addDialog.fields.name")}
                            value={addDialog.name}
                            onChange={(e) =>
                                setAddDialog({
                                    ...addDialog,
                                    name: e.target.value,
                                    errors: { ...addDialog.errors, name: "" },
                                })
                            }
                            error={!!addDialog.errors.name}
                            helperText={addDialog.errors.name}
                            fullWidth
                            required
                            disabled={isPending}
                        />
                        <TextField
                            label={t("addDialog.fields.email")}
                            type="email"
                            value={addDialog.email}
                            onChange={(e) =>
                                setAddDialog({
                                    ...addDialog,
                                    email: e.target.value,
                                    errors: { ...addDialog.errors, email: "" },
                                })
                            }
                            error={!!addDialog.errors.email}
                            helperText={addDialog.errors.email}
                            fullWidth
                            required
                            disabled={isPending}
                        />
                        <TextField
                            label={t("addDialog.fields.password")}
                            type="password"
                            value={addDialog.password}
                            onChange={(e) =>
                                setAddDialog({
                                    ...addDialog,
                                    password: e.target.value,
                                    errors: {
                                        ...addDialog.errors,
                                        password: "",
                                    },
                                })
                            }
                            error={!!addDialog.errors.password}
                            helperText={
                                addDialog.errors.password ||
                                t("addDialog.helpers.passwordMinLength")
                            }
                            fullWidth
                            required
                            disabled={isPending}
                        />
                        <TextField
                            label={t("addDialog.fields.confirmPassword")}
                            type="password"
                            value={addDialog.confirmPassword}
                            onChange={(e) =>
                                setAddDialog({
                                    ...addDialog,
                                    confirmPassword: e.target.value,
                                    errors: {
                                        ...addDialog.errors,
                                        confirmPassword: "",
                                    },
                                })
                            }
                            error={!!addDialog.errors.confirmPassword}
                            helperText={addDialog.errors.confirmPassword}
                            fullWidth
                            required
                            disabled={isPending}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            setAddDialog({
                                ...addDialog,
                                open: false,
                                errors: {
                                    name: "",
                                    email: "",
                                    password: "",
                                    confirmPassword: "",
                                },
                            })
                        }
                        disabled={isPending}
                    >
                        {t("buttons.cancel")}
                    </Button>
                    <Button
                        onClick={handleAddSubmit}
                        variant="contained"
                        disabled={isPending}
                    >
                        {t("buttons.addUser")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit user dialog */}
            <Dialog
                open={editDialog.open}
                onClose={() =>
                    setEditDialog({
                        ...editDialog,
                        open: false,
                        errors: {
                            name: "",
                            newPassword: "",
                            confirmPassword: "",
                        },
                    })
                }
                maxWidth="sm"
                fullWidth
            >
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
                            value={editDialog.name}
                            onChange={(e) =>
                                setEditDialog({
                                    ...editDialog,
                                    name: e.target.value,
                                    errors: { ...editDialog.errors, name: "" },
                                })
                            }
                            error={!!editDialog.errors.name}
                            helperText={editDialog.errors.name}
                            fullWidth
                            required
                            disabled={isPending}
                        />
                        <TextField
                            label={t("editDialog.fields.email")}
                            type="email"
                            value={editDialog.email}
                            fullWidth
                            disabled
                            helperText={t("editDialog.emailHelper")}
                        />

                        {/* Password reset area (shown only for credential users) */}
                        {editDialog.hasCredentialAccount && (
                            <>
                                <Box sx={{ mt: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() =>
                                            setEditDialog({
                                                ...editDialog,
                                                resetPassword:
                                                    !editDialog.resetPassword,
                                                newPassword: "",
                                                confirmPassword: "",
                                                errors: {
                                                    ...editDialog.errors,
                                                    newPassword: "",
                                                    confirmPassword: "",
                                                },
                                            })
                                        }
                                        disabled={isPending}
                                    >
                                        {editDialog.resetPassword
                                            ? t("buttons.cancelReset")
                                            : t("buttons.resetPassword")}
                                    </Button>
                                </Box>

                                {editDialog.resetPassword && (
                                    <>
                                        <TextField
                                            label={t(
                                                "editDialog.fields.newPassword"
                                            )}
                                            type="password"
                                            value={editDialog.newPassword}
                                            onChange={(e) =>
                                                setEditDialog({
                                                    ...editDialog,
                                                    newPassword: e.target.value,
                                                    errors: {
                                                        ...editDialog.errors,
                                                        newPassword: "",
                                                    },
                                                })
                                            }
                                            error={
                                                !!editDialog.errors.newPassword
                                            }
                                            helperText={
                                                editDialog.errors.newPassword ||
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
                                            type="password"
                                            value={editDialog.confirmPassword}
                                            onChange={(e) =>
                                                setEditDialog({
                                                    ...editDialog,
                                                    confirmPassword:
                                                        e.target.value,
                                                    errors: {
                                                        ...editDialog.errors,
                                                        confirmPassword: "",
                                                    },
                                                })
                                            }
                                            error={
                                                !!editDialog.errors
                                                    .confirmPassword
                                            }
                                            helperText={
                                                editDialog.errors
                                                    .confirmPassword
                                            }
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
                    <Button
                        onClick={() =>
                            setEditDialog({
                                ...editDialog,
                                open: false,
                                errors: {
                                    name: "",
                                    newPassword: "",
                                    confirmPassword: "",
                                },
                            })
                        }
                        disabled={isPending}
                    >
                        {t("buttons.cancel")}
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={isPending}
                    >
                        {t("buttons.save")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 2FA dialog */}
            <Dialog
                open={twoFactorDialog.open}
                onClose={() =>
                    setTwoFactorDialog({ ...twoFactorDialog, open: false })
                }
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {t("twoFactorDialog.title", {
                        userName: twoFactorDialog.userName,
                    })}
                </DialogTitle>
                <DialogContent>
                    {twoFactorDialog.step === 1 ? (
                        // Step 1: show QR code
                        <Box sx={{ textAlign: "center", py: 2 }}>
                            {isPending ? (
                                <CircularProgress />
                            ) : twoFactorDialog.error ? (
                                <Alert severity="error">
                                    {twoFactorDialog.error}
                                </Alert>
                            ) : twoFactorDialog.otpauthUrl ? (
                                <>
                                    <DialogContentText sx={{ mb: 2 }}>
                                        {t("twoFactorDialog.step1.instruction")}
                                    </DialogContentText>

                                    {/* QR code */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            mb: 2,
                                        }}
                                    >
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorDialog.otpauthUrl)}`}
                                            alt="2FA QR Code"
                                            style={{
                                                border: "1px solid #ddd",
                                                padding: "10px",
                                            }}
                                        />
                                    </Box>

                                    {/* Manual entry secret */}
                                    <DialogContentText
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {t("twoFactorDialog.step1.manualEntry")}
                                    </DialogContentText>
                                    <TextField
                                        value={twoFactorDialog.secret}
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                            },
                                        }}
                                        sx={{ mt: 1, mb: 2 }}
                                        size="small"
                                    />

                                    <DialogContentText sx={{ mt: 2 }}>
                                        {t("twoFactorDialog.step1.nextStep")}
                                    </DialogContentText>
                                </>
                            ) : null}
                        </Box>
                    ) : twoFactorDialog.step === 2 ? (
                        // Step 2: enter verification code
                        <Box sx={{ py: 2 }}>
                            <DialogContentText sx={{ mb: 2 }}>
                                {t("twoFactorDialog.step2.instruction")}
                            </DialogContentText>
                            <TextField
                                label={t("twoFactorDialog.step2.label")}
                                value={twoFactorDialog.verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6);
                                    setTwoFactorDialog({
                                        ...twoFactorDialog,
                                        verificationCode: value,
                                        error: "",
                                    });
                                }}
                                fullWidth
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 6,
                                        style: {
                                            textAlign: "center",
                                            fontSize: "24px",
                                            letterSpacing: "8px",
                                        },
                                    },
                                }}
                                error={!!twoFactorDialog.error}
                                helperText={twoFactorDialog.error}
                                disabled={isPending}
                            />
                        </Box>
                    ) : (
                        // Step 3: show backup codes
                        <Box sx={{ py: 2 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: t(
                                            "twoFactorDialog.step3.warning"
                                        ),
                                    }}
                                />
                            </Alert>

                            <DialogContentText sx={{ mb: 2, fontWeight: 600 }}>
                                {t("twoFactorDialog.step3.title")}
                            </DialogContentText>

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    bgcolor: "background.default",
                                    fontFamily: "monospace",
                                    fontSize: "14px",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 1,
                                    }}
                                >
                                    {twoFactorDialog.backupCodes.map(
                                        (code, index) => (
                                            <Box key={index}>
                                                {index + 1}. {code}
                                            </Box>
                                        )
                                    )}
                                </Box>
                            </Paper>

                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleCopyBackupCodes}
                                startIcon={
                                    twoFactorDialog.copied ? (
                                        <CheckCircleIcon />
                                    ) : undefined
                                }
                                color={
                                    twoFactorDialog.copied
                                        ? "success"
                                        : "primary"
                                }
                            >
                                {twoFactorDialog.copied
                                    ? t("buttons.copied")
                                    : t("buttons.copyBackupCodes")}
                            </Button>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {twoFactorDialog.step === 3 ? (
                        <Button
                            onClick={handleComplete2FA}
                            variant="contained"
                            fullWidth
                        >
                            {t("buttons.complete")}
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={() =>
                                    setTwoFactorDialog({
                                        ...twoFactorDialog,
                                        open: false,
                                    })
                                }
                                disabled={isPending}
                            >
                                {t("buttons.cancel")}
                            </Button>
                            {twoFactorDialog.step === 1 ? (
                                <Button
                                    onClick={() =>
                                        setTwoFactorDialog({
                                            ...twoFactorDialog,
                                            step: 2,
                                        })
                                    }
                                    variant="contained"
                                    disabled={
                                        isPending || !twoFactorDialog.otpauthUrl
                                    }
                                >
                                    {t("buttons.next")}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleVerify2FA}
                                    variant="contained"
                                    disabled={
                                        isPending ||
                                        twoFactorDialog.verificationCode
                                            .length !== 6
                                    }
                                >
                                    {isPending ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        t("buttons.verifyEnable")
                                    )}
                                </Button>
                            )}
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Snackbar messages */}
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
