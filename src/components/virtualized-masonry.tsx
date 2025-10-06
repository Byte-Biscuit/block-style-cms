"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Box, Typography, CircularProgress } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import type { MasonryImage, VirtualizedMasonryProps } from "@/types/masonry";

// Masonry component
const VirtualizedMasonry: React.FC<VirtualizedMasonryProps> = ({
    images,
    columnCount,
    selectedImageId = null,
    onImageSelect,
    gap = 16,
    hasMore = false,
    loadingMore = false,
    onLoadMore,
    height = "50vh",
    imageOptimizer,
    showPhotographer = true,
    showSelection = true,
    imagePreset = "thumbnail",
}) => {
    // Distribute images into columns, ensuring height balance
    const columns = useMemo(() => {
        const cols: MasonryImage[][] = Array.from(
            { length: columnCount },
            () => []
        );
        const colHeights: number[] = Array(columnCount).fill(0);

        images.forEach((image) => {
            // Find the column with the minimum current height
            const minHeightIndex = colHeights.indexOf(Math.min(...colHeights));
            cols[minHeightIndex].push(image);

            // Estimate image height (based on aspect ratio)
            const aspectRatio = image.height / (image.width || 300);
            const estimatedHeight = 300 * aspectRatio; // Assume display width is 300px
            colHeights[minHeightIndex] += estimatedHeight + gap;
        });

        return cols;
    }, [images, columnCount, gap]);

    // Render individual image item
    const renderImageItem = (image: MasonryImage, index: number) => {
        // Use the provided image optimizer or default image URL
        const imageSrc = imageOptimizer
            ? imageOptimizer(image.url, imagePreset)
            : image.url;

        return (
            <Box
                title={image.title || image.alt}
                key={`${image.id}-${index}`}
                sx={{
                    cursor: onImageSelect ? "pointer" : "default",
                    border: selectedImageId === image.id ? 3 : 1,
                    borderColor:
                        selectedImageId === image.id
                            ? "primary.main"
                            : "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    position: "relative",
                    backgroundColor: "#f5f5f5",
                    mb: `${gap}px`, // Vertical spacing between images
                    breakInside: "avoid", // Prevent images from being cut during pagination
                    "&:hover": onImageSelect
                        ? {
                              transform: "translateY(-2px)",
                              boxShadow: 3,
                              borderColor: "primary.main",
                          }
                        : {},
                }}
                onClick={() => onImageSelect?.(image)}
            >
                <Image
                    src={imageSrc}
                    alt={
                        image.alt ||
                        image.title ||
                        `Photo by ${image.photographer || "Unknown"}`
                    }
                    width={image.width || 300}
                    height={image.height || 200}
                    style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                    }}
                    unoptimized={true}
                />

                {/* Photographer information */}
                {showPhotographer && image.photographer && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                            color: "white",
                            p: 1,
                            fontSize: "0.75rem",
                        }}
                    >
                        📸 {image.photographer}
                    </Box>
                )}
                {/* Selected state */}
                {showSelection && selectedImageId === image.id && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "primary.main",
                            borderRadius: "50%",
                            color: "white",
                            boxShadow: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            zIndex: 2,
                        }}
                    >
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ height, width: "100%", position: "relative" }}>
            {/* Use traditional scroll container instead of virtual scrolling */}
            <Box
                sx={{
                    height: "100%",
                    overflowY: "auto",
                    display: "grid",
                    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                    gap: `${gap}px`,
                    alignItems: "start", // Key: make columns align from the top
                    padding: 1,
                }}
                onScroll={
                    onLoadMore
                        ? (e) => {
                              const { scrollTop, scrollHeight, clientHeight } =
                                  e.target as HTMLDivElement;
                              const scrollBottom =
                                  scrollHeight - scrollTop - clientHeight;

                              // Load more when scrolled near the bottom (50px from bottom)
                              if (
                                  scrollBottom < 50 &&
                                  hasMore &&
                                  !loadingMore &&
                                  images.length > 0
                              ) {
                                  onLoadMore();
                              }
                          }
                        : undefined
                }
            >
                {columns.map((columnImages, columnIndex) => (
                    <Box
                        key={columnIndex}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {columnImages.map((image, idx) =>
                            renderImageItem(image, idx)
                        )}
                    </Box>
                ))}
            </Box>

            {/* Load more indicator */}
            {loadingMore && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <CircularProgress size={24} />
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                    >
                        Loading more images...
                    </Typography>
                </Box>
            )}

            {/* No more data indicator */}
            {!hasMore && images.length > 0 && onLoadMore && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        py: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(4px)",
                        borderTop: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        All images loaded
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default VirtualizedMasonry;
