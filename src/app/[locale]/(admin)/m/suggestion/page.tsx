"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/lib/hooks";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Pagination,
    Alert,
    CircularProgress,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Link as MuiLink,
} from "@mui/material";
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
} from "@mui/icons-material";
import { useTranslations, useLocale } from "next-intl";
import type { Suggestion } from "@/types/suggestion";
import { ADMIN_API_PREFIX } from "@/config";
import { formatDateI18n } from "@/i18n/util";

export default function SuggestionManagementPage() {
    const t = useTranslations("admin.suggestion");
    const locale = useLocale();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    // Pagination (frontend implementation)
    const [pageIndex, setPageIndex] = useState(1);
    const pageSize = 20;

    // Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Suggestion | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch all active suggestions
    const fetchSuggestions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${ADMIN_API_PREFIX}/suggestions`);
            const result = await response.json();

            if (result?.code !== 200) {
                setError(result?.message || t("messages.fetchError"));
                return;
            }

            const { suggestions: fetchedSuggestions } = result?.payload;
            setSuggestions(fetchedSuggestions || []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : t("messages.fetchError")
            );
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    // Frontend filtering
    const filteredSuggestions = suggestions.filter((suggestion) => {
        if (!debouncedSearchTerm) return true;

        const search = debouncedSearchTerm.toLowerCase();
        return (
            suggestion.name.toLowerCase().includes(search) ||
            suggestion.email.toLowerCase().includes(search) ||
            suggestion.content.toLowerCase().includes(search)
        );
    });

    // Frontend pagination
    const totalPages = Math.ceil(filteredSuggestions.length / pageSize);
    const paginatedSuggestions = filteredSuggestions.slice(
        (pageIndex - 1) * pageSize,
        pageIndex * pageSize
    );

    // Handle delete
    const handleDeleteClick = (suggestion: Suggestion) => {
        setDeleteTarget(suggestion);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        setActionLoading(deleteTarget.id);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(
                `${ADMIN_API_PREFIX}/suggestions/${deleteTarget.id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (result?.code !== 200) {
                setError(result?.message || t("messages.deleteError"));
                return;
            }

            setSuccess(t("messages.deleteSuccess"));
            setSuggestions((prev) =>
                prev.filter((s) => s.id !== deleteTarget.id)
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : t("messages.deleteError")
            );
        } finally {
            setActionLoading(null);
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };

    // Handle search clear
    const handleClearSearch = () => {
        setSearchTerm("");
        setPageIndex(1);
    };

    // Reset page when search changes
    useEffect(() => {
        setPageIndex(1);
    }, [debouncedSearchTerm]);

    if (loading) {
        return (
            <Container
                sx={{ py: 4, display: "flex", justifyContent: "center" }}
            >
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {t("title")}
            </Typography>

            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    onClose={() => setSuccess(null)}
                    sx={{ mb: 2 }}
                >
                    {success}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                        label={t("search.placeholder")}
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon
                                    sx={{ mr: 1, color: "action.active" }}
                                />
                            ),
                            endAdornment: searchTerm && (
                                <IconButton
                                    size="small"
                                    onClick={handleClearSearch}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            ),
                        }}
                        sx={{ flex: 1 }}
                    />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ minWidth: 120 }}
                    >
                        {t("stats.total")}: {filteredSuggestions.length}
                    </Typography>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t("table.name")}</TableCell>
                            <TableCell>{t("table.email")}</TableCell>
                            <TableCell sx={{ minWidth: 300 }}>
                                {t("table.content")}
                            </TableCell>
                            <TableCell>{t("table.ip")}</TableCell>
                            <TableCell>{t("table.createdAt")}</TableCell>
                            <TableCell align="center">
                                {t("table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedSuggestions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    align="center"
                                    sx={{ py: 4 }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {t("messages.noData")}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedSuggestions.map((suggestion) => (
                                <TableRow key={suggestion.id} hover>
                                    <TableCell>{suggestion.name}</TableCell>
                                    <TableCell>
                                        <MuiLink
                                            href={`mailto:${suggestion.email}`}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                textDecoration: "none",
                                                "&:hover": {
                                                    textDecoration: "underline",
                                                },
                                            }}
                                        >
                                            <EmailIcon fontSize="small" />
                                            {suggestion.email}
                                        </MuiLink>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: 400,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: "vertical",
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {suggestion.content}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {suggestion.metadata?.ip || "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {formatDateI18n(
                                                suggestion.createdAt,
                                                locale
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={t("actions.delete")}>
                                            <span>
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            suggestion
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        suggestion.id
                                                    }
                                                >
                                                    {actionLoading ===
                                                    suggestion.id ? (
                                                        <CircularProgress
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <DeleteIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={pageIndex}
                        onChange={(_, page) => setPageIndex(page)}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("deleteDialog.message")}
                    </DialogContentText>
                    {deleteTarget && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: "grey.100",
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="body2">
                                <strong>{t("table.name")}:</strong>{" "}
                                {deleteTarget.name}
                            </Typography>
                            <Typography variant="body2">
                                <strong>{t("table.email")}:</strong>{" "}
                                {deleteTarget.email}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>{t("table.content")}:</strong>
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 0.5,
                                    maxHeight: 100,
                                    overflow: "auto",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {deleteTarget.content}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleDeleteCancel}
                        disabled={!!actionLoading}
                    >
                        {t("deleteDialog.cancel")}
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={!!actionLoading}
                    >
                        {t("deleteDialog.confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
