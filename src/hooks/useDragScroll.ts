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
  
  // Keep track of scroll position as a decimal to avoid browser rounding issues
  const currentScrollRef = useRef<number | null>(null);

  // Auto-scroll animation
  const animate = useCallback(() => {
    if (!containerRef.current || isPausedRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const container = containerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    // Initialize currentScrollRef if not set
    if (currentScrollRef.current === null) {
      currentScrollRef.current = container.scrollLeft;
    }
    
    if (direction === 'left') {
      currentScrollRef.current += autoScrollSpeed;
      // Reset to beginning when reaching end
      if (currentScrollRef.current >= maxScroll) {
        currentScrollRef.current = 0;
      }
    } else {
      currentScrollRef.current -= autoScrollSpeed;
      // Reset to end when reaching beginning
      if (currentScrollRef.current <= 0) {
        currentScrollRef.current = maxScroll;
      }
    }
    
    // Apply the scroll position (browser will round, but we keep the decimal in ref)
    container.scrollLeft = currentScrollRef.current;

    animationRef.current = requestAnimationFrame(animate);
  }, [autoScrollSpeed, direction]);

  // Initialize scroll position and start auto-scroll on mount
  useEffect(() => {
    // Set initial scroll position based on direction
    if (containerRef.current) {
      const container = containerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      if (direction === 'right') {
        // For right direction (scroll decreasing), start at the end
        currentScrollRef.current = maxScroll;
        container.scrollLeft = maxScroll;
      } else {
        // For left direction (scroll increasing), start at beginning
        currentScrollRef.current = 0;
        container.scrollLeft = 0;
      }
    }
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [animate, direction]);

  const pauseAutoScroll = useCallback(() => {
    isPausedRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  }, []);

  const resumeAutoScroll = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Resume immediately after a very short delay
    resumeTimeoutRef.current = setTimeout(() => {
      // Sync the ref with the actual DOM scroll position after drag
      if (containerRef.current) {
        currentScrollRef.current = containerRef.current.scrollLeft;
      }
      isPausedRef.current = false;
    }, 300);
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
