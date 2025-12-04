import React from "react";

const EnhancedAudioIcon: React.FC<{ size?: number; color?: string }> = ({
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
    <rect x="3" y="6" width="6" height="12" rx="1" stroke={color} strokeWidth="1.5" />
    <path d="M9 12h4l4-3v6l-4-3H9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default EnhancedAudioIcon;
