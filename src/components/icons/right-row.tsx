import React from "react";
import clsx from "clsx";

export interface RightArrowIconProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    strokeWidth?: number;
    animated?: boolean;
}

const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
};

export default function RightArrowIcon({
    className = "ml-2 ",
    size = "md",
    strokeWidth = 2,
    animated = true,
}: RightArrowIconProps) {
    return (
        <svg
            className={clsx(
                sizeClasses[size],
                animated &&
                    "transition-transform duration-200 group-hover:translate-x-1",
                className
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                d="M9 5l7 7-7 7"
            />
        </svg>
    );
}
