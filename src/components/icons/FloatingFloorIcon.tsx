import React from 'react';
import floatingFloorImg from '@/assets/icon-floating-floor.webp';

interface FloatingFloorIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const FloatingFloorIcon: React.FC<FloatingFloorIconProps> = ({ 
  className = "", 
}) => {
  return (
    <img
      src={floatingFloorImg}
      alt="Posa flottante"
      className={`w-10 h-10 brightness-0 invert ${className}`}
      style={{ objectFit: 'contain', background: 'transparent' }}
    />
  );
};

export default FloatingFloorIcon;
