import { useRef, useState, useCallback } from 'react';

interface UseDragScrollOptions {
  enabled?: boolean;
}

export const useDragScroll = (options: UseDragScrollOptions = {}) => {
  const { enabled = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

  const stopAutoScroll = useCallback(() => {
    setIsInteracting(true);
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }
  }, []);

  const resumeAutoScroll = useCallback(() => {
    // Resume auto-scroll after 2 seconds of inactivity
    interactionTimeout.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2000);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled || !containerRef.current) return;
    stopAutoScroll();
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  }, [enabled, stopAutoScroll]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    resumeAutoScroll();
  }, [resumeAutoScroll]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      resumeAutoScroll();
    }
  }, [isDragging, resumeAutoScroll]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || !containerRef.current) return;
    stopAutoScroll();
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  }, [enabled, stopAutoScroll]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    resumeAutoScroll();
  }, [resumeAutoScroll]);

  return {
    containerRef,
    isDragging,
    isInteracting,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
