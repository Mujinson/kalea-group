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
  minHeight?: string;
}

const HeroSection = ({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  backgroundImage,
  minHeight = "min-h-screen",
}: HeroSectionProps) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  // Split title into lines for staggered animation
  const titleLines = title.split(' ').reduce((acc, word, i, arr) => {
    if (i === 0) acc.push(word); // Line 1: "Superfici"
    else if (i <= 2) acc[1] = (acc[1] || '') + (acc[1] ? ' ' : '') + word; // Line 2: "di nuova generazione"
    else acc[2] = (acc[2] || '') + (acc[2] ? ' ' : '') + word; // Line 3: "in MgO"
    return acc;
  }, [] as string[]);

  return (
    <section 
      ref={ref} 
      className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden"
      style={{ minHeight: '100vh', height: '100vh' }}
    >
      {/* Background with blur+zoom animation */}
      {backgroundImage && (
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <motion.img 
            src={backgroundImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ filter: "blur(6px)", scale: 1.05 }}
            animate={{ filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </motion.div>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
      )}

      {/* Content */}
      <motion.div style={{ opacity }} className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title with staggered line animation */}
          <h1 className="text-hero-md lg:text-hero-lg xl:text-hero-xl font-heading text-white mb-8 text-balance">
            {titleLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
              >
                {line}
              </motion.div>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="text-subtitle text-white/85 mb-12 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>

          {(ctaPrimary || ctaSecondary) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {ctaPrimary && (
                <Link 
                  to={ctaPrimary.link}
                  className="group inline-flex items-center justify-center gap-2 bg-white text-black text-button rounded-full px-10 py-4 hover:bg-gray-50 hover:shadow-lg transition-all duration-150"
                >
                  {ctaPrimary.text}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              {ctaSecondary && (
                <Link 
                  to={ctaSecondary.link}
                  className="inline-flex items-center justify-center gap-2 bg-white text-black text-button rounded-full px-10 py-4 hover:bg-gray-50 hover:shadow-lg transition-all duration-150"
                >
                  {ctaSecondary.text}
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
