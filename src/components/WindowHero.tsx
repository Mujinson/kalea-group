import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import heroImage from "@/assets/hero-kalea.webp";

const WindowHero = () => {
  const { t, language } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Window frame animations - starts at center, expands smoothly to fill viewport
  const windowScale = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 1.8, 6]);
  const windowOpacity = useTransform(scrollYProgress, [0.45, 0.65], [1, 0]);
  
  // Dark overlay behind window - fades out as we enter
  const darkOverlayOpacity = useTransform(scrollYProgress, [0.4, 0.7], [1, 0]);
  
  // Background reveal - the interior scene
  const bgOpacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const bgScale = useTransform(scrollYProgress, [0.3, 0.7], [1.15, 1]);
  
  // Text animations - fade out before window expands
  const textOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -60]);
  
  // Scroll indicator - fades out quickly
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  
  // Glow animation
  const glowOpacity = useTransform(scrollYProgress, [0, 0.25], [0.7, 0]);
  const glowScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.5]);

  // CTA buttons appear after transition complete
  const ctaOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);

  return (
    <section 
      ref={containerRef}
      className="relative h-[300vh]"
    >
      {/* Fixed container for the effect - using brand dark brown #4A2A13 */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-kalea-dark">
        
        {/* Background image that reveals through the window */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ 
            opacity: bgOpacity,
            scale: bgScale,
          }}
        >
          <img 
            src={heroImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </motion.div>

        {/* CTA Buttons - appear after window transition */}
        <motion.div 
          className="absolute inset-0 z-20 flex items-end justify-center pb-16 md:pb-24"
          style={{ opacity: ctaOpacity }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to={`/${language}/diventa-partner`}
              className="group inline-flex items-center justify-center gap-2 bg-white text-[#111] text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
            >
              {t('hero.home.ctaInfo')}
            </Link>
            <Link 
              to={`/${language}/stonecore-10`}
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-white/10 transition-all duration-150 backdrop-blur-sm"
            >
              {t('hero.home.ctaProducts')}
            </Link>
          </div>
        </motion.div>

        {/* Dark overlay background - brand dark brown */}
        <motion.div 
          className="absolute inset-0 z-10 bg-kalea-dark"
          style={{ opacity: darkOverlayOpacity }}
        />

        {/* Window frame container */}
        <motion.div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ 
            scale: windowScale,
            opacity: windowOpacity,
          }}
        >
          {/* Arched window frame */}
          <div className="relative w-[240px] md:w-[320px] lg:w-[400px] aspect-[3/4]">
            {/* Outer ambient glow */}
            <motion.div 
              className="absolute -inset-8 rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[200px] rounded-b-[24px]"
              style={{
                opacity: glowOpacity,
                scale: glowScale,
                background: "radial-gradient(ellipse at center, rgba(200, 140, 60, 0.25) 0%, rgba(160, 100, 40, 0.1) 40%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            
            {/* Window outer border - warm amber/gold */}
            <div 
              className="absolute inset-0 rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[200px] rounded-b-[16px]"
              style={{
                background: "linear-gradient(180deg, rgba(200, 150, 80, 0.5) 0%, rgba(170, 120, 50, 0.4) 30%, rgba(140, 90, 40, 0.35) 70%, rgba(120, 80, 40, 0.3) 100%)",
                boxShadow: "inset 0 0 30px rgba(180, 130, 60, 0.15), 0 0 80px rgba(180, 130, 60, 0.2), 0 0 120px rgba(180, 130, 60, 0.1)",
              }}
            />
            
            {/* Window inner frame - darker */}
            <div 
              className="absolute inset-[5px] md:inset-[7px] rounded-t-[115px] md:rounded-t-[153px] lg:rounded-t-[193px] rounded-b-[13px]"
              style={{
                background: "linear-gradient(180deg, rgba(35, 30, 25, 0.97) 0%, rgba(25, 22, 18, 0.98) 100%)",
                boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.6)",
              }}
            />
            
            {/* Window glass area - brand dark brown interior #4A2A13 */}
            <div 
              className="absolute inset-[10px] md:inset-[14px] rounded-t-[110px] md:rounded-t-[146px] lg:rounded-t-[186px] rounded-b-[10px] overflow-hidden"
              style={{
                background: "linear-gradient(180deg, hsl(25 59% 18% / 0.95) 0%, hsl(25 59% 14% / 0.98) 100%)",
              }}
            >
              {/* Subtle ambient light from window */}
              <div 
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at 50% 30%, rgba(198, 177, 149, 0.12) 0%, transparent 60%)",
                }}
              />
              
              {/* Glass reflection effect */}
              <div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)",
                }}
              />
            </div>
            
            {/* Inner frame highlight */}
            <div 
              className="absolute inset-[9px] md:inset-[13px] rounded-t-[111px] md:rounded-t-[147px] lg:rounded-t-[187px] rounded-b-[11px] pointer-events-none"
              style={{
                boxShadow: "inset 0 1px 0 rgba(220, 170, 90, 0.15), inset 0 -1px 0 rgba(160, 110, 50, 0.1)",
              }}
            />
          </div>
        </motion.div>

        {/* Text content - centered in window area */}
        <motion.div 
          className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
          style={{ 
            opacity: textOpacity,
            y: textY,
          }}
        >
          <div className="text-center px-4">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-white/60 text-xs md:text-xs tracking-[0.5em] mb-5 uppercase font-medium"
            >
              KALĒA
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white text-3xl md:text-4xl lg:text-5xl font-light mb-3 tracking-wide"
              style={{ fontFamily: "'NewOrder', serif" }}
            >
              Surface System
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="text-white/55 text-sm md:text-base tracking-[0.25em] italic"
            >
              worldwide
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        {/* Mobile: "scroll down" inside the window + helper text right below */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[72px] z-30 flex flex-col items-center md:hidden"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <motion.span
            className="text-white/60 text-[10px] tracking-[0.35em] uppercase font-medium"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {t('hero.home.scrollDown')}
          </motion.span>
        </motion.div>

        <motion.p
          className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[205px] z-30 text-white/50 text-[10px] tracking-[0.15em] uppercase font-medium md:hidden"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          {t('hero.home.toStartJourney')}
        </motion.p>

        {/* Desktop/tablet: keep indicator at bottom */}
        <motion.div 
          className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-2"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <motion.span 
            className="text-white/60 text-[9px] tracking-[0.35em] uppercase font-medium"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {t('hero.home.scrollDown')}
          </motion.span>
          
          <p className="text-white/50 text-[9px] tracking-[0.15em] uppercase mt-6 font-medium">
            {t('hero.home.toStartJourney')}
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default WindowHero;
