import React from 'react';

interface FloatingFloorIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const FloatingFloorIcon: React.FC<FloatingFloorIconProps> = ({ 
  className = "", 
  size = 24,
  strokeWidth = 1.5
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Bottom plank with tongue */}
      <path d="M2 18 L2 14 L8 14 L8 12 L10 12 L10 14 L22 14 L22 18 L2 18 Z" />
      
      {/* Top plank with groove - clicking down */}
      <path d="M4 11 L4 7 L18 7 L18 9 L12 9 L12 11 L10 11 L10 9 L4 9" />
      <path d="M18 7 L18 11 L12 11" />
      
      {/* Arrow indicating click-down motion */}
      <path d="M11 3 L11 5.5" />
      <path d="M9 4.5 L11 6 L13 4.5" />
    </svg>
  );
};

export default FloatingFloorIcon;
