"use client";
import React from "react";

type Props = {
    variant?: "spinner" | "skeleton";
    lines?: number;
    className?: string;
};

export default function CodeLoading({
    variant = "skeleton",
    lines = 4,
    className = "",
}: Props) {
    if (variant === "spinner") {
        return (
            <div
                role="status"
                aria-live="polite"
                className={`flex items-center gap-3 ${className}`}
            >
                <span
                    className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-400"
                    aria-hidden="true"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    Loading...
                </span>
            </div>
        );
    }

    // skeleton for code block (looks like a code block with line gutters)
    return (
        <div
            role="status"
            aria-live="polite"
            className={`w-full overflow-hidden rounded-lg ${className}`}
        >
            <div
                className="rounded-lg bg-gray-50 p-4 shadow-sm dark:bg-gray-900"
                aria-hidden="true"
            >
                <div className="flex">
                    {/* gutter (line numbers column) */}
                    <div className="flex flex-col gap-2 pr-3">
                        {Array.from({ length: Math.min(lines, 12) }).map(
                            (_, i) => (
                                <div
                                    key={i}
                                    className="h-4 w-8 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-800"
                                />
                            )
                        )}
                    </div>

                    {/* code area */}
                    <div className="flex-1 space-y-2">
                        {Array.from({ length: lines }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-3 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-800 ${i === 0 ? "w-3/4" : i % 3 === 0 ? "w-2/3" : "w-full"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <span className="sr-only">Code is loading</span>
        </div>
    );
}
