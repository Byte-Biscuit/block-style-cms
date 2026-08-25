"use client";

import {
    Close as CloseIcon,
    FitScreen as FitScreenIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
} from "@mui/icons-material";
import {
    Alert,
    Dialog,
    DialogContent,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { sanitizeSvg } from "@/lib/sanitize-svg";
import { mediaConstrainedFrameClass } from "@/lib/style-classes";

export interface SvgBlockProps {
    code?: string;
}

export interface SvgBlockData {
    id: string;
    type: "svg";
    props: SvgBlockProps;
}

interface SvgFigureProps {
    data: SvgBlockData;
    className?: string;
    controls?: React.ReactNode;
}

function getSvgDimensions(
    svgContent: string
): { width: number; height: number } | null {
    const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
    if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/[\s,]+/);
        if (parts.length === 4) {
            const w = parseFloat(parts[2]);
            const h = parseFloat(parts[3]);
            if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0)
                return { width: w, height: h };
        }
    }
    const wMatch = svgContent.match(/\swidth=["']([0-9.]+)["']/);
    const hMatch = svgContent.match(/\sheight=["']([0-9.]+)["']/);
    if (wMatch && hMatch) {
        const w = parseFloat(wMatch[1]);
        const h = parseFloat(hMatch[1]);
        if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0)
            return { width: w, height: h };
    }
    return null;
}

const SvgZoomDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    svgContent: string;
}> = ({ open, onClose, svgContent }) => {
    const [scale, setScale] = useState(1);
    const [fitScale, setFitScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const t = useTranslations("web.svg");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        setIsDragging(false);
        setPosition({ x: 0, y: 0 });
        const timer = setTimeout(() => {
            if (!containerRef.current) return;
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
        }, 50);
        return () => clearTimeout(timer);
    }, [open, svgContent]);

    const handleZoomIn = () =>
        setScale((prev) => Math.min(3, +(prev + 0.25).toFixed(2)));
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
                <div className="flex shrink-0 items-center justify-between border-gray-200 border-b px-3 py-1 dark:border-gray-700">
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
                            <IconButton
                                size="small"
                                onClick={handleFitToWindow}
                            >
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

                <div
                    ref={containerRef}
                    role="application"
                    aria-label={`${t("hint.drag")}. ${t("hint.scroll")}`}
                    className={`relative w-full flex-1 overflow-hidden bg-white ${
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
                            Math.max(
                                0.25,
                                Math.min(3, +(prev + delta).toFixed(2))
                            )
                        );
                    }}
                    onKeyDown={(e: React.KeyboardEvent) => {
                        const step = 20;
                        switch (e.key) {
                            case "ArrowLeft":
                                e.preventDefault();
                                setPosition((p) => ({ ...p, x: p.x + step }));
                                break;
                            case "ArrowRight":
                                e.preventDefault();
                                setPosition((p) => ({ ...p, x: p.x - step }));
                                break;
                            case "ArrowUp":
                                e.preventDefault();
                                setPosition((p) => ({ ...p, y: p.y + step }));
                                break;
                            case "ArrowDown":
                                e.preventDefault();
                                setPosition((p) => ({ ...p, y: p.y - step }));
                                break;
                            case "+":
                            case "=":
                                e.preventDefault();
                                handleZoomIn();
                                break;
                            case "-":
                                e.preventDefault();
                                handleZoomOut();
                                break;
                            case "0":
                                e.preventDefault();
                                handleFitToWindow();
                                break;
                        }
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
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized SVG markup for illustration preview
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                </div>

                <div className="flex shrink-0 items-center justify-center gap-6 border-gray-100 border-t bg-gray-50 px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
                    <Typography
                        variant="caption"
                        className="text-gray-400 dark:text-gray-500"
                    >
                        {t("hint.drag")}
                    </Typography>
                    <Typography
                        variant="caption"
                        className="text-gray-400 dark:text-gray-500"
                    >
                        {t("hint.scroll")}
                    </Typography>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const SvgFigure: React.FC<SvgFigureProps> = ({
    data,
    className = "",
    controls = null,
}) => {
    const t = useTranslations("web.svg");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sanitized, setSanitized] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const code = data.props?.code?.trim() ?? "";

    useEffect(() => {
        setSanitized(code ? sanitizeSvg(code) : null);
        setReady(true);
    }, [code]);

    if (!code) {
        return (
            <figure className={`p-4 ${className}`}>
                <Alert severity="error" sx={{ borderRadius: 1 }}>
                    <Typography variant="body2">{t("error.noCode")}</Typography>
                </Alert>
            </figure>
        );
    }

    if (!ready) {
        return <figure className={`min-h-20 ${className}`} />;
    }

    if (!sanitized) {
        return (
            <figure className={`p-4 ${className}`}>
                <Alert severity="error" sx={{ borderRadius: 1 }}>
                    <Typography variant="body2">
                        {t("error.invalidSvg")}
                    </Typography>
                </Alert>
            </figure>
        );
    }

    return (
        <>
            <div className={mediaConstrainedFrameClass}>
                {controls && (
                    <div className="absolute top-1 right-1 z-50">
                        {controls}
                    </div>
                )}
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: pointer zoom; SvgZoomDialog provides keyboard zoom controls */}
                <figure
                    className={`group relative h-full w-full cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white opacity-100 transition-all duration-200 hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:shadow-gray-700 ${className}`}
                    onClick={() => setIsDialogOpen(true)}
                >
                    <div
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized SVG markup for illustration preview
                        dangerouslySetInnerHTML={{ __html: sanitized }}
                        className="flex h-full w-full items-center justify-center bg-white p-4 [&_svg]:block [&_svg]:h-auto [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:max-w-full"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="rounded-full bg-black/40 p-2 text-white">
                            <ZoomInIcon fontSize="medium" />
                        </div>
                    </div>
                </figure>
            </div>

            <SvgZoomDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                svgContent={sanitized}
            />
        </>
    );
};

export default SvgFigure;
