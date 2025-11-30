import { useRef, useState } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
}

export const useCardTilt = (intensity: number = 10) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateY = (mouseX / (rect.width / 2)) * intensity;
    const rotateX = -(mouseY / (rect.height / 2)) * intensity;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return {
    cardRef,
    tilt,
    handleMouseMove,
    handleMouseLeave,
  };
};
