"use client";

/**
 * User Management Tab
 *
 * 用户管理界面：
 * - 用户列表展示（基础 Table）
 * - 添加用户功能
 * - 编辑用户功能
 * - 删除用户功能
 *
 * 所有登录用户都可以访问
 */

import { useEffect, useState, useTransition } from "react";
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

    // 删除确认对话框
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        userId: string;
        userName: string;
    }>({
        open: false,
        userId: "",
        userName: "",
    });

    // 添加用户对话框
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

    // 2FA设置对话框
    const [twoFactorDialog, setTwoFactorDialog] = useState({
        open: false,
        userId: "",
        userName: "",
        step: 1, // 1: 显示QR码, 2: 输入验证码, 3: 显示备份码
        secret: "",
        otpauthUrl: "",
        backupCodes: [] as string[],
        verificationCode: "",
        error: "",
        copied: false,
    });

    // 编辑用户对话框
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

    // 加载用户列表
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

    // 处理删除用户
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
                    message: "User deleted successfully",
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

            setDeleteDialog({ open: false, userId: "", userName: "" });
        });
    };

    // 处理启用2FA - 打开对话框并生成secret
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

        // 生成2FA secret
        startTransition(async () => {
            const result = await generateTwoFactorSecret(userId);

            if (isSuccess(result)) {
                setTwoFactorDialog(prev => ({
                    ...prev,
                    secret: result.payload.secret,
                    otpauthUrl: result.payload.otpauthUrl,
                    backupCodes: result.payload.backupCodes || [],
                }));
            } else {
                setTwoFactorDialog(prev => ({
                    ...prev,
                    error: result.message,
                }));
            }
        });
    };

    // 处理验证2FA代码
    const handleVerify2FA = () => {
        const { userId, verificationCode } = twoFactorDialog;

        if (!verificationCode || verificationCode.length !== 6) {
            setTwoFactorDialog(prev => ({
                ...prev,
                error: "请输入6位验证码",
            }));
            return;
        }

        startTransition(async () => {
            const result = await verifyAndEnableTwoFactor(userId, verificationCode);

            if (isSuccess(result)) {
                // 跳转到step 3显示备份码
                setTwoFactorDialog(prev => ({
                    ...prev,
                    step: 3,
                    verificationCode: "",
                    error: "",
                }));
            } else {
                setTwoFactorDialog(prev => ({
                    ...prev,
                    error: result.message,
                }));
            }
        });
    };

    // 复制备份码到剪贴板
    const handleCopyBackupCodes = () => {
        const codes = twoFactorDialog.backupCodes.join('\n');
        navigator.clipboard.writeText(codes).then(() => {
            setTwoFactorDialog(prev => ({ ...prev, copied: true }));
            setTimeout(() => {
                setTwoFactorDialog(prev => ({ ...prev, copied: false }));
            }, 2000);
        });
    };

    // 完成2FA设置
    const handleComplete2FA = async () => {
        setSnackbar({
            open: true,
            message: "2FA enabled successfully",
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

    // 处理禁用2FA
    const handleDisable2FA = (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to disable 2FA for user "${userName}"?`)) {
            return;
        }

        startTransition(async () => {
            const result = await disableTwoFactor(userId);

            if (isSuccess(result)) {
                setSnackbar({
                    open: true,
                    message: "2FA disabled successfully",
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

    // 渲染认证方式 Badges
    const renderProviders = (providers: UserWithProvider["providers"]) => {
        return (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {providers.map((provider) => {
                    let color: "default" | "primary" | "secondary" | "success" =
                        "default";
                    let label = "";

                    if (provider.providerId === "credential") {
                        color = "primary";
                        label = "Credential";
                    } else if (provider.providerId === "github") {
                        color = "secondary";
                        label = "GitHub";
                    } else if (provider.providerId === "google") {
                        color = "success";
                        label = "Google";
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

    // 编辑用户
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

    // 验证编辑用户表单
    const validateEditForm = () => {
        const errors = {
            name: "",
            newPassword: "",
            confirmPassword: "",
        };

        if (!editDialog.name.trim()) {
            errors.name = "Name is required";
        }

        // 如果选择了重置密码
        if (editDialog.resetPassword) {
            if (!editDialog.newPassword) {
                errors.newPassword = "Password is required";
            } else if (editDialog.newPassword.length < 8) {
                errors.newPassword = "Password must be at least 8 characters";
            }

            if (!editDialog.confirmPassword) {
                errors.confirmPassword = "Please confirm password";
            } else if (editDialog.newPassword !== editDialog.confirmPassword) {
                errors.confirmPassword = "Passwords do not match";
            }
        }

        setEditDialog({ ...editDialog, errors });
        return !Object.values(errors).some((error) => error !== "");
    };

    // 提交编辑用户
    const handleEditSubmit = () => {
        if (!validateEditForm()) {
            return;
        }

        startTransition(async () => {
            // 更新用户信息
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

            // 如果需要重置密码
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
                message: "User updated successfully",
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
            // 重新加载用户列表
            await loadUsers();
        });
    };

    // 验证添加用户表单
    const validateAddForm = () => {
        const errors = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        };

        if (!addDialog.name.trim()) {
            errors.name = "Name is required";
        }

        if (!addDialog.email.trim()) {
            errors.email = "Email is required";
        } else if (!EMAIL_REGEX.test(addDialog.email)) {
            errors.email = "Invalid email format";
        }

        if (!addDialog.password) {
            errors.password = "Password is required";
        } else if (addDialog.password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        }

        if (!addDialog.confirmPassword) {
            errors.confirmPassword = "Please confirm password";
        } else if (addDialog.password !== addDialog.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setAddDialog({ ...addDialog, errors });
        return !Object.values(errors).some((error) => error !== "");
    };

    // 打开添加用户对话框
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

    // 提交添加用户
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
                    message: "User created successfully",
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

    return (
        <Box sx={{ p: 3 }}>
            {/* 顶部操作栏 */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Box>
                    <h2 style={{ margin: 0 }}>User Management</h2>
                    <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                        Manage users and their authentication methods
                    </p>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                    disabled={isPending}
                >
                    Add User
                </Button>
            </Box>

            {/* 用户列表 Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Auth Methods</TableCell>
                            <TableCell align="center">2FA Status</TableCell>
                            <TableCell align="center">Email Verified</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell align="center">Actions</TableCell>
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
                                    No users found
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
                                        {/* 2FA Status - 仅对credential用户显示 */}
                                        {user.providers.some(p => p.providerId === "credential") ? (
                                            user.twoFactorEnabled ? (
                                                <Chip
                                                    label="Enabled"
                                                    color="success"
                                                    size="small"
                                                    icon={<SecurityIcon />}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Disabled"
                                                    color="default"
                                                    size="small"
                                                />
                                            )
                                        ) : (
                                            <span style={{ color: "#999" }}>N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {user.emailVerified ? (
                                            <CheckCircleIcon
                                                color="success"
                                                fontSize="small"
                                            />
                                        ) : (
                                            <CancelIcon
                                                color="disabled"
                                                fontSize="small"
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
                                            title="Edit User"
                                            disabled={isPending}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        {/* 2FA管理按钮 - 仅对credential用户显示 */}
                                        {user.providers.some(p => p.providerId === "credential") && (
                                            user.twoFactorEnabled ? (
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => handleDisable2FA(user.id, user.name)}
                                                    title="Disable 2FA"
                                                    disabled={isPending}
                                                >
                                                    <SecurityIcon fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleEnable2FA(user.id, user.name)}
                                                    title="Enable 2FA"
                                                    disabled={isPending}
                                                >
                                                    <SecurityIcon fontSize="small" />
                                                </IconButton>
                                            )
                                        )}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                handleDeleteClick(
                                                    user.id,
                                                    user.name
                                                )
                                            }
                                            title="Delete User"
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

            {/* 删除确认对话框 */}
            <Dialog
                open={deleteDialog.open}
                onClose={() =>
                    setDeleteDialog({ open: false, userId: "", userName: "" })
                }
            >
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete user{" "}
                        <strong>{deleteDialog.userName}</strong>? This action
                        cannot be undone.
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
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={isPending}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 添加用户对话框 */}
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
                <DialogTitle>Add New User</DialogTitle>
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
                            label="Name"
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
                            label="Email"
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
                            label="Password"
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
                                "Minimum 8 characters"
                            }
                            fullWidth
                            required
                            disabled={isPending}
                        />
                        <TextField
                            label="Confirm Password"
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
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddSubmit}
                        variant="contained"
                        disabled={isPending}
                    >
                        Add User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 编辑用户对话框 */}
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
                <DialogTitle>Edit User</DialogTitle>
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
                            label="Name"
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
                            label="Email"
                            type="email"
                            value={editDialog.email}
                            fullWidth
                            disabled
                            helperText="Email cannot be changed"
                        />

                        {/* 密码重置区域（仅对 credential 用户显示） */}
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
                                            ? "Cancel Password Reset"
                                            : "Reset Password"}
                                    </Button>
                                </Box>

                                {editDialog.resetPassword && (
                                    <>
                                        <TextField
                                            label="New Password"
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
                                                "Minimum 8 characters"
                                            }
                                            fullWidth
                                            required
                                            disabled={isPending}
                                        />
                                        <TextField
                                            label="Confirm New Password"
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
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={isPending}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 2FA设置对话框 */}
            <Dialog
                open={twoFactorDialog.open}
                onClose={() => setTwoFactorDialog({ ...twoFactorDialog, open: false })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Enable 2FA for {twoFactorDialog.userName}
                </DialogTitle>
                <DialogContent>
                    {twoFactorDialog.step === 1 ? (
                        // Step 1: 显示QR码
                        <Box sx={{ textAlign: "center", py: 2 }}>
                            {isPending ? (
                                <CircularProgress />
                            ) : twoFactorDialog.error ? (
                                <Alert severity="error">{twoFactorDialog.error}</Alert>
                            ) : twoFactorDialog.otpauthUrl ? (
                                <>
                                    <DialogContentText sx={{ mb: 2 }}>
                                        Step 1: Scan the QR code with an authenticator app (e.g., Google Authenticator, Authy)
                                    </DialogContentText>
                                    
                                    {/* QR码 */}
                                    <Box sx={{ 
                                        display: "flex", 
                                        justifyContent: "center",
                                        mb: 2 
                                    }}>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorDialog.otpauthUrl)}`}
                                            alt="2FA QR Code"
                                            style={{ border: "1px solid #ddd", padding: "10px" }}
                                        />
                                    </Box>

                                    {/* Manual entry secret */}
                                    <DialogContentText variant="body2" color="text.secondary">
                                        Or enter this code manually:
                                    </DialogContentText>
                                    <TextField
                                        value={twoFactorDialog.secret}
                                        fullWidth
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        sx={{ mt: 1, mb: 2 }}
                                        size="small"
                                    />

                                    <DialogContentText sx={{ mt: 2 }}>
                                        Step 2: After scanning, click "Next" to enter the verification code
                                    </DialogContentText>
                                </>
                            ) : null}
                        </Box>
                    ) : twoFactorDialog.step === 2 ? (
                        // Step 2: 输入验证码
                        <Box sx={{ py: 2 }}>
                            <DialogContentText sx={{ mb: 2 }}>
                                Enter the 6-digit verification code from your authenticator app:
                            </DialogContentText>
                            <TextField
                                label="Verification Code"
                                value={twoFactorDialog.verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setTwoFactorDialog({
                                        ...twoFactorDialog,
                                        verificationCode: value,
                                        error: "",
                                    });
                                }}
                                fullWidth
                                inputProps={{ maxLength: 6, style: { textAlign: "center", fontSize: "24px", letterSpacing: "8px" } }}
                                error={!!twoFactorDialog.error}
                                helperText={twoFactorDialog.error}
                                disabled={isPending}
                            />
                        </Box>
                    ) : (
                        // Step 3: 显示备份码
                        <Box sx={{ py: 2 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <strong>Important:</strong> Save these backup codes in a safe place. 
                                Each code can only be used once and will help you regain access if you lose your authenticator device.
                            </Alert>
                            
                            <DialogContentText sx={{ mb: 2, fontWeight: 600 }}>
                                Your Backup Codes:
                            </DialogContentText>
                            
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 2, 
                                    mb: 2,
                                    bgcolor: 'background.default',
                                    fontFamily: 'monospace',
                                    fontSize: '14px'
                                }}
                            >
                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: 1 
                                }}>
                                    {twoFactorDialog.backupCodes.map((code, index) => (
                                        <Box key={index}>
                                            {index + 1}. {code}
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                            
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleCopyBackupCodes}
                                startIcon={twoFactorDialog.copied ? <CheckCircleIcon /> : undefined}
                                color={twoFactorDialog.copied ? "success" : "primary"}
                            >
                                {twoFactorDialog.copied ? "Copied!" : "Copy All Backup Codes"}
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
                            Complete
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={() => setTwoFactorDialog({ ...twoFactorDialog, open: false })}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            {twoFactorDialog.step === 1 ? (
                                <Button
                                    onClick={() => setTwoFactorDialog({ ...twoFactorDialog, step: 2 })}
                                    variant="contained"
                                    disabled={isPending || !twoFactorDialog.otpauthUrl}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleVerify2FA}
                                    variant="contained"
                                    disabled={isPending || twoFactorDialog.verificationCode.length !== 6}
                                >
                                    {isPending ? <CircularProgress size={24} /> : "Verify & Enable"}
                                </Button>
                            )}
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Snackbar 消息提示 */}
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
