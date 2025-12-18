import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScrollStackSectionProps {
  children: ReactNode;
  backgroundImage?: string;
  backgroundPosition?: string;
  overlayClassName?: string;
  className?: string;
  /** Stack order - higher = on top */
  stackIndex?: number;
  /** Background color when no image */
  backgroundColor?: string;
  /** Whether to use solid background color */
  solidBackground?: boolean;
  /** Custom min-height */
  minHeight?: string;
}

const ScrollStackSection = ({
  children,
  backgroundImage,
  backgroundPosition = "center",
  overlayClassName = "bg-gradient-to-b from-black/60 via-black/50 to-black/70",
  className = "",
  stackIndex = 0,
  backgroundColor = "bg-background",
  solidBackground = false,
  minHeight = "min-h-[600px]",
}: ScrollStackSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Scale down as scrolling past, rounded corners appear
  const scaleRange = isMobile ? [0.98, 1, 0.98] : [0.95, 1, 0.92];
  const borderRadiusRange = isMobile ? ["12px", "0px", "16px"] : ["20px", "0px", "24px"];
  
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], scaleRange);
  const borderRadius = useTransform(scrollYProgress, [0, 0.3, 0.8], borderRadiusRange);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8]);

  return (
    <div 
      ref={containerRef}
      className={`relative h-screen ${minHeight} max-h-screen sticky top-0 ${className}`}
      style={{ zIndex: stackIndex }}
    >
      {/* Animated container with scale and border radius */}
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        style={{ 
          scale,
          borderRadius,
          opacity,
        }}
      >
        {backgroundImage && !solidBackground ? (
          <>
            <img 
              src={backgroundImage} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: backgroundPosition }}
            />
            <div className={`absolute inset-0 ${overlayClassName}`} />
          </>
        ) : (
          <div className={`absolute inset-0 ${backgroundColor}`} />
        )}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ScrollStackSection;