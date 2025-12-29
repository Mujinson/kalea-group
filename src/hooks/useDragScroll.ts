import { useRef, useState, useCallback, useEffect } from 'react';

interface UseDragScrollOptions {
  autoScrollSpeed?: number; // pixels per frame
  direction?: 'left' | 'right';
}

export const useDragScroll = (options: UseDragScrollOptions = {}) => {
  const { autoScrollSpeed = 1, direction = 'left' } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll animation
  const animate = useCallback(() => {
    if (!containerRef.current || isPausedRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const container = containerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (direction === 'left') {
      container.scrollLeft += autoScrollSpeed;
      // Reset to beginning when reaching end
      if (container.scrollLeft >= maxScroll) {
        container.scrollLeft = 0;
      }
    } else {
      container.scrollLeft -= autoScrollSpeed;
      // Reset to end when reaching beginning
      if (container.scrollLeft <= 0) {
        container.scrollLeft = maxScroll;
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [autoScrollSpeed, direction]);

  // Start auto-scroll on mount
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [animate]);

  const pauseAutoScroll = useCallback(() => {
    isPausedRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  }, []);

  const resumeAutoScroll = useCallback(() => {
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 2000);
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    pauseAutoScroll();
    setIsDragging(true);
    startXRef.current = e.pageX;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  }, [pauseAutoScroll]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (startXRef.current - x) * 1.5;
    containerRef.current.scrollLeft = scrollLeftRef.current + walk;
  }, [isDragging]);

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

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    pauseAutoScroll();
    setIsDragging(true);
    startXRef.current = e.touches[0].pageX;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  }, [pauseAutoScroll]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX;
    const walk = (startXRef.current - x) * 1.5;
    containerRef.current.scrollLeft = scrollLeftRef.current + walk;
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    resumeAutoScroll();
  }, [resumeAutoScroll]);

  return {
    containerRef,
    isDragging,
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
