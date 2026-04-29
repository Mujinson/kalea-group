import { useEffect, useLayoutEffect, useRef, useState, CSSProperties } from 'react';

interface AutoFitTextProps {
  children: React.ReactNode;
  /** Max font size in px */
  max?: number;
  /** Min font size in px */
  min?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/**
 * Shrinks its text content until it fits the parent's width on a single line.
 * Recomputes on resize and on content change.
 */
export const AutoFitText = ({
  children,
  max = 28,
  min = 11,
  className = '',
  style,
  title,
}: AutoFitTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(max);

  const fit = () => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    let lo = min;
    let hi = max;
    let best = min;
    // Binary search for the largest size that fits
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      text.style.fontSize = `${mid}px`;
      const fits = text.scrollWidth <= container.clientWidth;
      if (fits) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
      if (hi - lo < 0.5) break;
    }
    setSize(best);
  };

  useLayoutEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className}`} style={style} title={title}>
      <span
        ref={textRef}
        style={{
          fontSize: `${size}px`,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          display: 'inline-block',
          fontWeight: 700,
        }}
      >
        {children}
      </span>
    </div>
  );
};
