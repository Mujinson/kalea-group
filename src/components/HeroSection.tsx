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
  minHeight = "min-h-[80vh]",
}: HeroSectionProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  ...


  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  return (
    <section ref={ref} className={`relative ${minHeight} flex items-center justify-center overflow-hidden`}>
      {/* Background */}
      {backgroundImage && (
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </motion.div>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
      )}

      {/* Content */}
      <motion.div style={{ opacity }} className="container-custom relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-8 text-balance leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {(ctaPrimary || ctaSecondary) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {ctaPrimary && (
                <Button asChild size="lg" variant="default" className="group rounded-full px-8 text-white">
                  <Link to={ctaPrimary.link}>
                    {ctaPrimary.text}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
              {ctaSecondary && (
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-white border-white/30 hover:bg-white/10">
                  <Link to={ctaSecondary.link}>{ctaSecondary.text}</Link>
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
