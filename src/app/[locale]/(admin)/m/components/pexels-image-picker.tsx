"use client";

import React, { useState, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    CircularProgress,
    IconButton,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import VirtualizedMasonry from "@/components/virtualized-masonry";
import type { MasonryImage } from "@/types/masonry";
import { optimizePexelsImageWithPreset } from "@/lib/pexels-utils";
import { getBlockEditorContainer } from "@/block-note/block-editor-utils";
import { API_BASE_URL } from "@/settings";
import { useTranslations } from "next-intl";

interface PexelsImage {
    id: number;
    url: string;
    photographer: string;
    width: number;
    height: number;
    src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
    };
    alt: string;
}

interface PexelsResponse {
    photos: PexelsImage[];
    total_results: number;
    page: number;
    per_page: number;
}

interface PexelsImagePickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
}

const PexelsImagePicker: React.FC<PexelsImagePickerProps> = ({
    open,
    onClose,
    onSelect,
}) => {
    const t = useTranslations("admin.pexels_image_picker");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));

    // Responsive column count
    const getColumnCount = useCallback(() => {
        if (isMobile) return 2;
        if (isTablet) return 3;
        return 4;
    }, [isMobile, isTablet]);

    const [searchTerm, setSearchTerm] = useState("");
    const [images, setImages] = useState<MasonryImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageId, setSelectedImageId] = useState<
        number | string | null
    >(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);

    // Convert Pexels API data to general MasonryImage format
    const convertPexelsToMasonryImage = (
        pexelsImage: PexelsImage
    ): MasonryImage => ({
        id: pexelsImage.id,
        url: pexelsImage.src.original,
        photographer: pexelsImage.photographer,
        width: pexelsImage.width,
        height: pexelsImage.height,
        alt: pexelsImage.alt || `Photo by ${pexelsImage.photographer}`,
        metadata: {
            pexels: {
                original: pexelsImage.src.original,
                large: pexelsImage.src.large,
                medium: pexelsImage.src.medium,
                small: pexelsImage.src.small,
                tiny: pexelsImage.src.tiny,
            },
        },
    });

    // Create waterfall layout data grouping - simplified version, as we handle grouping in VirtualizedMasonry
    const columnCount = getColumnCount();

    const searchImages = useCallback(
        async (
            searchQuery: string,
            pageNum: number = 1,
            append: boolean = false
        ) => {
            if (!searchQuery.trim()) return;

            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                // This needs to be replaced with actual Pexels API call
                // Since this is frontend code, it should actually call Pexels through backend API
                const response = await fetch(`${API_BASE_URL}/pexels/search`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: searchQuery,
                        page: pageNum,
                        per_page: 15,
                    }),
                });

                if (response.ok) {
                    const data: PexelsResponse = await response.json();
                    const convertedImages = data.photos.map(
                        convertPexelsToMasonryImage
                    );
                    if (append) {
                        setImages((prev) => [...prev, ...convertedImages]);
                    } else {
                        setImages(convertedImages);
                    }
                    const totalPages = Math.ceil(
                        data.total_results / data.per_page
                    );
                    setHasMore(pageNum < totalPages);
                    setHasSearched(true);
                } else {
                    console.error("Failed to search images");
                    // Mock data for demonstration
                    if (!append) {
                        setImages([]);
                    }
                    setHasMore(false);
                    setHasSearched(true);
                }
            } catch (error) {
                console.error("Error searching images:", error);
                if (!append) {
                    setImages([]);
                }
                setHasMore(false);
                setHasSearched(true);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        []
    );

    const handleSearch = () => {
        setPage(1);
        setHasMore(true);
        searchImages(searchTerm, 1, false);
    };

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        searchImages(searchTerm, nextPage, true);
    }, [page, searchTerm, searchImages]);

    const handleImageSelect = (image: MasonryImage) => {
        // Get original image URL from metadata
        const pexelsData = image.metadata?.pexels as
            | { original?: string }
            | undefined;
        const originalUrl = pexelsData?.original || image.url;
        setSelectedImage(originalUrl);
        setSelectedImageId(image.id);
    };

    // Wrap optimizePexelsImageWithPreset to match VirtualizedMasonry's type
    const imageOptimizer = (imageUrl: string, preset: string) => {
        return optimizePexelsImageWithPreset(
            imageUrl,
            preset as "thumbnail" | "cover" | "highQuality" | "mobile"
        );
    };

    const handleConfirm = () => {
        if (selectedImage) {
            onSelect(selectedImage);
            onClose();
            // Reset state
            setSearchTerm("");
            setImages([]);
            setSelectedImage(null);
            setSelectedImageId(null);
            setPage(1);
            setHasMore(true);
            setHasSearched(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state
        setSearchTerm("");
        setImages([]);
        setSelectedImage(null);
        setSelectedImageId(null);
        setPage(1);
        setHasMore(true);
        setHasSearched(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            {...(getBlockEditorContainer() && {
                container: getBlockEditorContainer(),
            })}
            fullWidth
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "flex-start",
                    paddingTop: "6vh", // distance from top: 6% of viewport height
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
                            color: "text.primary",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <SearchIcon color="primary" />
                        {t("title")}
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: "text.secondary",
                            "&:hover": {
                                backgroundColor: "action.hover",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent
                sx={{
                    pt: 1,
                    maxHeight: "70vh",
                    overflowY: "auto",
                }}
            >
                <Box sx={{ mb: 3, mt: 1 }}>
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
                            sx={{
                                mt: 1, // Add top margin for TextField
                                "& .MuiOutlinedInput-root": {
                                    backgroundColor: "background.default",
                                    "&:hover .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "primary.main",
                                        },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "primary.main",
                                            borderWidth: 2,
                                        },
                                },
                                "& .MuiInputLabel-root": {
                                    "&.Mui-focused": {
                                        color: "primary.main",
                                    },
                                },
                            }}
                        />
                        <Button
                            type="button"
                            variant="contained"
                            onClick={handleSearch}
                            disabled={!searchTerm.trim() || loading}
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
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 500,
                                px: 2.5,
                                mt: 1, // Keep consistent top margin with TextField
                            }}
                        >
                            {loading
                                ? t("search.searching")
                                : t("search.button")}
                        </Button>
                    </Box>
                </Box>

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

                {!loading && hasSearched && images.length === 0 && (
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 6,
                            backgroundColor: "background.default",
                            borderRadius: 2,
                            border: "1px dashed",
                            borderColor: "divider",
                        }}
                    >
                        <SearchIcon
                            sx={{
                                fontSize: 48,
                                color: "text.disabled",
                                mb: 2,
                            }}
                        />
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            {t("states.noResults")}
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            {t("states.noResultsHint")}
                        </Typography>
                    </Box>
                )}

                {!loading && !hasSearched && (
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 6,
                            backgroundColor: "background.default",
                            borderRadius: 2,
                            border: "1px dashed",
                            borderColor: "divider",
                        }}
                    >
                        <SearchIcon
                            sx={{
                                fontSize: 48,
                                color: "primary.main",
                                mb: 2,
                            }}
                        />
                        <Typography
                            variant="h6"
                            color="text.primary"
                            sx={{ mb: 1 }}
                        >
                            {t("states.welcome")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("states.welcomeHint")}
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
                        imageOptimizer={imageOptimizer}
                        showPhotographer={true}
                        showSelection={true}
                        imagePreset="thumbnail"
                    />
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
                <Button
                    onClick={handleClose}
                    color="inherit"
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                        px: 2.5,
                    }}
                >
                    {t("actions.cancel")}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!selectedImage}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                        px: 2.5,
                    }}
                >
                    {t("actions.confirm")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PexelsImagePicker;
