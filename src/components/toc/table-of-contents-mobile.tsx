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

    return (
        <>
            {/* Float button */}
            <button
                onClick={() => setIsOpen(true)}
                aria-label={t("toc.show")}
                className="fixed right-2 bottom-[35vh] z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/80 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 2xl:hidden dark:bg-blue-500"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity 2xl:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
            {/* Side drawer */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] transform bg-white shadow-2xl transition-all duration-300 ease-out 2xl:hidden dark:bg-gray-900 ${
                    isOpen
                        ? "translate-x-0 opacity-100"
                        : "pointer-events-none translate-x-full opacity-0"
                } `}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
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
                    />
                </div>
            </div>
        </>
    );
}
