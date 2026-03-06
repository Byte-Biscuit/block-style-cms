"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Typography,
    CircularProgress,
    Alert,
    Dialog,
    DialogContent,
    IconButton,
    Box,
    Tooltip,
} from "@mui/material";
import {
    Close as CloseIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    FitScreen as FitScreenIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { roundedPx } from "@/lib/style-classes";

export interface MermaidBlockProps {
    code?: string;
    theme?:
        | "default"
        | "base"
        | "dark"
        | "forest"
        | "neutral"
        | "null"
        | undefined;
}

export interface MermaidBlockData {
    id: string;
    type: "mermaid";
    props: MermaidBlockProps;
}

interface MermaidProps {
    data: MermaidBlockData;
    className?: string;
}

// Extract natural dimensions from SVG viewBox (used to calculate fit-to-window scale)
function getSvgDimensions(
    svgContent: string
): { width: number; height: number } | null {
    const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/[\s,]+/);
        if (parts.length === 4) {
            const w = parseFloat(parts[2]);
            const h = parseFloat(parts[3]);
            if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0)
                return { width: w, height: h };
        }
    }
    // Fallback: numeric width/height attributes
    const wMatch = svgContent.match(/\swidth=["']([0-9.]+)["']/);
    const hMatch = svgContent.match(/\sheight=["']([0-9.]+)["']/);
    if (wMatch && hMatch) {
        const w = parseFloat(wMatch[1]);
        const h = parseFloat(hMatch[1]);
        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0)
            return { width: w, height: h };
    }
    return null;
}

// Global state management for Mermaid initialization
let mermaidModule: typeof import("mermaid") | null = null;
let mermaidImportPromise: Promise<typeof import("mermaid")> | null = null;

// Get Mermaid instance (singleton)
const getMermaid = async (): Promise<typeof import("mermaid")> => {
    if (mermaidModule) return mermaidModule;
    if (!mermaidImportPromise) {
        mermaidImportPromise = import("mermaid").then((mod) => {
            mermaidModule = mod;
            return mod;
        });
    }
    return mermaidImportPromise;
};

const MermaidDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    svgContent: string;
}> = ({ open, onClose, svgContent }) => {
    const [scale, setScale] = useState<number>(1);
    const [fitScale, setFitScale] = useState<number>(1);
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const t = useTranslations("web.mermaid");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setIsDragging(false);
            setPosition({ x: 0, y: 0 });
            // Wait for DOM to render, then calculate fit scale
            const timer = setTimeout(() => {
                if (containerRef.current) {
                    const dims = getSvgDimensions(svgContent);
                    if (dims) {
                        const containerW = containerRef.current.clientWidth - 64;
                        const containerH = containerRef.current.clientHeight - 64;
                        const fs = Math.min(
                            containerW / dims.width,
                            containerH / dims.height,
                            1
                        );
                        setFitScale(fs);
                        setScale(fs);
                    } else {
                        setFitScale(1);
                        setScale(1);
                    }
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open, svgContent]);

    const handleZoomIn = () =>
        setScale((prev) => Math.min(3, +( prev + 0.25).toFixed(2)));
    const handleZoomOut = () =>
        setScale((prev) => Math.max(0.25, +(prev - 0.25).toFixed(2)));
    const handleFitToWindow = () => {
        setScale(fitScale);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "center",
                },
            }}
            slotProps={{
                paper: { className: "h-[88vh]" },
            }}
        >
            <DialogContent className="flex flex-col overflow-hidden p-0">
                {/* Toolbar */}
                <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-3 py-1 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                        <Tooltip title={t("button.zoomOut")}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={handleZoomOut}
                                    disabled={scale <= 0.25}
                                >
                                    <ZoomOutIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Typography
                            variant="caption"
                            className="w-12 text-center tabular-nums"
                        >
                            {Math.round(scale * 100)}%
                        </Typography>
                        <Tooltip title={t("button.zoomIn")}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={handleZoomIn}
                                    disabled={scale >= 3}
                                >
                                    <ZoomInIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t("button.fitToWindow")}>
                            <IconButton size="small" onClick={handleFitToWindow}>
                                <FitScreenIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <Tooltip title={t("button.close")}>
                        <IconButton size="small" onClick={onClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>

                {/* Canvas */}
                <div
                    ref={containerRef}
                    className={`relative flex-1 w-full overflow-hidden bg-white ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                    onMouseDown={(e: React.MouseEvent) => {
                        setIsDragging(true);
                        setDragStart({
                            x: e.clientX - position.x,
                            y: e.clientY - position.y,
                        });
                    }}
                    onMouseMove={(e: React.MouseEvent) => {
                        if (!isDragging) return;
                        setPosition({
                            x: e.clientX - dragStart.x,
                            y: e.clientY - dragStart.y,
                        });
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onWheel={(e: React.WheelEvent) => {
                        const delta = e.deltaY > 0 ? -0.1 : 0.1;
                        setScale((prev) =>
                            Math.max(0.25, Math.min(3, +(prev + delta).toFixed(2)))
                        );
                    }}
                >
                    <div
                        className="absolute inset-0 m-0 flex items-center justify-center p-0"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: "center center",
                            transition: isDragging
                                ? "none"
                                : "transform 0.1s ease-out",
                        }}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                </div>

                {/* Hint bar */}
                <div className="flex shrink-0 items-center justify-center gap-6 border-t border-gray-100 bg-gray-50 px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
                    <Typography variant="caption" className="text-gray-400 dark:text-gray-500">
                        {t("hint.drag")}
                    </Typography>
                    <Typography variant="caption" className="text-gray-400 dark:text-gray-500">
                        {t("hint.scroll")}
                    </Typography>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const Mermaid: React.FC<MermaidProps> = ({ data, className = "" }) => {
    const [svgContent, setSvgContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const t = useTranslations("web.mermaid");
    const { resolvedTheme } = useTheme();

    const { props } = data;
    const code = props?.code?.trim();

    const renderMermaid = useCallback(
        async (mermaidCode: string): Promise<string> => {
            try {
                const mermaid = await getMermaid();

                // Use dark theme when in dark mode, unless a specific theme is set
                const mermaidTheme =
                    props?.theme ||
                    (resolvedTheme === "dark" ? "dark" : "default");

                mermaid.default.initialize({
                    startOnLoad: false,
                    theme: mermaidTheme,
                    securityLevel: "loose",
                    fontFamily: "inherit",
                    themeVariables: {
                        background: "#ffffff",
                        mainBkg: "#ffffff",
                        secondBkg: "#f4f4f4",
                        tertiaryBkg: "#f0f0f0",
                    },
                });

                const elementId = `mermaid-${data.id}-${Date.now()}`;

                const { svg } = await mermaid.default.render(
                    elementId,
                    mermaidCode
                );

                return svg;
            } catch (err) {
                console.error("Mermaid render error:", err);
                throw new Error(
                    `${t("error.renderFailed")}: ${err instanceof Error ? err.message : "Unkown error"}`
                );
            }
        },
        [data.id, props?.theme, resolvedTheme, t]
    );

    useEffect(() => {
        const renderChart = async () => {
            if (!code) {
                setError(t("error.noCode"));
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError("");

            try {
                const svg = await renderMermaid(code);
                setSvgContent(svg);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : t("error.renderFailed")
                );
            } finally {
                setIsLoading(false);
            }
        };

        renderChart();
    }, [code, props?.theme, data.id, renderMermaid, resolvedTheme, t]);

    const handleImageClick = () => {
        if (svgContent && !error) {
            setIsDialogOpen(true);
        }
    };

    if (error) {
        return (
            <figure className={`p-4 ${className}`}>
                <Alert severity="error" sx={{ borderRadius: 1 }}>
                    <Typography variant="body2">
                        {t("error.mermaidRenderWithDetail", { error })}
                    </Typography>
                </Alert>
            </figure>
        );
    }

    if (isLoading) {
        return (
            <figure
                className={`flex min-h-50 items-center justify-center p-4 ${className}`}
            >
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                    {t("loading.renderingMermaid")}
                </Typography>
            </figure>
        );
    }

    return (
        <>
            <figure
                className={`group relative mx-auto w-fit cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white opacity-100 transition-all duration-200 hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:shadow-gray-700 ${className}`}
                onClick={handleImageClick}
            >
                {/* Let Mermaid's inline max-width style dictate SVG width; only constrain height */}
                <div
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    className="flex items-center justify-center bg-white p-4 [&_svg]:block [&_svg]:h-auto [&_svg]:max-h-80"
                />
                {/* Hover zoom hint */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="rounded-full bg-black/40 p-2 text-white">
                        <ZoomInIcon fontSize="medium" />
                    </div>
                </div>
            </figure>

            <MermaidDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                svgContent={svgContent}
            />
        </>
    );
};

export default Mermaid;
