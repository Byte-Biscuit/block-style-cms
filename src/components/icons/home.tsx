import React from "react";
import clsx from "clsx";

export interface HomeIconProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    strokeWidth?: number;
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
};

export default function HomeIcon({
    className = "mr-2",
    size = "md",
    strokeWidth = 2,
}: HomeIconProps) {
    return (
        <svg
            className={clsx(sizeClasses[size], className)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
        </svg>
    );
}
