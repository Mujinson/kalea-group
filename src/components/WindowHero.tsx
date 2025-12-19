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

  // Phase 1: Key enters from below (0 - 0.1)
  const keyY = useTransform(scrollYProgress, [0, 0.1], [120, 0]);
  const keyOpacity = useTransform(scrollYProgress, [0, 0.03], [0, 1]);
  
  // Phase 2: Key rotates in lock (0.1 - 0.2)
  const keyRotation = useTransform(scrollYProgress, [0.1, 0.2], [0, 90]);
  
  // Phase 3: Lock + Key fall down and fade (0.2 - 0.3)
  const lockY = useTransform(scrollYProgress, [0.2, 0.35], [0, 300]);
  const lockOpacity = useTransform(scrollYProgress, [0.2, 0.32], [1, 0]);
  const lockRotation = useTransform(scrollYProgress, [0.2, 0.35], [0, 25]);
  
  // Phase 4: Doors opening (0.25 - 0.5)
  const leftDoorRotation = useTransform(scrollYProgress, [0.25, 0.5], [0, -115]);
  const rightDoorRotation = useTransform(scrollYProgress, [0.25, 0.5], [0, 115]);
  const doorsOpacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);
  
  // Phase 5: Window frame scales up and fades (0.45 - 0.75)
  const windowScale = useTransform(scrollYProgress, [0.45, 0.75], [1, 5]);
  const windowOpacity = useTransform(scrollYProgress, [0.6, 0.75], [1, 0]);
  
  // Dark overlay
  const darkOverlayOpacity = useTransform(scrollYProgress, [0.55, 0.8], [1, 0]);
  
  // Background reveal
  const bgOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const bgScale = useTransform(scrollYProgress, [0.45, 0.85], [1.2, 1]);
  
  // Text animations - fade before key enters
  const textOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.1], [0, -40]);
  
  // Scroll indicator
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);
  
  // Glow
  const glowOpacity = useTransform(scrollYProgress, [0, 0.35], [0.6, 0]);
  
  // CTA
  const ctaOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);

  return (
    <section 
      ref={containerRef}
      className="relative h-[400vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#080706]">
        
        {/* Background image */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ opacity: bgOpacity, scale: bgScale }}
        >
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </motion.div>

        {/* CTA Buttons */}
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

        {/* Dark overlay */}
        <motion.div 
          className="absolute inset-0 z-10 bg-[#080706]"
          style={{ opacity: darkOverlayOpacity }}
        />

        {/* Window with doors */}
        <motion.div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ scale: windowScale, opacity: windowOpacity }}
        >
          <div className="relative w-[280px] md:w-[380px] lg:w-[460px] aspect-[3/4]">
            
            {/* Outer glow */}
            <motion.div 
              className="absolute -inset-10 rounded-t-[140px] md:rounded-t-[190px] lg:rounded-t-[230px] rounded-b-[24px]"
              style={{
                opacity: glowOpacity,
                background: "radial-gradient(ellipse at center, rgba(200, 140, 60, 0.3) 0%, rgba(160, 100, 40, 0.15) 40%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />
            
            {/* Window frame - outer */}
            <div 
              className="absolute inset-0 rounded-t-[140px] md:rounded-t-[190px] lg:rounded-t-[230px] rounded-b-[18px]"
              style={{
                background: "linear-gradient(180deg, rgba(200, 150, 80, 0.6) 0%, rgba(170, 120, 50, 0.5) 30%, rgba(140, 90, 40, 0.4) 70%, rgba(120, 80, 40, 0.35) 100%)",
                boxShadow: "inset 0 0 40px rgba(180, 130, 60, 0.2), 0 0 100px rgba(180, 130, 60, 0.25)",
              }}
            />
            
            {/* Window frame - inner */}
            <div 
              className="absolute inset-[6px] md:inset-[8px] rounded-t-[134px] md:rounded-t-[182px] lg:rounded-t-[222px] rounded-b-[14px]"
              style={{
                background: "linear-gradient(180deg, rgba(45, 38, 30, 0.98) 0%, rgba(35, 28, 22, 0.99) 100%)",
                boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.7)",
              }}
            />

            {/* Doors container */}
            <div 
              className="absolute inset-[12px] md:inset-[16px] rounded-t-[128px] md:rounded-t-[174px] lg:rounded-t-[214px] rounded-b-[10px] overflow-hidden"
              style={{ perspective: "1200px" }}
            >
              {/* Left door */}
              <motion.div 
                className="absolute left-0 top-0 w-1/2 h-full origin-left"
                style={{ 
                  rotateY: leftDoorRotation,
                  opacity: doorsOpacity,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Door panel */}
                <div 
                  className="absolute inset-0 rounded-tl-[128px] md:rounded-tl-[174px] lg:rounded-tl-[214px] rounded-bl-[10px]"
                  style={{
                    background: "linear-gradient(135deg, rgba(70, 55, 40, 0.95) 0%, rgba(50, 40, 30, 0.98) 50%, rgba(40, 32, 25, 0.99) 100%)",
                    boxShadow: "inset -2px 0 8px rgba(0,0,0,0.4), inset 0 2px 8px rgba(200, 150, 80, 0.1)",
                  }}
                />
                {/* Door decorative panel */}
                <div 
                  className="absolute top-[15%] bottom-[10%] left-[15%] right-[8%] rounded-tl-[60px] md:rounded-tl-[80px] border border-[rgba(180,140,70,0.25)]"
                  style={{
                    background: "linear-gradient(180deg, rgba(60, 48, 35, 0.9) 0%, rgba(45, 36, 28, 0.95) 100%)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)",
                  }}
                />
                {/* Door inner decorative line */}
                <div 
                  className="absolute top-[20%] bottom-[15%] left-[20%] right-[15%] rounded-tl-[45px] md:rounded-tl-[60px] border border-[rgba(200,160,90,0.15)]"
                />
              </motion.div>

              {/* Right door */}
              <motion.div 
                className="absolute right-0 top-0 w-1/2 h-full origin-right"
                style={{ 
                  rotateY: rightDoorRotation,
                  opacity: doorsOpacity,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Door panel */}
                <div 
                  className="absolute inset-0 rounded-tr-[128px] md:rounded-tr-[174px] lg:rounded-tr-[214px] rounded-br-[10px]"
                  style={{
                    background: "linear-gradient(225deg, rgba(70, 55, 40, 0.95) 0%, rgba(50, 40, 30, 0.98) 50%, rgba(40, 32, 25, 0.99) 100%)",
                    boxShadow: "inset 2px 0 8px rgba(0,0,0,0.4), inset 0 2px 8px rgba(200, 150, 80, 0.1)",
                  }}
                />
                {/* Door decorative panel */}
                <div 
                  className="absolute top-[15%] bottom-[10%] right-[15%] left-[8%] rounded-tr-[60px] md:rounded-tr-[80px] border border-[rgba(180,140,70,0.25)]"
                  style={{
                    background: "linear-gradient(180deg, rgba(60, 48, 35, 0.9) 0%, rgba(45, 36, 28, 0.95) 100%)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)",
                  }}
                />
                {/* Door inner decorative line */}
                <div 
                  className="absolute top-[20%] bottom-[15%] right-[20%] left-[15%] rounded-tr-[45px] md:rounded-tr-[60px] border border-[rgba(200,160,90,0.15)]"
                />
              </motion.div>

              {/* Center lock plate with key - falls down together */}
              <motion.div 
                className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ 
                  y: lockY,
                  opacity: lockOpacity,
                  rotate: lockRotation,
                }}
              >
                {/* Lock plate */}
                <div className="relative w-10 h-16 md:w-12 md:h-20">
                  {/* Lock plate background */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(180deg, rgba(180, 140, 70, 0.95) 0%, rgba(140, 100, 50, 0.98) 50%, rgba(100, 70, 35, 0.95) 100%)",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,220,150,0.3)",
                    }}
                  />
                  {/* Keyhole */}
                  <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
                    <div 
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full"
                      style={{ background: "radial-gradient(circle, rgba(20,15,10,1) 0%, rgba(40,30,20,1) 100%)" }}
                    />
                    <div 
                      className="w-1.5 h-4 md:w-2 md:h-5 mx-auto -mt-0.5"
                      style={{ 
                        background: "linear-gradient(180deg, rgba(20,15,10,1) 0%, rgba(30,25,18,1) 100%)",
                        borderRadius: "0 0 3px 3px",
                      }}
                    />
                  </div>
                </div>

                {/* Key - attached to lock, animates together */}
                <motion.div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2"
                  style={{ 
                    y: keyY,
                    opacity: keyOpacity,
                    rotate: keyRotation,
                    originY: 0.85,
                  }}
                >
                  <svg 
                    width="40" 
                    height="100" 
                    viewBox="0 0 40 100" 
                    className="md:w-12 md:h-[120px]"
                  >
                    {/* Key bow (top circular part) */}
                    <circle 
                      cx="20" 
                      cy="15" 
                      r="12" 
                      fill="none" 
                      stroke="url(#keyGradient)" 
                      strokeWidth="4"
                    />
                    <circle 
                      cx="20" 
                      cy="15" 
                      r="5" 
                      fill="none" 
                      stroke="url(#keyGradient)" 
                      strokeWidth="2"
                    />
                    
                    {/* Key shaft */}
                    <rect 
                      x="17" 
                      y="27" 
                      width="6" 
                      height="55" 
                      rx="2"
                      fill="url(#keyGradient)"
                    />
                    
                    {/* Key teeth */}
                    <path 
                      d="M17 65 L10 65 L10 72 L17 72 M17 75 L12 75 L12 82 L17 82"
                      fill="url(#keyGradient)"
                      stroke="url(#keyGradient)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    
                    {/* Key tip */}
                    <path 
                      d="M17 82 L17 92 L20 97 L23 92 L23 82"
                      fill="url(#keyGradient)"
                    />
                    
                    <defs>
                      <linearGradient id="keyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgb(220, 180, 100)" />
                        <stop offset="50%" stopColor="rgb(180, 140, 70)" />
                        <stop offset="100%" stopColor="rgb(140, 100, 50)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              </motion.div>
            </div>

            {/* Inner frame highlight */}
            <div 
              className="absolute inset-[10px] md:inset-[14px] rounded-t-[130px] md:rounded-t-[176px] lg:rounded-t-[216px] rounded-b-[12px] pointer-events-none"
              style={{
                boxShadow: "inset 0 1px 0 rgba(220, 170, 90, 0.2), inset 0 -1px 0 rgba(160, 110, 50, 0.15)",
              }}
            />
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div 
          className="absolute inset-0 z-15 flex flex-col items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity, y: textY }}
        >
          <div className="text-center px-4">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-white/40 text-[10px] md:text-xs tracking-[0.5em] mb-5 uppercase"
            >
              KALEA
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white text-2xl md:text-4xl lg:text-5xl font-light mb-3 tracking-wide"
              style={{ fontFamily: "'NewOrder', serif" }}
            >
              Surface System
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="text-white/35 text-xs md:text-base tracking-[0.25em] italic"
            >
              worldwide
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <motion.span 
            className="text-white/35 text-[9px] tracking-[0.35em] uppercase"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            SCROLL DOWN
          </motion.span>
          
          <p className="text-white/25 text-[9px] tracking-[0.15em] uppercase mt-6">
            To start the journey
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default WindowHero;
