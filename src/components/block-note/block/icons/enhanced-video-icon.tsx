import React from "react";

const EnhancedVideoIcon: React.FC<{ size?: number; color?: string }> = ({
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
    <rect x="2.5" y="5" width="15" height="12" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M20 8v8l-3-4 3-4z" fill={color} />
  </svg>
);

export default EnhancedVideoIcon;
