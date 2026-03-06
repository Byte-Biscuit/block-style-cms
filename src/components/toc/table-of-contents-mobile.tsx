"use client";

import { useState, useRef, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import TableOfContents from "./table-of-contents";
import type { TocItem } from "@/lib/toc-utils";

interface TableOfContentsMobileProps {
    items: TocItem[];
    articleTitle: string;
}

export default function TableOfContentsMobile({
    items,
    articleTitle,
}: TableOfContentsMobileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const startX = useRef(0);
    const currentX = useRef(0);
    // vertical position (px) for the toggle; persisted to localStorage
    // Initial value fixed at 120 to match SSR and avoid hydration errors
    // Updated by useEffect from localStorage / window after client mount
    const [topPx, setTopPx] = useState<number>(120);
    const toggleRef = useRef<HTMLButtonElement | null>(null);
    const dragging = useRef(false);
    const dragStartY = useRef(0);
    const dragStartTop = useRef(0);
    const hasMoved = useRef(false); // Flag to indicate if a real drag movement occurred

    const t = useTranslations("web");

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Read localStorage / window after client mount to update initial button position
    // Placed in useEffect to ensure SSR and initial hydration use the same initial value (120)
    useEffect(() => {
        try {
            const raw = localStorage.getItem("tocToggleTop");
            if (raw) {
                const v = parseInt(raw, 10);
                if (!Number.isNaN(v) && v > 0) {
                    setTopPx(v);
                    return;
                }
            }
        } catch {
            // ignore (privacy mode)
        }
        const defaultTop = Math.round(window.innerHeight * 0.35);
        setTopPx(Math.max(60, Math.min(defaultTop, window.innerHeight - 150)));
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        currentX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = currentX.current - startX.current;
        if (diff > 100) {
            setIsOpen(false);
        }
    };

    // Document-level pointer handlers to support dragging the toggle vertically
    useEffect(() => {
        function onPointerMove(e: PointerEvent) {
            if (!dragging.current) return;
            const delta = e.clientY - dragStartY.current;
            // Only moves over 5px are considered real drags (to avoid misinterpreting clicks)
            if (Math.abs(delta) > 5) {
                hasMoved.current = true;
                e.preventDefault(); // Prevent scroll interference
            }
            const btnHeight =
                toggleRef.current?.getBoundingClientRect().height ?? 80;
            // Minimum distance from top: accounts for status/nav bars (typically 60-80px)
            const minTop = 60;
            // Maximum distance from top: ensures button doesn't exceed viewport, leaving a safety margin
            const maxTop = Math.max(
                minTop + 50,
                window.innerHeight - btnHeight - 20
            );
            let next = Math.round(dragStartTop.current + delta);
            // Constrain within reasonable bounds
            next = Math.max(minTop, Math.min(next, maxTop));
            setTopPx(next);
        }

        function onPointerUp() {
            if (!dragging.current) return;
            dragging.current = false;
            // Save position to localStorage
            try {
                localStorage.setItem("tocToggleTop", String(topPx));
            } catch {
                // ignore
            }
            // Reset hasMoved after a short delay (to avoid immediately triggering onClick)
            setTimeout(() => {
                hasMoved.current = false;
            }, 100);
        }

        document.addEventListener("pointermove", onPointerMove, {
            passive: false,
        });
        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("pointercancel", onPointerUp);
        return () => {
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
            document.removeEventListener("pointercancel", onPointerUp);
        };
    }, [topPx]);

    return (
        <>
            {/* Vertical right-edge toggle (mobile) */}
            <button
                ref={toggleRef}
                onClick={(e) => {
                    // If recently dragged, don't trigger click (prevents accidental drawer opening)
                    if (hasMoved.current) {
                        e.preventDefault();
                        return;
                    }
                    setIsOpen(true);
                }}
                aria-label={t("toc.show")}
                aria-expanded={isOpen}
                onPointerDown={(ev: React.PointerEvent<HTMLButtonElement>) => {
                    // only start drag on primary pointer
                    if (typeof ev.button === "number" && ev.button !== 0)
                        return;
                    dragging.current = true;
                    hasMoved.current = false; // Reset movement flag
                    dragStartY.current = ev.clientY;
                    dragStartTop.current = topPx;
                    try {
                        ev.currentTarget.setPointerCapture?.(ev.pointerId);
                    } catch {
                        // ignore
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsOpen((s) => !s);
                    }
                }}
                // visible on small/medium screens, hidden at 2xl and above
                // GitHub style: white bg + thin border + orange text + hover shadow
                className="dark:hover:bg-gray-750 fixed right-0 z-40 flex h-20 w-8 cursor-grab items-center justify-center rounded-l-lg border border-r-0 border-gray-200 bg-white text-orange-600 shadow-sm transition-all hover:w-11 hover:border-gray-300 hover:shadow-md focus:ring-1 focus:ring-orange-400/50 focus:ring-offset-1 focus:outline-none active:cursor-grabbing active:bg-gray-50 lg:hidden dark:border-gray-700 dark:bg-gray-800 dark:text-orange-400 dark:hover:border-gray-600 dark:active:bg-gray-700"
                // ensure taps don't get blocked by safe-area on iOS; position controlled via state
                style={{
                    paddingRight: "env(safe-area-inset-right)",
                    top: `${topPx}px`,
                    touchAction: "none", // Prevent default browser touch gestures from interfering with dragging
                }}
            >
                <span className="flex flex-col items-center gap-0.5 select-none">
                    {/* vertical icon to match the toggle orientation */}
                    <MenuIcon className="h-4 w-4 rotate-90 transform" />
                    {/* vertical label using writing-mode for better readability (Chinese recommended) */}
                    <span
                        className="text-[9px] tracking-wide whitespace-nowrap"
                        style={{
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                        }}
                        aria-hidden="true"
                    >
                        {t("toc.title")}
                    </span>
                </span>
            </button>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
            {/* Side drawer */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] transform bg-white shadow-2xl transition-all duration-300 ease-out lg:hidden dark:bg-gray-900 ${
                    isOpen
                        ? "translate-x-0 opacity-100"
                        : "pointer-events-none translate-x-full opacity-0"
                } `}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {t("toc.title")}
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label={t("toc.hide")}
                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Toc content */}
                <div className="h-[calc(100%-64px)] overflow-y-auto p-4">
                    <TableOfContents
                        items={items}
                        articleTitle={articleTitle}
                        showTitle={false}
                    />
                </div>
            </div>
        </>
    );
}
