"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import type { TocItem } from "@/lib/toc-utils";
import { useTranslations } from "next-intl";

interface TableOfContentsProps {
    articleTitle: string;
    items: TocItem[];
    className?: string;
    showTitle?: boolean;
}

export default function TableOfContents({
    articleTitle,
    items,
    className = "",
    showTitle = true,
}: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");
    const t = useTranslations("web");
    const activeButtonRef = useRef<HTMLButtonElement>(null);

    // When the active entry changes, scroll it into the visible area of the TOC list.
    useEffect(() => {
        activeButtonRef.current?.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
        });
    }, [activeId]);

    const fullTocItems = useMemo(() => {
        const result: TocItem[] = [];
        result.push({
            id: "h1-article-title",
            text: articleTitle,
            level: 1,
        });
        result.push({
            id: "h2-article-summary",
            text: t("article.summary"),
            level: 2,
        });
        result.push(...items);
        return result;
    }, [items, articleTitle, t]);

    useEffect(() => {
        // Intersection Observer to detect which heading is in view
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-80px 0px -80% 0px", // Trigger when heading is near top
            }
        );

        // Observe all headings
        fullTocItems.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [fullTocItems]);

    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // Smooth scroll to the heading
            const top = element.offsetTop - 80; // Offset for fixed header
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    return (
        <nav className={`flex flex-col space-y-1 ${className}`}>
            {showTitle && (
                <h3 className="mb-3 shrink-0 text-sm font-semibold tracking-wide text-gray-900 uppercase dark:text-gray-100">
                    {t("toc.title")}
                </h3>
            )}
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto border-l-2 border-gray-200 dark:border-gray-700">
                {fullTocItems.map((item) => (
                    <li key={item.id}>
                        <button
                            ref={activeId === item.id ? activeButtonRef : null}
                            onClick={() => handleClick(item.id)}
                            title={item.text}
                            className={`block w-full truncate text-left transition-colors ${getLevelPadding(item.level)} ${
                                activeId === item.id
                                    ? "border-l-2 border-blue-500 bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "border-l-2 border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            } `}
                        >
                            {item.text}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

/**
 * Get padding based on heading level for visual hierarchy
 */
function getLevelPadding(level: number): string {
    const paddings: Record<number, string> = {
        1: "py-2 pl-2 pr-2 text-base font-semibold",
        2: "py-1.5 pl-4 pr-2 text-sm font-medium",
        3: "py-1 pl-6 pr-2 text-xs",
        4: "py-1 pl-8 pr-2 text-xs opacity-90",
        5: "py-0.5 pl-10 pr-2 text-xs opacity-80",
        6: "py-0.5 pl-12 pr-2 text-xs opacity-70",
    };
    return paddings[level] || paddings[1];
}
