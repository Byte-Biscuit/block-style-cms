"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Typography,
    CircularProgress,
    Alert,
    Dialog,
    DialogContent,
    IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { roundedPx } from "@/lib/classes";

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
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const t = useTranslations("web.mermaid");

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
            setIsDragging(false);
            setIsPanning(false);
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "flex-start",
                    paddingTop: "8vh",
                    borderRadius: { roundedPx },
                },
            }}
            slotProps={{
                paper: { className: "h-[60vh]" },
            }}
        >
            <DialogContent className="overflow-hidden p-0">
                <IconButton
                    onClick={onClose}
                    size="small"
                    title={t("button.close")}
                    className={`absolute top-1 right-2 z-10 text-gray-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500`}
                >
                    <CloseIcon />
                </IconButton>
                <div
                    ref={containerRef}
                    className={`relative h-full min-h-[500px] w-full overflow-hidden bg-gray-50 ${isPanning ? "cursor-grab" : "cursor-default"} ${isDragging ? "cursor-grabbing" : ""} `}
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
                    onMouseUp={() => {
                        setIsDragging(false);
                    }}
                    onMouseLeave={() => {
                        setIsDragging(false);
                    }}
                    onWheel={(e: React.WheelEvent) => {
                        const delta = e.deltaY > 0 ? -0.1 : 0.1;
                        setScale((prev) =>
                            Math.max(0.25, Math.min(3, prev + delta))
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

    const { props } = data;
    const code = props?.code?.trim();

    const renderMermaid = useCallback(
        async (mermaidCode: string): Promise<string> => {
            try {
                const mermaid = await getMermaid();

                mermaid.default.initialize({
                    startOnLoad: false,
                    theme: props?.theme || "default",
                    securityLevel: "loose",
                    fontFamily: "inherit",
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
        [data.id, props?.theme, t]
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
    }, [code, props?.theme, data.id, renderMermaid, t]);

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
                className={`flex min-h-[200px] items-center justify-center p-4 ${className}`}
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
                className={`cursor-pointer overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 hover:border-blue-500 hover:shadow-lg dark:border-gray-700 ${className}`}
                onClick={handleImageClick}
            >
                <div
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    className="flex w-full items-center justify-center p-4 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
                />
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
