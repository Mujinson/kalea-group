import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { useHitobaScroll } from "@/hooks/useHitobaScroll";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaPrimary?: { text: string; link: string };
  ctaSecondary?: { text: string; link: string };
  backgroundImage?: string;
  backgroundPosition?: string;
  overlayClassName?: string;
  minHeight?: string;
}

const HeroSection = ({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  backgroundImage,
  backgroundPosition = "center",
  overlayClassName = "bg-gradient-to-b from-black/70 via-black/60 to-black/80",
  minHeight = "min-h-screen",
}: HeroSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    scale, 
    borderRadius, 
    imageY, 
    contentOpacity, 
    contentY,
    overlayOpacity,
    isMobile 
  } = useHitobaScroll(containerRef as React.RefObject<HTMLElement>, {
    scaleRange: [1, 0.88],
    borderRadiusRange: [0, 28],
    parallaxRange: ["0%", "18%"],
    contentOpacityRange: [1, 0],
    contentYRange: [0, -100],
    simplifiedOnMobile: true,
  });

  return (
    <div ref={containerRef} className={`relative ${minHeight}`}>
      {/* Fixed background that scales and rounds on scroll */}
      <motion.div 
        className="fixed inset-0 z-0 overflow-hidden origin-center"
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
              className="absolute inset-0 w-full h-full object-cover will-change-transform"
              style={{ 
                objectPosition: backgroundPosition,
                y: imageY,
                scale: 1.1, // Slightly larger to avoid edge gaps during parallax
              }}
              initial={{ filter: "blur(12px)", scale: 1.2 }}
              animate={{ filter: "blur(0px)", scale: 1.1 }}
              transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <motion.div 
              className={`absolute inset-0 ${overlayClassName}`}
              style={{ opacity: overlayOpacity }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
        )}
      </motion.div>

      {/* Content overlay - positioned at bottom to avoid logo overlap */}
      <div className={`relative z-10 ${minHeight} flex flex-col items-center justify-end pb-24 md:pb-32`}>
        <motion.div 
          style={{ opacity: contentOpacity, y: contentY }} 
          className="container-custom will-change-transform"
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Title with letter-by-letter animation */}
            <h1 className="text-hero-md lg:text-hero-lg xl:text-hero-xl font-bold text-white mb-8 text-balance">
              {title.split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.05, 
                    delay: index * 0.03,
                    ease: "easeOut"
                  }}
                  className="inline-block"
                  style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: title.length * 0.03 + 0.2, ease: "easeOut" }}
              className="text-subtitle text-white/85 mb-12 max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>

            {(ctaPrimary || ctaSecondary) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {ctaPrimary && (
                  <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ 
                      opacity: 1, 
                      x: [null, 20, 0]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      delay: title.length * 0.03 + 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      x: {
                        duration: 0.8,
                        times: [0, 0.6, 1],
                        ease: "easeOut"
                      }
                    }}
                  >
                    <Link 
                      to={ctaPrimary.link}
                      className="group inline-flex items-center justify-center gap-2 bg-white/[0.12] backdrop-blur-[10px] border border-white/30 text-white font-medium tracking-wide text-button rounded-full px-10 py-3.5 hover:bg-white/[0.22] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200"
                    >
                      {ctaPrimary.text}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                )}
                {ctaSecondary && (
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ 
                      opacity: 1, 
                      x: [null, -20, 0]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      delay: title.length * 0.03 + 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      x: {
                        duration: 0.8,
                        times: [0, 0.6, 1],
                        ease: "easeOut"
                      }
                    }}
                  >
                    <Link 
                      to={ctaSecondary.link}
                      className="inline-flex items-center justify-center gap-2 bg-white/[0.12] backdrop-blur-[10px] border border-white/30 text-white font-medium tracking-wide text-button rounded-full px-10 py-3.5 hover:bg-white/[0.22] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200"
                    >
                      {ctaSecondary.text}
                    </Link>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: title.length * 0.03 + 1 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-6 h-6 text-white/60" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;