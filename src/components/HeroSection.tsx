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

  // Split title into 2 lines for staggered animation
  const titleLines = (() => {
    const words = title.split(' ');
    // Line 1: "Superfici di nuova generazione"
    // Line 2: "in MgO"
    return [
      words.slice(0, -2).join(' '), // First line: all except last 2 words
      words.slice(-2).join(' ')      // Second line: last 2 words
    ];
  })();

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
                <Button asChild size="lg">
                  <Link to={ctaPrimary.link}>
                    {ctaPrimary.text}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
              {ctaSecondary && (
                <Button asChild size="lg">
                  <Link to={ctaSecondary.link}>
                    {ctaSecondary.text}
                  </Link>
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
