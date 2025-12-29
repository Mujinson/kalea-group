import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import heroImage from "@/assets/hero-kalea.webp";

// Import floor finish images
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";

// 6 panels - 3 on each side, shaped like floor planks (longer than wide)
// Responsive sizes: mobile closer to window, tablet as-is, desktop 3x bigger
const getPanelConfig = () => {
  // Desktop (lg+): 3x bigger panels, spread out to avoid overlapping
  const desktop = {
    width: 165,
    height: 360,
    panels: [
      // Left side - staggered positions using more horizontal space
      { id: 1, x: -520, y: -180, rotate: -12, floatDelay: 0, image: finishAurora },
      { id: 2, x: -340, y: 80, rotate: -8, floatDelay: 0.5, image: finishCorteccia },
      { id: 3, x: -500, y: 280, rotate: -15, floatDelay: 1.2, image: finishPerla },
      // Right side - staggered positions using more horizontal space
      { id: 4, x: 520, y: -180, rotate: 14, floatDelay: 0.3, image: finishSabbia },
      { id: 5, x: 340, y: 80, rotate: 10, floatDelay: 0.8, image: finishSilven },
      { id: 6, x: 500, y: 280, rotate: 18, floatDelay: 1.5, image: finishTerram },
    ]
  };
  
  // Tablet (md): keep current sizes
  const tablet = {
    width: 55,
    height: 120,
    panels: [
      { id: 1, x: -300, y: -150, rotate: -12, floatDelay: 0, image: finishAurora },
      { id: 2, x: -300, y: 10, rotate: -8, floatDelay: 0.5, image: finishCorteccia },
      { id: 3, x: -300, y: 170, rotate: -15, floatDelay: 1.2, image: finishPerla },
      { id: 4, x: 300, y: -150, rotate: 14, floatDelay: 0.3, image: finishSabbia },
      { id: 5, x: 300, y: 10, rotate: 10, floatDelay: 0.8, image: finishSilven },
      { id: 6, x: 300, y: 170, rotate: 18, floatDelay: 1.5, image: finishTerram },
    ]
  };
  
  // Mobile: smaller panels, slightly further from window
  const mobile = {
    width: 40,
    height: 90,
    panels: [
      { id: 1, x: -145, y: -110, rotate: -12, floatDelay: 0, image: finishAurora },
      { id: 2, x: -145, y: 10, rotate: -8, floatDelay: 0.5, image: finishCorteccia },
      { id: 3, x: -145, y: 130, rotate: -15, floatDelay: 1.2, image: finishPerla },
      { id: 4, x: 145, y: -110, rotate: 14, floatDelay: 0.3, image: finishSabbia },
      { id: 5, x: 145, y: 10, rotate: 10, floatDelay: 0.8, image: finishSilven },
      { id: 6, x: 145, y: 130, rotate: 18, floatDelay: 1.5, image: finishTerram },
    ]
  };
  
  return { desktop, tablet, mobile };
};

const panelConfigs = getPanelConfig();

const WindowHero = () => {
  const { t, language } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Dead zone - hero stays frozen for first 5% of scroll
  const DZ = 0.05;

  // Window frame animations - starts at center, expands smoothly to fill viewport
  const windowScale = useTransform(scrollYProgress, [0, DZ, DZ + 0.25, DZ + 0.55], [1, 1, 1.8, 6]);
  const windowOpacity = useTransform(scrollYProgress, [DZ + 0.40, DZ + 0.60], [1, 0]);
  
  // Dark overlay behind window - fades out as we enter
  const darkOverlayOpacity = useTransform(scrollYProgress, [DZ + 0.35, DZ + 0.65], [1, 0]);
  
  // Background reveal - the interior scene
  const bgOpacity = useTransform(scrollYProgress, [DZ + 0.30, DZ + 0.50], [0, 1]);
  const bgScale = useTransform(scrollYProgress, [DZ + 0.25, DZ + 0.65], [1.15, 1]);
  
  // Text animations - fade out before window expands (complete at 0.12)
  const textOpacity = useTransform(scrollYProgress, [0, DZ, DZ + 0.07], [1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, DZ, DZ + 0.10], [0, 0, -40]);
  // Hide completely when faded out
  const textVisibility = useTransform(scrollYProgress, (progress) => 
    progress > (DZ + 0.12) ? "hidden" : "visible"
  );
  
  // Scroll indicator - fades out quickly
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, DZ, DZ + 0.04], [1, 1, 0]);
  const scrollIndicatorVisibility = useTransform(scrollYProgress, (progress) => 
    progress > (DZ + 0.06) ? "hidden" : "visible"
  );
  
  // Glow animation
  const glowOpacity = useTransform(scrollYProgress, [0, DZ + 0.20], [0.7, 0]);
  const glowScale = useTransform(scrollYProgress, [0, DZ + 0.35], [1, 1.5]);

  // CTA buttons appear much earlier - at 15% scroll (after dead zone and initial text fadeout)
  const ctaOpacity = useTransform(scrollYProgress, [DZ + 0.10, DZ + 0.18], [0, 1]);
  const ctaVisibility = useTransform(scrollYProgress, (progress) => 
    progress < (DZ + 0.10) ? "hidden" : "visible"
  );

  // Floating panels - same scale as window, fade with window
  const panelScale = useTransform(scrollYProgress, [0, DZ, DZ + 0.25, DZ + 0.55], [1, 1, 1.8, 4]);
  const panelOpacity = useTransform(scrollYProgress, [DZ + 0.30, DZ + 0.50], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative h-[300vh]"
    >
      {/* Fixed container for the effect - using brand dark brown #4A2A13 */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        
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

        {/* CTA Buttons - appear after window transition, only when first text is completely hidden */}
        <motion.div 
          className="absolute inset-0 z-20 flex items-end justify-center pb-16 md:pb-24"
          style={{ 
            opacity: ctaOpacity,
            visibility: ctaVisibility,
            pointerEvents: useTransform(scrollYProgress, (progress) => progress < (0.05 + 0.10) ? "none" : "auto"),
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to={`/${language}/diventa-partner`}
              className="group inline-flex items-center justify-center gap-2 bg-white text-[#111] text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
            >
              {t('hero.home.ctaInfo')}
            </Link>
            <Link 
              to={`/${language}/biocore`}
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-white/10 transition-all duration-150 backdrop-blur-sm"
            >
              {t('hero.home.ctaProducts')}
            </Link>
          </div>
        </motion.div>

        {/* Dark overlay background - brand dark brown */}
        <motion.div 
          className="absolute inset-0 z-10 bg-background"
          style={{ opacity: darkOverlayOpacity }}
        />

        {/* Floating floor panels around the window - Mobile */}
        <motion.div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none md:hidden"
          style={{ 
            scale: panelScale,
            opacity: panelOpacity,
          }}
        >
          {panelConfigs.mobile.panels.map((panel) => (
            <motion.div
              key={panel.id}
              className="absolute cursor-pointer pointer-events-auto"
              style={{
                x: panel.x,
                y: panel.y,
                width: panelConfigs.mobile.width,
                height: panelConfigs.mobile.height,
              }}
              initial={{ opacity: 0, scale: 0.8, rotate: panel.rotate }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: [panel.rotate - 2, panel.rotate + 2, panel.rotate - 2],
                y: [panel.y - 5, panel.y + 5, panel.y - 5],
                x: [panel.x - 3, panel.x + 3, panel.x - 3],
              }}
              whileHover={{ 
                scale: 1.4,
                rotate: 0,
                zIndex: 50,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              transition={{ 
                opacity: { duration: 0.8, delay: 0.2 + panel.id * 0.08 },
                scale: { duration: 0.8, delay: 0.2 + panel.id * 0.08 },
                rotate: { duration: 6 + panel.floatDelay, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
                y: { duration: 4 + panel.floatDelay, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
                x: { duration: 5 + panel.floatDelay * 0.5, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
              }}
            >
              <motion.div 
                className="w-full h-full rounded-sm overflow-hidden"
                style={{
                  boxShadow: '0 15px 30px rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.4)',
                }}
                whileHover={{
                  boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 10px 20px rgba(0,0,0,0.5), 0 0 30px rgba(200,150,80,0.3)',
                }}
              >
                <img 
                  src={panel.image} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating floor panels around the window - Tablet */}
        <motion.div 
          className="absolute inset-0 z-10 items-center justify-center pointer-events-none hidden md:flex lg:hidden"
          style={{ 
            scale: panelScale,
            opacity: panelOpacity,
          }}
        >
          {panelConfigs.tablet.panels.map((panel) => (
            <motion.div
              key={panel.id}
              className="absolute cursor-pointer pointer-events-auto"
              style={{
                x: panel.x,
                y: panel.y,
                width: panelConfigs.tablet.width,
                height: panelConfigs.tablet.height,
              }}
              initial={{ opacity: 0, scale: 0.8, rotate: panel.rotate }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: [panel.rotate - 2, panel.rotate + 2, panel.rotate - 2],
                y: [panel.y - 8, panel.y + 8, panel.y - 8],
                x: [panel.x - 4, panel.x + 4, panel.x - 4],
              }}
              whileHover={{ 
                scale: 1.4,
                rotate: 0,
                zIndex: 50,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              transition={{ 
                opacity: { duration: 0.8, delay: 0.2 + panel.id * 0.08 },
                scale: { duration: 0.8, delay: 0.2 + panel.id * 0.08 },
                rotate: { duration: 6 + panel.floatDelay, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
                y: { duration: 4 + panel.floatDelay, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
                x: { duration: 5 + panel.floatDelay * 0.5, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
              }}
            >
              <motion.div 
                className="w-full h-full rounded-sm overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.4)',
                }}
                whileHover={{
                  boxShadow: '0 35px 70px rgba(0,0,0,0.6), 0 15px 30px rgba(0,0,0,0.5), 0 0 40px rgba(200,150,80,0.3)',
                }}
              >
                <img 
                  src={panel.image} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating floor panels around the window - Desktop */}
        <motion.div 
          className="absolute inset-0 z-10 items-center justify-center pointer-events-none hidden lg:flex"
          style={{ 
            scale: panelScale,
            opacity: panelOpacity,
          }}
        >
          {panelConfigs.desktop.panels.map((panel) => (
            <motion.div
              key={panel.id}
              className="absolute cursor-pointer pointer-events-auto"
              style={{
                x: panel.x,
                y: panel.y,
                width: panelConfigs.desktop.width,
                height: panelConfigs.desktop.height,
              }}
              initial={{ opacity: 0, scale: 0.8, rotate: panel.rotate }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: [panel.rotate - 2, panel.rotate + 2, panel.rotate - 2],
                y: [panel.y - 12, panel.y + 12, panel.y - 12],
                x: [panel.x - 6, panel.x + 6, panel.x - 6],
              }}
              whileHover={{ 
                scale: 1.4,
                rotate: 0,
                zIndex: 50,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              transition={{ 
                opacity: { duration: 0.8, delay: 0.2 + panel.id * 0.08 },
                scale: { duration: 0.8, delay: 0.2 + panel.id * 0.08 },
                rotate: { duration: 6 + panel.floatDelay, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
                y: { duration: 4 + panel.floatDelay, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
                x: { duration: 5 + panel.floatDelay * 0.5, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
              }}
            >
              <motion.div 
                className="w-full h-full rounded-sm overflow-hidden"
                style={{
                  boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.4)',
                }}
                whileHover={{
                  boxShadow: '0 60px 120px rgba(0,0,0,0.6), 0 30px 60px rgba(0,0,0,0.5), 0 0 60px rgba(200,150,80,0.3)',
                }}
              >
                <img 
                  src={panel.image} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

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
            
            {/* Window glass area with interior photo showing floor */}
            <div 
              className="absolute inset-[10px] md:inset-[14px] rounded-t-[110px] md:rounded-t-[146px] lg:rounded-t-[186px] rounded-b-[10px] overflow-hidden"
            >
              {/* Interior image showing flooring */}
              <img 
                src={heroImage} 
                alt="Interior with Kalēa flooring" 
                className="absolute inset-0 w-full h-full object-cover object-bottom"
              />
              
              {/* Subtle vignette overlay for depth */}
              <div 
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at 50% 100%, transparent 40%, rgba(0,0,0,0.2) 100%)",
                }}
              />
              
              {/* Glass reflection effect */}
              <div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)",
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

        {/* Text content - centered in window area, hidden when faded */}
        <motion.div 
          className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          style={{ 
            opacity: textOpacity,
            y: textY,
            visibility: textVisibility,
            pointerEvents: "none",
          }}
        >
          <div className="text-center px-4 mt-32 md:mt-40 lg:mt-48">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-wide"
              style={{ fontFamily: "'NewOrder', serif" }}
            >
              Surface System
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="text-white/70 text-sm md:text-base tracking-[0.25em] font-medium"
            >
              worldwide
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        {/* Mobile: positioned at bottom of screen, on background */}
        <motion.div
          className="absolute left-1/2 bottom-16 -translate-x-1/2 z-30 flex flex-col items-center gap-3 md:hidden"
          style={{ 
            opacity: scrollIndicatorOpacity,
            visibility: scrollIndicatorVisibility,
          }}
        >
          <motion.span
            className="text-[10px] tracking-[0.35em] uppercase font-medium"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', color: '#4A2A13', opacity: 0.7 }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {t('hero.home.scrollDown')}
          </motion.span>
          
          <p className="text-[10px] tracking-[0.15em] uppercase font-medium mt-4" style={{ color: '#4A2A13', opacity: 0.6 }}>
            {t('hero.home.toStartJourney')}
          </p>
        </motion.div>

        {/* Desktop/tablet: keep indicator at bottom */}
        <motion.div 
          className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-2"
          style={{ 
            opacity: scrollIndicatorOpacity,
            visibility: scrollIndicatorVisibility,
          }}
        >
          <motion.span 
            className="text-[9px] tracking-[0.35em] uppercase font-medium"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', color: '#4A2A13', opacity: 0.7 }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {t('hero.home.scrollDown')}
          </motion.span>
          
          <p className="text-[9px] tracking-[0.15em] uppercase mt-6 font-medium" style={{ color: '#4A2A13', opacity: 0.6 }}>
            {t('hero.home.toStartJourney')}
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default WindowHero;
