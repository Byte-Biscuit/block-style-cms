import React from "react";

const EnhancedFileIcon: React.FC<{ size?: number; color?: string }> = ({
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
    <path d="M6 2h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13 2v6h6" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 14h8M8 10h8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default EnhancedFileIcon;
