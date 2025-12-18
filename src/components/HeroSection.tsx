import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);


  return (
    <section 
      ref={ref} 
      className={`relative ${minHeight} flex items-center justify-center overflow-hidden`}
    >
      {/* Background with blur+zoom animation */}
      {backgroundImage && (
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <motion.img 
            src={backgroundImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: backgroundPosition }}
            initial={{ filter: "blur(6px)", scale: 1.05 }}
            animate={{ filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <div className={`absolute inset-0 ${overlayClassName}`} />
        </motion.div>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
      )}

      {/* Content */}
      <motion.div style={{ opacity }} className="container-custom relative z-10">
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
      </motion.div>
    </section>
  );
};

export default HeroSection;
