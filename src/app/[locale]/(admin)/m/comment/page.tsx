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
    Chip,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Alert,
    CircularProgress,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Avatar,
    Link as MuiLink,
} from "@mui/material";
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Delete as DeleteIcon,
    Check as ApproveIcon,
    Language as WebsiteIcon,
    Article as ArticleIcon,
} from "@mui/icons-material";
import { useTranslations, useLocale } from "next-intl";
import type { Comment, CommentStatus } from "@/types/comment";
import { ADMIN_API_PREFIX } from "@/config";
import { formatDateI18n } from "@/i18n/util";
import { getGravatarUrl } from "@/lib/gravatar-utils";

export default function CommentManagementPage() {
    const t = useTranslations("admin.comment");
    const locale = useLocale();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 400);
    const [statusFilter, setStatusFilter] = useState<CommentStatus | "all">("all");

    // Pagination (frontend implementation)
    const [pageIndex, setPageIndex] = useState(1);
    const pageSize = 20;

    // Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch all comments
    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${ADMIN_API_PREFIX}/comments`);
            const result = await response.json();

            if (result?.code !== 200) {
                setError(result?.message || t("messages.fetchError"));
                return;
            }

            const { comments: fetchedComments } = result?.payload;
            setComments(fetchedComments || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : t("messages.fetchError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Frontend filtering
    const filteredComments = comments.filter((comment) => {
        // Status filter
        if (statusFilter !== "all" && comment.status !== statusFilter) {
            return false;
        }

        // Search filter (search in content, author name, author email)
        if (debouncedSearchTerm) {
            const term = debouncedSearchTerm.toLowerCase();
            const matchContent = comment.content.toLowerCase().includes(term);
            const matchAuthor = comment.author.name.toLowerCase().includes(term);
            const matchEmail = comment.author.email.toLowerCase().includes(term);
            const matchArticle = comment.articleTitle.toLowerCase().includes(term);

            if (!matchContent && !matchAuthor && !matchEmail && !matchArticle) {
                return false;
            }
        }

        return true;
    });

    // Pagination calculation
    const totalPages = Math.ceil(filteredComments.length / pageSize);
    const paginatedComments = filteredComments.slice(
        (pageIndex - 1) * pageSize,
        pageIndex * pageSize
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setPageIndex(1);
    }, [debouncedSearchTerm, statusFilter]);

    // Approve comment
    const handleApprove = async (commentId: string) => {
        setActionLoading(commentId);
        setError(null);

        try {
            const response = await fetch(`${ADMIN_API_PREFIX}/comments/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId }),
            });

            const result = await response.json();

            if (result?.code !== 200) {
                throw new Error(result?.message || t("messages.approveError"));
            }

            setSuccess(t("messages.approveSuccess"));
            fetchComments();
        } catch (err) {
            setError(err instanceof Error ? err.message : t("messages.approveError"));
        } finally {
            setActionLoading(null);
        }
    };

    // Reject comment (delete)
    const handleReject = async (commentId: string) => {
        setActionLoading(commentId);
        setError(null);

        try {
            const response = await fetch(`${ADMIN_API_PREFIX}/comments/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId }),
            });

            const result = await response.json();

            if (result?.code !== 200) {
                throw new Error(result?.message || t("messages.rejectError"));
            }

            setSuccess(t("messages.rejectSuccess"));
            fetchComments();
        } catch (err) {
            setError(err instanceof Error ? err.message : t("messages.rejectError"));
        } finally {
            setActionLoading(null);
        }
    };

    // Open delete dialog
    const handleOpenDeleteDialog = (comment: Comment) => {
        setDeleteTarget(comment);
        setDeleteDialogOpen(true);
    };

    // Close delete dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        handleCloseDeleteDialog();
        await handleReject(deleteTarget.id);
    };

    // Get status chip color
    const getStatusColor = (status: CommentStatus): "default" | "success" | "warning" | "error" => {
        switch (status) {
            case "approved":
                return "success";
            case "pending":
                return "warning";
            case "rejected":
                return "error";
            default:
                return "default";
        }
    };

    // Get status label
    const getStatusLabel = (status: CommentStatus): string => {
        return t(`status.${status}`);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 2, px: { xs: 2, sm: 4, md: 6 } }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" component="h1">
                        {t("title")}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={fetchComments}
                        disabled={loading}
                    >
                        {t("actions.refresh")}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {/* Filters */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        <TextField
                            label={t("filters.search")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                                    ),
                                    endAdornment: (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                minWidth: 48,
                                                justifyContent: "flex-end",
                                                gap: 0.5,
                                            }}
                                        >
                                            {searchTerm !== debouncedSearchTerm ? (
                                                <CircularProgress size={16} />
                                            ) : (
                                                <Box sx={{ width: 16, height: 16 }} />
                                            )}
                                            {searchTerm ? (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearchTerm("")}
                                                    sx={{ padding: 0.5 }}
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                <Box sx={{ width: 24, height: 24 }} />
                                            )}
                                        </Box>
                                    ),
                                },
                            }}
                            size="small"
                            sx={{ minWidth: 250 }}
                            placeholder={t("filters.searchPlaceholder")}
                        />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t("filters.status")}</InputLabel>
                            <Select
                                value={statusFilter}
                                label={t("filters.status")}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value as CommentStatus | "all")
                                }
                            >
                                <MenuItem value="all">{t("filters.all")}</MenuItem>
                                <MenuItem value="pending">{t("filters.pending")}</MenuItem>
                                <MenuItem value="approved">{t("filters.approved")}</MenuItem>
                                <MenuItem value="rejected">{t("filters.rejected")}</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Paper>

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ overflow: "auto" }}>
                            <Table sx={{ tableLayout: "auto", minWidth: 1000 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: "15%" }}>{t("table.author")}</TableCell>
                                        <TableCell sx={{ width: "35%" }}>{t("table.content")}</TableCell>
                                        <TableCell sx={{ width: "15%" }}>{t("table.article")}</TableCell>
                                        <TableCell sx={{ width: "10%" }}>{t("table.status")}</TableCell>
                                        <TableCell sx={{ width: "12%" }}>{t("table.time")}</TableCell>
                                        <TableCell align="center" sx={{ width: "13%" }}>
                                            {t("table.actions")}
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedComments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    {filteredComments.length === 0 && comments.length > 0
                                                        ? t("table.noResults")
                                                        : t("table.noData")}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedComments.map((comment) => (
                                            <TableRow key={comment.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Avatar
                                                            src={getGravatarUrl(
                                                                comment.author.email,
                                                                comment.author.name,
                                                                40
                                                            )}
                                                            alt={comment.author.name}
                                                            sx={{ width: 40, height: 40 }}
                                                        />
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                noWrap
                                                                sx={{ fontWeight: 500 }}
                                                            >
                                                                {comment.author.name}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                noWrap
                                                            >
                                                                {comment.author.email}
                                                            </Typography>
                                                            {comment.author.website && (
                                                                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                                                    <MuiLink
                                                                        href={comment.author.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            fontSize: "0.75rem",
                                                                            textDecoration: "none",
                                                                        }}
                                                                        aria-label={t("table.website")}
                                                                    >
                                                                        <WebsiteIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                                                        {t("table.website")}
                                                                    </MuiLink>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title={comment.content} arrow placement="top">
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: "hidden",
                                                                wordBreak: "break-word",
                                                            }}
                                                        >
                                                            {comment.content}
                                                        </Typography>
                                                    </Tooltip>
                                                    {comment.replyToId && (
                                                        <Chip
                                                            label={t("table.reply")}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ mt: 1 }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title={comment.articleTitle} arrow>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <ArticleIcon
                                                                sx={{ fontSize: 16, color: "text.secondary" }}
                                                            />
                                                            <Typography variant="body2" noWrap>
                                                                {comment.articleTitle}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getStatusLabel(comment.status)}
                                                        color={getStatusColor(comment.status)}
                                                        size="small"
                                                        onClick={() => setStatusFilter(comment.status)}
                                                        sx={{ cursor: "pointer" }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap>
                                                        {formatDateI18n(comment.createdAt, locale)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                                                        {comment.status === "pending" && (
                                                            <Tooltip title={t("actions.approve")}>
                                                                <span>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="success"
                                                                        onClick={() => handleApprove(comment.id)}
                                                                        disabled={actionLoading === comment.id}
                                                                    >
                                                                        {actionLoading === comment.id ? (
                                                                            <CircularProgress size={20} />
                                                                        ) : (
                                                                            <ApproveIcon />
                                                                        )}
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                        {comment.status !== "rejected" && (
                                                            <Tooltip title={t("actions.reject")}>
                                                                <span>
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => handleOpenDeleteDialog(comment)}
                                                                        disabled={actionLoading === comment.id}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: { xs: "center", sm: "space-between" },
                                    alignItems: "center",
                                    flexDirection: { xs: "column", sm: "row" },
                                    gap: { xs: 2, sm: 0 },
                                    mt: 3,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ order: { xs: 2, sm: 1 } }}
                                >
                                    {t("pagination.totalWithPage", {
                                        total: filteredComments.length,
                                        current: pageIndex,
                                        totalPages,
                                    })}
                                </Typography>
                                <Pagination
                                    count={totalPages}
                                    page={pageIndex}
                                    onChange={(_, newPage) => setPageIndex(newPage)}
                                    color="primary"
                                    size="medium"
                                    sx={{ order: { xs: 1, sm: 2 } }}
                                />
                            </Box>
                        )}

                        {totalPages <= 1 && paginatedComments.length > 0 && (
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t("pagination.total", { total: filteredComments.length })}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Paper>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>{t("delete.title")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t("delete.content")}</DialogContentText>
                    {deleteTarget && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {t("delete.author", { name: deleteTarget.author.name })}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {deleteTarget.content}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="inherit">
                        {t("delete.cancel")}
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        {t("delete.confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
