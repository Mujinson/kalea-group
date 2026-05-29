import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";

// Import finish images
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";
import finishCenere from "@/assets/finish-cenere.jpg";

const planks = [
  { id: 1, name: "Aurora", slug: "aurora", image: finishAurora },
  { id: 2, name: "Corteccia", slug: "corteccia", image: finishCorteccia },
  { id: 3, name: "Perla", slug: "perla", image: finishPerla },
  { id: 4, name: "Sabbia", slug: "sabbia", image: finishSabbia },
  { id: 5, name: "Silven", slug: "silven", image: finishSilven },
  { id: 6, name: "Terram", slug: "terram", image: finishTerram },
  { id: 7, name: "Velora", slug: "velora", image: finishVelora },
  { id: 8, name: "Cenere", slug: "cenere", image: finishCenere },
];

const Carousel3D = () => {
  const { language, t } = useTranslation();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Refs for smooth dragging with inertia
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const dragStartedRef = useRef(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Inertia animation loop
  const animateInertia = useCallback(() => {
    if (Math.abs(velocityRef.current) > 0.1) {
      setRotation(prev => prev + velocityRef.current);
      velocityRef.current *= 0.95; // Friction - higher = more slide
      animationFrameRef.current = requestAnimationFrame(animateInertia);
    } else {
      velocityRef.current = 0;
      // Resume auto-rotation after inertia stops
      setTimeout(() => setAutoRotate(true), 2000);
    }
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || isDragging || Math.abs(velocityRef.current) > 0.1) return;
    
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.3);
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartedRef.current = false;
    lastXRef.current = clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const now = performance.now();
    const deltaX = clientX - lastXRef.current;
    const deltaTime = now - lastTimeRef.current;
    
    if (Math.abs(deltaX) > 2) {
      dragStartedRef.current = true;
    }
    
    if (deltaTime > 0) {
      // Calculate velocity with smoothing
      const instantVelocity = (deltaX * 0.4) / Math.max(deltaTime / 16, 1);
      velocityRef.current = velocityRef.current * 0.5 + instantVelocity * 0.5;
    }
    
    setRotation(prev => prev + deltaX * 0.4);
    lastXRef.current = clientX;
    lastTimeRef.current = now;
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    // Start inertia animation if there's velocity
    if (Math.abs(velocityRef.current) > 0.5) {
      animationFrameRef.current = requestAnimationFrame(animateInertia);
    } else {
      setTimeout(() => setAutoRotate(true), 2000);
    }
  }, [animateInertia]);
  
  // Responsive dimensions for perfect circle on all devices
  const dimensions = {
    mobile: { radius: 110, plankWidth: 45, plankHeight: 240 },
    tablet: { radius: 220, plankWidth: 85, plankHeight: 300 },
    desktop: { radius: 320, plankWidth: 110, plankHeight: 380 }
  };
  
  const { radius, plankWidth, plankHeight } = dimensions[screenSize];

  return (
    <div 
      className="relative w-full h-screen bg-background overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
    >
      {/* Ambient light effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(198, 177, 149, 0.08) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10 h-full flex flex-col items-center pt-8 md:pt-12 px-4 pointer-events-none">
        {/* Header - Fixed at top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center flex-shrink-0"
        >
          <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl text-foreground/95 tracking-wide mb-0">
            {t('carousel.title')}
          </h2>
          <p className="text-foreground/60 text-xs md:text-base font-light italic">
            {t('carousel.subtitle')}
          </p>
        </motion.div>

        {/* 3D Carousel Container - Centered with equal spacing */}
        <div 
          className={`relative flex items-center justify-center flex-1 w-full ${screenSize === 'mobile' ? '-mt-8' : '-mt-52 md:-mt-60'}`}
          style={{ 
            perspective: "1000px",
            maxWidth: screenSize === 'desktop' ? "1200px" : "900px",
            minHeight: screenSize === 'mobile' ? "280px" : screenSize === 'tablet' ? "400px" : "500px",
            maxHeight: screenSize === 'mobile' ? "350px" : screenSize === 'tablet' ? "500px" : "550px"
          }}
        >
          <motion.div
            className="relative"
            style={{ 
              transformStyle: "preserve-3d",
              width: "100%",
              height: "100%",
              transform: `rotateY(${rotation}deg)`
            }}
          >
            {planks.map((plank, index) => {
              const angle = (360 / planks.length) * index;
              return (
                <Link
                  key={plank.id}
                  to={`/${language}/biomag-floor`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    transformStyle: "preserve-3d"
                  }}
                  onClick={(e) => {
                    if (dragStartedRef.current) e.preventDefault();
                  }}
                >
                  {/* Plank container */}
                  <motion.div
                    whileHover={{ scale: 1.08, z: 50 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Main face */}
                    <div
                      className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(198,177,149,0.3)]"
                      style={{
                        width: `${plankWidth}px`,
                        height: `${plankHeight}px`,
                        backfaceVisibility: "hidden"
                      }}
                    >
                      <img
                        src={plank.image}
                        alt={plank.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity" />
                    </div>

                    {/* Side edge (3D effect) */}
                    <div
                      className="absolute top-0 bg-kalea-tan/30"
                      style={{
                        width: screenSize === 'mobile' ? "5px" : "10px",
                        height: `${plankHeight}px`,
                        transform: `rotateY(90deg) translateZ(${plankWidth / 2}px)`,
                        transformOrigin: "left center",
                        backfaceVisibility: "hidden"
                      }}
                    />

                    {/* Name label - positioned below the plank */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pt-2 md:pt-3"
                      style={{ 
                        top: `${plankHeight + 5}px`,
                        transform: "translateX(-50%) rotateY(0deg)"
                      }}
                    >
                      <span className="text-foreground/80 text-[10px] md:text-xs font-medium tracking-wider uppercase group-hover:text-foreground transition-colors">
                        {plank.name}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        </div>

        {/* CTA Button - Bottom centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute bottom-4 md:bottom-6 left-0 right-0 z-20 flex justify-center"
        >
          <Button asChild className="pointer-events-auto">
            <Link to={`/${language}/biomag-floor`}>
              {t('carousel.cta')}
            </Link>
          </Button>
        </motion.div>

        {/* Subtle floor glow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-50"
          style={{
            background: 'linear-gradient(to top, hsl(var(--kalea-dark)) 0%, transparent 100%)'
          }}
        />
      </div>
    </div>
  );
};

export default Carousel3D;
