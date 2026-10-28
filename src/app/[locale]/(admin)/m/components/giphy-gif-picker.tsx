"use client";

import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tab,
    Tabs,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBlockEditorContainer } from "@/block-note/block-editor-utils";
import VirtualizedMasonry from "@/components/virtualized-masonry";
import { ADMIN_API_PREFIX } from "@/settings";
import type { MasonryImage } from "@/types/masonry";

type GiphyMediaKind = "gifs" | "stickers";

interface GiphyRendition {
    url: string;
    width: string;
    height: string;
    webp?: string;
    mp4?: string;
}

interface GiphyGif {
    id: string;
    title: string;
    images: {
        fixed_height?: GiphyRendition;
        fixed_width?: GiphyRendition;
        downsized?: GiphyRendition;
        original?: GiphyRendition;
    };
}

interface GiphyListResponse {
    data: GiphyGif[];
    pagination: {
        total_count: number;
        count: number;
        offset: number;
    };
}

interface GiphyGifPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string, alt?: string) => void;
}

const PAGE_SIZE = 24;

function pickPreviewUrl(gif: GiphyGif, kind: GiphyMediaKind): string {
    const fh = gif.images.fixed_height;
    const fw = gif.images.fixed_width;
    if (kind === "stickers") {
        return fh?.webp || fw?.webp || fh?.url || fw?.url || "";
    }
    return fh?.url || fw?.url || fh?.webp || "";
}

function pickInsertUrl(gif: GiphyGif, kind: GiphyMediaKind): string {
    const { downsized, original, fixed_height, fixed_width } = gif.images;
    if (kind === "stickers") {
        return (
            downsized?.webp ||
            original?.webp ||
            fixed_height?.webp ||
            fixed_width?.webp ||
            downsized?.url ||
            original?.url ||
            fixed_height?.url ||
            ""
        );
    }
    return (
        downsized?.webp ||
        downsized?.url ||
        original?.webp ||
        original?.url ||
        fixed_height?.url ||
        ""
    );
}

function convertGiphyToMasonryImage(
    gif: GiphyGif,
    kind: GiphyMediaKind
): MasonryImage | null {
    const preview = pickPreviewUrl(gif, kind);
    const insert = pickInsertUrl(gif, kind);
    if (!preview || !insert) return null;

    const fh = gif.images.fixed_height || gif.images.fixed_width;
    const width = Number(fh?.width) || 200;
    const height = Number(fh?.height) || 200;

    return {
        id: gif.id,
        url: preview,
        width,
        height,
        alt: gif.title || undefined,
        title: gif.title || undefined,
        metadata: {
            giphy: {
                insertUrl: insert,
                kind,
            },
        },
    };
}

const GiphyGifPicker: React.FC<GiphyGifPickerProps> = ({
    open,
    onClose,
    onSelect,
}) => {
    const t = useTranslations("admin.giphy_gif_picker");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));

    const getColumnCount = useCallback(() => {
        if (isMobile) return 2;
        if (isTablet) return 3;
        return 4;
    }, [isMobile, isTablet]);

    const [kind, setKind] = useState<GiphyMediaKind>("gifs");
    const [searchTerm, setSearchTerm] = useState("");
    const [images, setImages] = useState<MasonryImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedAlt, setSelectedAlt] = useState("");
    const [selectedImageId, setSelectedImageId] = useState<
        number | string | null
    >(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiKeyRef = useRef<string | null>(null);

    const columnCount = getColumnCount();

    const ensureApiKey = useCallback(async (): Promise<string | null> => {
        if (apiKeyRef.current) return apiKeyRef.current;
        const response = await fetch(`${ADMIN_API_PREFIX}/giphy/config`);
        const data = await response.json();
        if (data?.code !== 200 || !data?.payload?.apiKey) {
            setError(t("errors.notConfigured"));
            return null;
        }
        apiKeyRef.current = data.payload.apiKey as string;
        return apiKeyRef.current;
    }, [t]);

    const fetchGiphy = useCallback(
        async (
            query: string,
            pageOffset: number,
            mediaKind: GiphyMediaKind,
            append: boolean
        ) => {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setError(null);
            }

            try {
                const apiKey = await ensureApiKey();
                if (!apiKey) {
                    if (!append) setImages([]);
                    setHasMore(false);
                    setHasLoaded(true);
                    return;
                }

                const params = new URLSearchParams({
                    api_key: apiKey,
                    limit: String(PAGE_SIZE),
                    offset: String(pageOffset),
                    rating: "pg",
                });
                const path = query.trim()
                    ? `/v1/${mediaKind}/search`
                    : `/v1/${mediaKind}/trending`;
                if (query.trim()) {
                    params.set("q", query.trim());
                }

                const response = await fetch(
                    `https://api.giphy.com${path}?${params.toString()}`
                );
                if (!response.ok) {
                    throw new Error(`Giphy HTTP ${response.status}`);
                }

                const data: GiphyListResponse = await response.json();
                const converted = data.data
                    .map((gif) => convertGiphyToMasonryImage(gif, mediaKind))
                    .filter((img): img is MasonryImage => img !== null);

                if (append) {
                    setImages((prev) => [...prev, ...converted]);
                } else {
                    setImages(converted);
                }

                const nextOffset = pageOffset + data.pagination.count;
                setOffset(nextOffset);
                setHasMore(nextOffset < data.pagination.total_count);
                setHasLoaded(true);
            } catch (err) {
                console.error("Giphy fetch error:", err);
                setError(t("errors.searchFailed"));
                if (!append) setImages([]);
                setHasMore(false);
                setHasLoaded(true);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [ensureApiKey, t]
    );

    useEffect(() => {
        if (!open) return;
        setSearchTerm("");
        setImages([]);
        setSelectedImage(null);
        setSelectedAlt("");
        setSelectedImageId(null);
        setOffset(0);
        setHasMore(true);
        setHasLoaded(false);
        setError(null);
        void fetchGiphy("", 0, kind, false);
    }, [open, kind, fetchGiphy]);

    const handleSearch = () => {
        setOffset(0);
        setHasMore(true);
        void fetchGiphy(searchTerm, 0, kind, false);
    };

    const loadMore = useCallback(() => {
        void fetchGiphy(searchTerm, offset, kind, true);
    }, [fetchGiphy, searchTerm, offset, kind]);

    const handleImageSelect = (image: MasonryImage) => {
        const meta = image.metadata?.giphy as
            | { insertUrl?: string }
            | undefined;
        const insertUrl = meta?.insertUrl || image.url;
        setSelectedImage(insertUrl);
        setSelectedImageId(image.id);
        setSelectedAlt(image.alt || image.title || "");
    };

    const resetAndClose = () => {
        onClose();
        setSearchTerm("");
        setImages([]);
        setSelectedImage(null);
        setSelectedAlt("");
        setSelectedImageId(null);
        setOffset(0);
        setHasMore(true);
        setHasLoaded(false);
        setError(null);
    };

    const handleConfirm = () => {
        if (selectedImage) {
            onSelect(selectedImage, selectedAlt);
            resetAndClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={resetAndClose}
            maxWidth="lg"
            {...(getBlockEditorContainer() && {
                container: getBlockEditorContainer(),
            })}
            fullWidth
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "flex-start",
                    paddingTop: "6vh",
                },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <SearchIcon color="primary" />
                        {t("title")}
                    </Typography>
                    <IconButton onClick={resetAndClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent
                sx={{ pt: 1, maxHeight: "70vh", overflowY: "auto" }}
            >
                <Tabs
                    value={kind}
                    onChange={(_, value: GiphyMediaKind) => setKind(value)}
                    sx={{ mb: 1, minHeight: 40 }}
                >
                    <Tab
                        value="gifs"
                        label={t("tabs.gifs")}
                        sx={{ textTransform: "none", minHeight: 40 }}
                    />
                    <Tab
                        value="stickers"
                        label={t("tabs.stickers")}
                        sx={{ textTransform: "none", minHeight: 40 }}
                    />
                </Tabs>

                <Box sx={{ mb: 2, mt: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            alignItems: "flex-start",
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            label={t("search.label")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                    e.preventDefault();
                                }
                            }}
                            placeholder={t("search.placeholder")}
                            variant="outlined"
                            sx={{ mt: 1 }}
                        />
                        <Button
                            type="button"
                            variant="contained"
                            onClick={handleSearch}
                            disabled={loading}
                            startIcon={
                                loading ? (
                                    <CircularProgress
                                        size={16}
                                        color="inherit"
                                    />
                                ) : (
                                    <SearchIcon />
                                )
                            }
                            sx={{
                                minWidth: 100,
                                height: 40,
                                whiteSpace: "nowrap",
                                textTransform: "none",
                                mt: 1,
                            }}
                        >
                            {loading
                                ? t("search.searching")
                                : t("search.button")}
                        </Button>
                    </Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1 }}
                    >
                        {t("attribution")}
                    </Typography>
                </Box>

                {error && (
                    <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {loading && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 4,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {!loading && hasLoaded && images.length === 0 && !error && (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                        <Typography variant="h6" color="text.secondary">
                            {t("states.noResults")}
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            {t("states.noResultsHint")}
                        </Typography>
                    </Box>
                )}

                {images.length > 0 && (
                    <VirtualizedMasonry
                        images={images}
                        columnCount={columnCount}
                        selectedImageId={selectedImageId}
                        onImageSelect={handleImageSelect}
                        gap={16}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                        onLoadMore={loadMore}
                        height="50vh"
                        showPhotographer={false}
                        showSelection={true}
                    />
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
                <Button onClick={resetAndClose} color="inherit">
                    {t("actions.cancel")}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!selectedImage}
                >
                    {t("actions.confirm")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GiphyGifPicker;
