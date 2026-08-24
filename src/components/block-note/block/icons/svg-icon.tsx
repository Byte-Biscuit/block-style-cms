import type React from "react";

const SvgIcon: React.FC<{ size?: number; color?: string }> = ({
    size = 18,
    color = "currentColor",
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
    >
        <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
            stroke={color}
            strokeWidth="1.2"
        />
        <path
            d="M7 14l2.5-3 2 2.5L14.5 10 17 14H7z"
            stroke={color}
            strokeWidth="1.3"
            strokeLinejoin="round"
        />
        <circle cx="9" cy="8.5" r="1.2" fill={color} />
    </svg>
);

export default SvgIcon;
