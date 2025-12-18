import { motion } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useHitobaScroll } from "@/hooks/useHitobaScroll";

interface StickySectionProps {
  children: ReactNode;
  backgroundImage?: string;
  backgroundPosition?: string;
  overlayClassName?: string;
  className?: string;
  /** Additional scale when this section scrolls out */
  exitScale?: number;
  /** Whether this section stacks on top of others */
  isSticky?: boolean;
  /** Z-index for stacking order */
  zIndex?: number;
}

const StickySection = ({
  children,
  backgroundImage,
  backgroundPosition = "center",
  overlayClassName = "bg-gradient-to-b from-black/60 via-black/50 to-black/70",
  className = "",
  exitScale = 0.92,
  isSticky = true,
  zIndex = 1,
}: StickySectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scale, borderRadius, imageY, overlayOpacity, isMobile } = useHitobaScroll(
    containerRef as React.RefObject<HTMLElement>,
    {
      scaleRange: [1, exitScale],
      simplifiedOnMobile: true,
    }
  );

  return (
    <div 
      ref={containerRef}
      className={`relative h-screen min-h-[600px] max-h-screen ${className}`}
      style={{ zIndex }}
    >
      {/* Sticky wrapper */}
      <div 
        className={`${isSticky ? 'sticky top-0' : 'relative'} h-screen min-h-[600px] max-h-screen overflow-hidden`}
      >
        {/* Background with scale effect */}
        <motion.div 
          className="absolute inset-0 overflow-hidden"
          style={{ 
            scale,
            borderRadius,
          }}
        >
          {backgroundImage ? (
            <>
              <motion.img 
                src={backgroundImage} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover"
                style={{ 
                  objectPosition: backgroundPosition,
                  y: imageY,
                  scale: 1.05, // Slight overscale to prevent edge gaps
                }}
              />
              <motion.div 
                className={`absolute inset-0 ${overlayClassName}`}
                style={{ opacity: overlayOpacity }}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-background" />
          )}
        </motion.div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StickySection;