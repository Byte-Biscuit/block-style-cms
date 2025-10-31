"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
} from "@mui/icons-material";
import { useTranslations, useLocale } from "next-intl";
import type { Article } from "@/types/article";
import { ADMIN_API_PREFIX, ADMIN_PAGE_PREFIX } from "@/config";
import { localeMap, locales, getLanguageDisplayName } from "@/i18n/config";
import { formatDateI18n } from "@/i18n/util";
import ErrorDisplay from "@/admin/m/components/error-display";
import Link from "@/components/link";

export default function PostListPage() {
    const router = useRouter();
    const t = useTranslations("admin.article.list");
    const locale = useLocale();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // User input original search terms and tag filters
    const [searchTerm, setSearchTerm] = useState("");
    const [tagFilter, setTagFilter] = useState("");

    // Use useDebounce to add debounce effect for search terms and tag filters
    const debouncedSearchTerm = useDebounce(searchTerm, 400);
    const debouncedTagFilter = useDebounce(tagFilter, 400);

    const [localeFilter, setLocaleFilter] = useState<
        "all" | (typeof locales)[number]
    >("all");
    const [publishedFilter, setPublishedFilter] = useState<
        "all" | "published" | "draft"
    >("all");
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const params = new URLSearchParams();
            if (debouncedSearchTerm)
                params.append("searchTerm", debouncedSearchTerm);
            if (localeFilter !== "all") params.append("locale", localeFilter);
            if (publishedFilter !== "all")
                params.append("published", publishedFilter);
            if (debouncedTagFilter) params.append("tag", debouncedTagFilter);
            params.append("pageIndex", pageIndex.toString());
            params.append("pageSize", "20");
            const response = await fetch(
                `${ADMIN_API_PREFIX}/articles?${params.toString()}`
            );
            const result = await response.json();

            if (result?.code !== 200) {
                setError(result?.message || t("messages.fetchError"));
                return;
            }
            const { data, total, totalPages } = result?.payload;
            setArticles(data);
            setTotal(total);
            setTotalPages(totalPages);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : t("messages.fetchError")
            );
        } finally {
            setLoading(false);
        }
    }, [
        debouncedSearchTerm,
        localeFilter,
        publishedFilter,
        debouncedTagFilter,
        pageIndex,
        t,
    ]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // When search terms or tag filters change, reset page to first page
    useEffect(() => {
        setPageIndex(1);
    }, [
        debouncedSearchTerm,
        debouncedTagFilter,
        localeFilter,
        publishedFilter,
    ]);

    // Delete confirmation dialog related state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        slug: string;
    } | null>(null);

    // Open delete confirmation dialog
    const handleOpenDeleteDialog = (id: string, slug: string) => {
        setDeleteTarget({ id, slug });
        setDeleteDialogOpen(true);
    };
    // Close dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };
    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, slug } = deleteTarget;
        setDeleteDialogOpen(false);
        setDeleteTarget(null);

        try {
            const response = await fetch(
                `${ADMIN_API_PREFIX}/articles/${slug}/${id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (result?.code !== 200) {
                throw new Error(result?.message || t("messages.deleteError"));
            }

            setSuccess(t("messages.deleteSuccess"));
            fetchPosts();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : t("messages.deleteError")
            );
        }
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
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push(`${ADMIN_PAGE_PREFIX}/new`)}
                        size="large"
                    >
                        {t("actions.newArticle")}
                    </Button>
                </Box>

                {error && (
                    <ErrorDisplay
                        error={error}
                        title={t("messages.fetchError")}
                    />
                )}

                {success && (
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        onClose={() => setSuccess(null)}
                    >
                        {success}
                    </Alert>
                )}

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
                            label={t("actions.search")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <SearchIcon
                                            sx={{
                                                mr: 1,
                                                color: "text.secondary",
                                            }}
                                        />
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
                                            {searchTerm !==
                                            debouncedSearchTerm ? (
                                                <CircularProgress size={16} />
                                            ) : (
                                                // Placeholder element to keep layout stable
                                                <Box
                                                    sx={{
                                                        width: 16,
                                                        height: 16,
                                                    }}
                                                />
                                            )}
                                            {searchTerm ? (
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        setSearchTerm("")
                                                    }
                                                    sx={{ padding: 0.5 }}
                                                    aria-label={t(
                                                        "actions.clearSearch"
                                                    )}
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                <Box
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ),
                                },
                            }}
                            size="small"
                            sx={{ minWidth: 200 }}
                            placeholder={t("search.placeholder")}
                        />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t("filters.language")}</InputLabel>
                            <Select
                                value={localeFilter}
                                label={t("filters.language")}
                                onChange={(e) =>
                                    setLocaleFilter(
                                        e.target.value as
                                            | "all"
                                            | (typeof locales)[number]
                                    )
                                }
                            >
                                <MenuItem value="all">
                                    {t("filters.all")}
                                </MenuItem>
                                {Object.values(localeMap).map((lang) => (
                                    <MenuItem key={lang.code} value={lang.code}>
                                        {lang.nativeName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t("filters.status")}</InputLabel>
                            <Select
                                value={publishedFilter}
                                label={t("filters.status")}
                                onChange={(e) =>
                                    setPublishedFilter(
                                        e.target.value as
                                            | "all"
                                            | "published"
                                            | "draft"
                                    )
                                }
                            >
                                <MenuItem value="all">
                                    {t("filters.all")}
                                </MenuItem>
                                <MenuItem value="published">
                                    {t("filters.published")}
                                </MenuItem>
                                <MenuItem value="draft">
                                    {t("filters.draft")}
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label={t("filters.tagFilter")}
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                            size="small"
                            sx={{ minWidth: 150 }}
                            placeholder={t("search.tagPlaceholder")}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <FilterIcon
                                            sx={{
                                                mr: 1,
                                                color: "text.secondary",
                                            }}
                                        />
                                    ),
                                    endAdornment: (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                minWidth: 48, // Fixed minimum width to prevent shaking
                                                justifyContent: "flex-end",
                                                gap: 0.5,
                                            }}
                                        >
                                            {tagFilter !==
                                            debouncedTagFilter ? (
                                                <CircularProgress size={16} />
                                            ) : (
                                                // Placeholder element to keep layout stable
                                                <Box
                                                    sx={{
                                                        width: 16,
                                                        height: 16,
                                                    }}
                                                />
                                            )}
                                            {tagFilter ? (
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        setTagFilter("")
                                                    }
                                                    sx={{ padding: 0.5 }}
                                                    aria-label={t(
                                                        "actions.clearTagFilter"
                                                    )}
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                // Placeholder element to keep clear button position stable
                                                <Box
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ),
                                },
                            }}
                        />
                    </Box>
                </Paper>

                {loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 4,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ overflow: "auto" }}>
                            <Table sx={{ tableLayout: "auto", minWidth: 800 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: "45%" }}>
                                            {t("table.title")}
                                        </TableCell>
                                        <TableCell sx={{ width: "22%" }}>
                                            {t("table.tags")}
                                        </TableCell>
                                        <TableCell sx={{ width: "12%" }}>
                                            {t("table.status")}
                                        </TableCell>
                                        <TableCell sx={{ width: "12%" }}>
                                            {t("table.updateTime")}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{ width: "9%" }}
                                        >
                                            {t("table.actions")}
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {!articles || articles.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                align="center"
                                                sx={{ py: 4 }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    color="text.secondary"
                                                >
                                                    {t("table.noData")}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        articles?.map((article) => (
                                            <TableRow
                                                key={`${article.id}`}
                                                hover
                                            >
                                                <TableCell>
                                                    <Box>
                                                        <Tooltip
                                                            title={
                                                                article.summary
                                                            }
                                                            arrow
                                                            placement="top"
                                                        >
                                                            <Typography
                                                                variant="subtitle1"
                                                                noWrap
                                                                sx={{
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                [
                                                                {getLanguageDisplayName(
                                                                    article.locale
                                                                )}
                                                                ]{" "}
                                                                {article.title}
                                                            </Typography>
                                                        </Tooltip>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            noWrap
                                                        >
                                                            {article.slug}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: 0.5,
                                                            maxWidth: 200,
                                                        }}
                                                    >
                                                        {article.tags
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <Chip
                                                                    key={tag}
                                                                    label={tag}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setTagFilter(
                                                                            tag
                                                                        );
                                                                    }}
                                                                    sx={{
                                                                        cursor: "pointer",
                                                                    }}
                                                                />
                                                            ))}
                                                        {article.tags.length >
                                                            3 && (
                                                            <Tooltip
                                                                title={article.tags.join(
                                                                    ", "
                                                                )}
                                                            >
                                                                <Chip
                                                                    label={`+${
                                                                        article
                                                                            .tags
                                                                            .length -
                                                                        3
                                                                    }`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="default"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        // Add logic to show all tags here
                                                                    }}
                                                                    sx={{
                                                                        cursor: "pointer",
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            article.published
                                                                ? t(
                                                                      "status.published"
                                                                  )
                                                                : t(
                                                                      "status.draft"
                                                                  )
                                                        }
                                                        color={
                                                            article.published
                                                                ? "success"
                                                                : "default"
                                                        }
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPublishedFilter(
                                                                article.published
                                                                    ? "published"
                                                                    : "draft"
                                                            );
                                                        }}
                                                        sx={{
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDateI18n(
                                                            article.updatedAt ||
                                                                article.createdAt!,
                                                            locale
                                                        )}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Tooltip
                                                            title={t(
                                                                "actions.view"
                                                            )}
                                                        >
                                                            <IconButton size="small">
                                                                <Link
                                                                    href={`/${article.locale}/articles/${article.slug}`}
                                                                    target="_blank"
                                                                >
                                                                    <ViewIcon />
                                                                </Link>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip
                                                            title={t(
                                                                "actions.edit"
                                                            )}
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `${ADMIN_PAGE_PREFIX}/edit/${article.slug}/${article.id}`
                                                                    )
                                                                }
                                                                color="primary"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip
                                                            title={t(
                                                                "actions.delete"
                                                            )}
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    article.id &&
                                                                    handleOpenDeleteDialog(
                                                                        article.id,
                                                                        article.slug
                                                                    )
                                                                }
                                                                color="error"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
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
                                    justifyContent: {
                                        xs: "center",
                                        sm: "space-between",
                                    },
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
                                        total,
                                        current: pageIndex,
                                        totalPages,
                                    })}
                                </Typography>
                                <Pagination
                                    count={totalPages}
                                    page={pageIndex}
                                    onChange={(_, newPage) =>
                                        setPageIndex(newPage)
                                    }
                                    color="primary"
                                    size="medium"
                                    sx={{ order: { xs: 1, sm: 2 } }}
                                />
                            </Box>
                        )}
                        {/* If only one page but has data, also show total record count */}
                        {totalPages <= 1 && articles?.length > 0 && (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    mt: 3,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t("pagination.total", { total })}
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="inherit">
                        {t("delete.cancel")}
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                    >
                        {t("delete.confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
