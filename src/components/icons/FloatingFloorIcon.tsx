import React from 'react';
import floatingFloorImg from '@/assets/icon-floating-floor.webp';

interface FloatingFloorIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const FloatingFloorIcon: React.FC<FloatingFloorIconProps> = ({ 
  className = "", 
  size = 24,
}) => {
  return (
    <img
      src={floatingFloorImg}
      alt="Posa flottante"
      width={size}
      height={size}
      className={`${className} invert`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};

export default FloatingFloorIcon;
