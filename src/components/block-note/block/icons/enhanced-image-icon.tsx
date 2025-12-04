import React from "react";

const EnhancedImageIcon: React.FC<{ size?: number; color?: string }> = ({
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
    <rect x="3" y="4" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M7 14l3-3 3 4 4-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="8.5" r="1" fill={color} />
  </svg>
);

export default EnhancedImageIcon;
