"use client";

import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { Box, Dialog, IconButton } from "@mui/material";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import { mediaConstrainedFrameClass } from "@/lib/style-classes";

export interface ImageBlockProps {
    src?: string;
    alt?: string;
    caption?: string;
    width?: string;
    height?: string;
    source?: "upload" | "url" | "pexels";
    alignment?: "left" | "center" | "right";
    objectFit?: "contain" | "cover" | "fill" | "scale-down" | "none";
    maxWidth?: string;
}

export interface EnhancedImageBlockData {
    id: string;
    type: "enhancedImage";
    props: ImageBlockProps;
}

interface EnhancedImageProps {
    data: EnhancedImageBlockData;
    className?: string;
    controls?: React.ReactNode;
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
    data,
    className = "",
    controls = null,
}) => {
    const { props } = data;

    const captionText = props.caption?.trim();
    const altText = props.alt?.trim() || captionText || "Article image";
    const t = useTranslations("web.image");
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    if (!props?.src) return null;

    return (
        <figure className={`w-full ${className || ""}`}>
            <div className="flex w-full justify-center">
                <div
                    className={`group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-gray-900 ${mediaConstrainedFrameClass}`}
                >
                    <button
                        type="button"
                        aria-label={t("zoom")}
                        className="absolute inset-0 z-0 cursor-zoom-in border-0 bg-transparent p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpen();
                        }}
                    >
                        <Image
                            src={props.src}
                            alt={altText}
                            fill
                            unoptimized
                            style={{
                                objectFit: "contain",
                            }}
                            priority={false}
                            placeholder="empty"
                            sizes="(max-width: 568px) 100vw, 568px"
                        />

                        {/* Hover hint for “this image can be zoomed”. */}
                        <div
                            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            aria-hidden="true"
                        >
                            <div className="rounded-full bg-black/40 p-2 text-white">
                                <ZoomInIcon fontSize="medium" />
                            </div>
                        </div>
                    </button>

                    {controls && (
                        <div className="absolute top-1 right-1 z-50">
                            {controls}
                        </div>
                    )}
                </div>
            </div>

            {captionText && (
                <figcaption className="border-gray-100 border-t bg-gray-50 px-4 py-3 text-center font-medium text-gray-600 text-sm leading-relaxed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {captionText}
                </figcaption>
            )}

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
                PaperProps={{
                    sx: { bgcolor: "transparent", boxShadow: "none" },
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        cursor: "zoom-out",
                        lineHeight: 0,
                    }}
                    onClick={handleClose}
                >
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        aria-label={t("closePreview")}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            backgroundColor: "rgba(0, 0, 0, 0.45)",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Image
                        src={props.src}
                        alt={altText}
                        width={0}
                        height={0}
                        unoptimized
                        style={{
                            display: "block",
                            width: "auto",
                            height: "auto",
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                            borderRadius: 8,
                            objectFit: "contain",
                        }}
                    />
                </Box>
            </Dialog>
        </figure>
    );
};

export default EnhancedImage;
