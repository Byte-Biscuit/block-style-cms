import React from "react";

const MermaidIcon: React.FC<{ size?: number; color?: string }> = ({
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
    <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.2" />
    <path d="M6 9h12M6 13h5M13 17h5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default MermaidIcon;
