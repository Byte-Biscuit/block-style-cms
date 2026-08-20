"use client";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import {
    type ApiTokenSummary,
    createApiToken,
    getApiToken,
    listApiTokens,
    revokeApiToken,
} from "@/app/actions/settings/api-tokens";
import { isSuccess } from "@/lib/response";

const EXPIRES_OPTIONS = [
    { value: "", days: 0 },
    { value: "30", seconds: 60 * 60 * 24 * 30 },
    { value: "90", seconds: 60 * 60 * 24 * 90 },
    { value: "365", seconds: 60 * 60 * 24 * 365 },
] as const;

function formatDate(value: Date | string | null | undefined) {
    if (!value) {
        return "—";
    }
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
        return "—";
    }
    return d.toLocaleString();
}

export default function ApiTokensTab() {
    const t = useTranslations("configuration.apiTokens");
    const [tokens, setTokens] = useState<ApiTokenSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [expires, setExpires] = useState("");
    const [createdKey, setCreatedKey] = useState<string | null>(null);

    const [detail, setDetail] = useState<ApiTokenSummary | null>(null);
    const [revokeTarget, setRevokeTarget] = useState<ApiTokenSummary | null>(
        null
    );

    const load = () => {
        startTransition(async () => {
            const result = await listApiTokens();
            if (isSuccess(result)) {
                setTokens(result.payload);
            } else {
                setSnackbar({
                    open: true,
                    message: result.message,
                    severity: "error",
                });
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        startTransition(async () => {
            const result = await listApiTokens();
            if (isSuccess(result)) {
                setTokens(result.payload);
            } else {
                setSnackbar({
                    open: true,
                    message: result.message,
                    severity: "error",
                });
            }
            setLoading(false);
        });
    }, []);

    const handleCreate = () => {
        const option = EXPIRES_OPTIONS.find((o) => o.value === expires);
        startTransition(async () => {
            const result = await createApiToken({
                name,
                expiresInSeconds:
                    option && "seconds" in option ? option.seconds : null,
            });
            if (isSuccess(result) && result.payload.key) {
                setCreatedKey(result.payload.key);
                setName("");
                setExpires("");
                load();
            } else {
                setSnackbar({
                    open: true,
                    message: result.message,
                    severity: "error",
                });
            }
        });
    };

    const handleDetail = (id: string) => {
        startTransition(async () => {
            const result = await getApiToken(id);
            if (isSuccess(result) && result.payload) {
                setDetail(result.payload);
            } else {
                setSnackbar({
                    open: true,
                    message: result.message,
                    severity: "error",
                });
            }
        });
    };

    const handleRevoke = () => {
        if (!revokeTarget) {
            return;
        }
        startTransition(async () => {
            const result = await revokeApiToken(revokeTarget.id);
            if (isSuccess(result)) {
                setRevokeTarget(null);
                setSnackbar({
                    open: true,
                    message: t("messages.revoked"),
                    severity: "success",
                });
                load();
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
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Box>
                    <Typography variant="h6">{t("page.title")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("page.subtitle")}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setCreatedKey(null);
                        setCreateOpen(true);
                    }}
                >
                    {t("buttons.create")}
                </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{t("table.name")}</TableCell>
                            <TableCell>{t("table.start")}</TableCell>
                            <TableCell>{t("table.expiresAt")}</TableCell>
                            <TableCell>{t("table.lastRequest")}</TableCell>
                            <TableCell align="right">
                                {t("table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : tokens.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    {t("table.empty")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            tokens.map((token) => (
                                <TableRow key={token.id}>
                                    <TableCell>{token.name || "—"}</TableCell>
                                    <TableCell>
                                        {token.start ? `${token.start}…` : "—"}
                                    </TableCell>
                                    <TableCell>
                                        {token.expiresAt
                                            ? formatDate(token.expiresAt)
                                            : t("expires.never")}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(token.lastRequest)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleDetail(token.id)
                                            }
                                            aria-label={t("buttons.detail")}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                setRevokeTarget(token)
                                            }
                                            aria-label={t("buttons.revoke")}
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

            <Dialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{t("create.title")}</DialogTitle>
                <DialogContent>
                    {createdKey ? (
                        <Box sx={{ pt: 1 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                {t("create.copyOnce")}
                            </Alert>
                            <TextField
                                fullWidth
                                value={createdKey}
                                slotProps={{ input: { readOnly: true } }}
                            />
                            <Button
                                sx={{ mt: 1 }}
                                startIcon={<ContentCopyIcon />}
                                onClick={() => {
                                    navigator.clipboard.writeText(createdKey);
                                    setSnackbar({
                                        open: true,
                                        message: t("messages.copied"),
                                        severity: "success",
                                    });
                                }}
                            >
                                {t("buttons.copy")}
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                pt: 1,
                            }}
                        >
                            <TextField
                                label={t("create.name")}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                fullWidth
                            />
                            <TextField
                                select
                                label={t("create.expires")}
                                value={expires}
                                onChange={(e) => setExpires(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="">
                                    {t("expires.never")}
                                </MenuItem>
                                <MenuItem value="30">
                                    {t("expires.days30")}
                                </MenuItem>
                                <MenuItem value="90">
                                    {t("expires.days90")}
                                </MenuItem>
                                <MenuItem value="365">
                                    {t("expires.days365")}
                                </MenuItem>
                            </TextField>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>
                        {t("buttons.close")}
                    </Button>
                    {!createdKey && (
                        <Button
                            variant="contained"
                            onClick={handleCreate}
                            disabled={isPending || !name.trim()}
                        >
                            {t("buttons.create")}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={!!detail} onClose={() => setDetail(null)} fullWidth>
                <DialogTitle>{t("detail.title")}</DialogTitle>
                <DialogContent>
                    {detail && (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                pt: 1,
                            }}
                        >
                            <Typography>
                                {t("table.name")}: {detail.name || "—"}
                            </Typography>
                            <Typography>
                                {t("table.start")}:{" "}
                                {detail.start ? `${detail.start}…` : "—"}
                            </Typography>
                            <Typography>
                                {t("table.expiresAt")}:{" "}
                                {detail.expiresAt
                                    ? formatDate(detail.expiresAt)
                                    : t("expires.never")}
                            </Typography>
                            <Typography>
                                {t("table.lastRequest")}:{" "}
                                {formatDate(detail.lastRequest)}
                            </Typography>
                            <Typography>
                                {t("table.createdAt")}:{" "}
                                {formatDate(detail.createdAt)}
                            </Typography>
                            <Typography>
                                {t("table.enabled")}:{" "}
                                {detail.enabled
                                    ? t("status.enabled")
                                    : t("status.disabled")}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetail(null)}>
                        {t("buttons.close")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!revokeTarget} onClose={() => setRevokeTarget(null)}>
                <DialogTitle>{t("revoke.title")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("revoke.confirm", {
                            name: revokeTarget?.name || revokeTarget?.id || "",
                        })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRevokeTarget(null)}>
                        {t("buttons.close")}
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleRevoke}
                        disabled={isPending}
                    >
                        {t("buttons.revoke")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
