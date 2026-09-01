"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SecurityIcon from "@mui/icons-material/Security";
import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { UserWithProvider } from "@/lib/services/user-management-service";

interface UserTableProps {
    users: UserWithProvider[];
    loading: boolean;
    onEdit: (user: UserWithProvider) => void;
    onDelete: (user: UserWithProvider) => void;
    onEnable2FA: (user: UserWithProvider) => void;
    onDisable2FA: (user: UserWithProvider) => void;
}

function ProviderChips({
    providers,
}: {
    providers: UserWithProvider["providers"];
}) {
    const t = useTranslations("configuration.userManagement");

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
}

export default function UserTable({
    users,
    loading,
    onEdit,
    onDelete,
    onEnable2FA,
    onDisable2FA,
}: UserTableProps) {
    const t = useTranslations("configuration.userManagement");

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{t("table.columns.name")}</TableCell>
                        <TableCell>{t("table.columns.email")}</TableCell>
                        <TableCell>{t("table.columns.authMethods")}</TableCell>
                        <TableCell align="center">
                            {t("table.columns.twoFactorStatus")}
                        </TableCell>
                        <TableCell align="center">
                            {t("table.columns.emailVerified")}
                        </TableCell>
                        <TableCell>{t("table.columns.createdAt")}</TableCell>
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
                        users.map((user) => {
                            const hasCredential = user.providers.some(
                                (p) => p.providerId === "credential"
                            );

                            return (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <ProviderChips
                                            providers={user.providers}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {hasCredential ? (
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
                                            onClick={() => onEdit(user)}
                                            title={t("tooltips.edit")}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        {hasCredential &&
                                            (user.twoFactorEnabled ? (
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() =>
                                                        onDisable2FA(user)
                                                    }
                                                    title={t(
                                                        "tooltips.disable2FA"
                                                    )}
                                                >
                                                    <SecurityIcon fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() =>
                                                        onEnable2FA(user)
                                                    }
                                                    title={t(
                                                        "tooltips.enable2FA"
                                                    )}
                                                >
                                                    <SecurityIcon fontSize="small" />
                                                </IconButton>
                                            ))}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => onDelete(user)}
                                            title={t("tooltips.delete")}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
