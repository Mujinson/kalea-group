import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HitobaSectionProps {
  children: ReactNode;
  backgroundImage?: string;
  backgroundPosition?: string;
  overlayClassName?: string;
  className?: string;
  /** Z-index for stacking order - higher = on top */
  zIndex?: number;
  /** Minimum height of section */
  minHeight?: string;
  /** Background color if no image */
  bgColor?: string;
}

const HitobaSection = ({
  children,
  backgroundImage,
  backgroundPosition = "center",
  overlayClassName = "bg-gradient-to-b from-black/60 via-black/50 to-black/70",
  className = "",
  zIndex = 1,
  minHeight = "min-h-screen",
  bgColor = "bg-card",
}: HitobaSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Scale: starts small, grows to full, then shrinks as it exits
  const scale = useTransform(
    scrollYProgress, 
    [0, 0.25, 0.75, 1], 
    isMobile ? [0.96, 1, 1, 0.96] : [0.92, 1, 1, 0.88]
  );
  
  // Border radius: starts rounded, becomes flat, then rounds again on exit
  const borderRadius = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    isMobile ? ["16px", "0px", "0px", "20px"] : ["24px", "0px", "0px", "28px"]
  );
  
  // Opacity: fade in as it enters, fade out as it exits
  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.15, 0.85, 1], 
    [0.6, 1, 1, 0.6]
  );

  // Parallax for background image
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ["0%", "10%"] : ["0%", "20%"]
  );

  return (
    <div 
      ref={containerRef}
      className={`relative ${minHeight} ${className}`}
      style={{ zIndex }}
    >
      {/* Sticky wrapper that stays fixed while scrolling through */}
      <div className={`sticky top-0 ${minHeight} overflow-hidden`}>
        {/* Background with scale and border-radius animation */}
        <motion.div 
          className="absolute inset-0 overflow-hidden will-change-transform"
          style={{ 
            scale,
            borderRadius,
            opacity,
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
                  scale: 1.1,
                }}
              />
              <div className={`absolute inset-0 ${overlayClassName}`} />
            </>
          ) : (
            <div className={`absolute inset-0 ${bgColor}`} />
          )}
        </motion.div>

        {/* Content */}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HitobaSection;
