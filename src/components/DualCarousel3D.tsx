import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";

// Import BIOMAG finish images
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";

// Import Hypermatt product data
import { hypermattXL, hypermattSpina, hypermatt55 } from "@/data/hypermattProducts";

const biomagPlanks = [
  { id: 1, name: "Aurora", image: finishAurora },
  { id: 2, name: "Corteccia", image: finishCorteccia },
  { id: 3, name: "Perla", image: finishPerla },
  { id: 4, name: "Sabbia", image: finishSabbia },
  { id: 5, name: "Silven", image: finishSilven },
  { id: 6, name: "Terram", image: finishTerram },
  { id: 7, name: "Velora", image: finishVelora },
];

// Convert Hypermatt data to plank format
const toPlankFormat = (products: { id: string; name: string; image: string }[]) =>
  products.map((p, i) => ({ id: i + 1, name: p.name, image: p.image }));

const hypermattXLPlanks = toPlankFormat(hypermattXL.products);
const hypermattSpinaPlanks = toPlankFormat(hypermattSpina.products);
const hypermatt55Planks = toPlankFormat(hypermatt55.products);

interface CarouselWheelProps {
  planks: typeof biomagPlanks;
  title: string;
  link: string;
  ctaText: string;
  direction: 1 | -1;
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

const CarouselWheel = ({ planks, title, link, ctaText, direction, screenSize }: CarouselWheelProps) => {
  const { language } = useTranslation();
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const dragStartedRef = useRef(false);

  const animateInertia = useCallback(() => {
    if (Math.abs(velocityRef.current) > 0.1) {
      setRotation(prev => prev + velocityRef.current);
      velocityRef.current *= 0.95;
      animationFrameRef.current = requestAnimationFrame(animateInertia);
    } else {
      velocityRef.current = 0;
      // Resume auto-rotation immediately
      setAutoRotate(true);
    }
  }, []);

  // Auto-rotation with direction
  useEffect(() => {
    if (!autoRotate || isDragging || Math.abs(velocityRef.current) > 0.1) return;
    
    const interval = setInterval(() => {
      setRotation(prev => prev + (0.25 * direction));
    }, 16);
    
    return () => clearInterval(interval);
  }, [autoRotate, isDragging, direction]);

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
      const instantVelocity = (deltaX * 0.4) / Math.max(deltaTime / 16, 1);
      velocityRef.current = velocityRef.current * 0.5 + instantVelocity * 0.5;
    }
    
    setRotation(prev => prev + deltaX * 0.4);
    lastXRef.current = clientX;
    lastTimeRef.current = now;
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    if (Math.abs(velocityRef.current) > 0.5) {
      animationFrameRef.current = requestAnimationFrame(animateInertia);
    } else {
      // Resume auto-rotation immediately
      setAutoRotate(true);
    }
  }, [animateInertia]);

  // Smaller dimensions for dual layout
  const dimensions = {
    mobile: { radius: 80, plankWidth: 35, plankHeight: 160 },
    tablet: { radius: 130, plankWidth: 55, plankHeight: 200 },
    desktop: { radius: 180, plankWidth: 70, plankHeight: 260 }
  };
  
  const { radius, plankWidth, plankHeight } = dimensions[screenSize];

  return (
    <div 
      className="flex-1 flex flex-col items-center cursor-grab active:cursor-grabbing select-none pb-8"
      onMouseDown={(e) => {
        e.stopPropagation();
        handleDragStart(e.clientX);
      }}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={(e) => {
        e.stopPropagation();
        handleDragStart(e.touches[0].clientX);
      }}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
    >
      {/* Product Title */}
      <h3 className="text-foreground/90 tracking-wide mb-2 text-center text-lg md:text-xl">
        {title}
      </h3>

      {/* 3D Carousel */}
      <div 
        className="relative flex items-center justify-center w-full"
        style={{ 
          perspective: "800px",
          height: screenSize === 'mobile' ? "300px" : screenSize === 'tablet' ? "380px" : "440px",
          marginTop: screenSize === 'mobile' ? "20px" : "40px"
        }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ 
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            transform: `translate(-50%, -50%) rotateY(${rotation}deg)`
          }}
        >
          {planks.map((plank, index) => {
            const angle = (360 / planks.length) * index;
            return (
              <Link
                key={plank.id}
                to={`/${language}${link}`}
                className="absolute left-1/2 top-1/2 cursor-pointer group pointer-events-auto"
                style={{
                  transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d"
                }}
                onClick={(e) => {
                  if (dragStartedRef.current) e.preventDefault();
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.08, z: 30 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="relative overflow-hidden rounded-lg shadow-xl transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(198,177,149,0.25)]"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 opacity-50 group-hover:opacity-30 transition-opacity" />
                  </div>

                  {/* Side edge */}
                  <div
                    className="absolute top-0 bg-kalea-tan/25"
                    style={{
                      width: screenSize === 'mobile' ? "4px" : "6px",
                      height: `${plankHeight}px`,
                      transform: `rotateY(90deg) translateZ(${plankWidth / 2}px)`,
                      transformOrigin: "left center",
                      backfaceVisibility: "hidden"
                    }}
                  />

                  {/* Name label */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pt-1 md:pt-2"
                    style={{ 
                      top: `${plankHeight + 3}px`,
                      transform: "translateX(-50%) rotateY(0deg)"
                    }}
                  >
                    <span className="text-foreground/70 text-[8px] md:text-[10px] font-medium tracking-wider uppercase group-hover:text-foreground transition-colors">
                      {plank.name}
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* CTA Button - positioned at bottom */}
      <div className="mt-auto pt-24 md:pt-32">
        <Button asChild className="pointer-events-auto">
          <Link to={`/${language}${link}`}>
            {ctaText}
          </Link>
        </Button>
      </div>
    </div>
  );
};

const DualCarousel3D = () => {
  const { t } = useTranslation();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
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

  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden py-12 md:py-16">
      {/* Ambient light effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(198, 177, 149, 0.06) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10 h-full flex flex-col items-center px-4">
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 md:mb-10"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Le Nostre Collezioni
          </h2>
          <p className="text-foreground/60 text-sm md:text-base font-light max-w-xl mx-auto">
            Due tecnologie innovative, infinite possibilità di design
          </p>
        </motion.header>

        {/* Dual Carousels Container */}
        <div className={`w-full max-w-7xl flex ${screenSize === 'mobile' ? 'flex-col gap-12' : 'flex-row gap-4 md:gap-8'}`}>
          {/* BIOMAG Carousel - rotates clockwise */}
          <CarouselWheel 
            planks={biomagPlanks}
            title="Biomag Floor®"
            link="/biomag-floor"
            ctaText="Scopri Biomag Floor®"
            direction={1}
            screenSize={screenSize}
          />
          
          {/* Hypermatt Carousel - rotates counter-clockwise */}
          <CarouselWheel 
            planks={biocorePlanks}
            title="Hypermatt"
            link="/biocore-floor"
            ctaText="Scopri Hypermatt"
            direction={-1}
            screenSize={screenSize}
          />
        </div>
      </div>
    </div>
  );
};

export default DualCarousel3D;
