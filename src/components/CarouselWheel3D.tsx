import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useEffect, useState, useRef, useCallback } from "react";

interface Plank {
  id: number | string;
  name: string;
  image: string;
}

interface CarouselWheel3DProps {
  planks: Plank[];
  title: string;
  /** Path without language prefix, e.g. "/biomag-floor" */
  link?: string;
  ctaText?: string;
  direction?: 1 | -1;
}

const CarouselWheel3D = ({ planks, title, link, ctaText, direction = 1 }: CarouselWheel3DProps) => {
  const { language } = useTranslation();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const dragStartedRef = useRef(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setScreenSize(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const animateInertia = useCallback(() => {
    if (Math.abs(velocityRef.current) > 0.1) {
      setRotation(prev => prev + velocityRef.current);
      velocityRef.current *= 0.95;
      animationFrameRef.current = requestAnimationFrame(animateInertia);
    } else {
      velocityRef.current = 0;
      setAutoRotate(true);
    }
  }, []);

  useEffect(() => {
    if (!autoRotate || isDragging || Math.abs(velocityRef.current) > 0.1) return;
    const interval = setInterval(() => {
      setRotation(prev => prev + (0.25 * direction));
    }, 16);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging, direction]);

  useEffect(() => {
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartedRef.current = false;
    lastXRef.current = clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const now = performance.now();
    const deltaX = clientX - lastXRef.current;
    const deltaTime = now - lastTimeRef.current;
    if (Math.abs(deltaX) > 2) dragStartedRef.current = true;
    if (deltaTime > 0) {
      const iv = (deltaX * 0.4) / Math.max(deltaTime / 16, 1);
      velocityRef.current = velocityRef.current * 0.5 + iv * 0.5;
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
      setAutoRotate(true);
    }
  }, [animateInertia]);

  const baseRadii = {
    mobile: { radius: 80, plankWidth: 30, plankHeight: 140 },
    tablet: { radius: 120, plankWidth: 45, plankHeight: 180 },
    desktop: { radius: 160, plankWidth: 55, plankHeight: 220 }
  };

  const base = baseRadii[screenSize];
  const count = planks.length;
  const minRadius = Math.ceil((count * base.plankWidth * 1.8) / (2 * Math.PI));
  const radius = Math.max(base.radius, minRadius);
  const { plankWidth, plankHeight } = base;

  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const activePlank = planks.reduce(
    (closest, plank, index) => {
      const angle = (360 / planks.length) * index;
      const visibleAngle = ((angle + normalizedRotation) % 360 + 360) % 360;
      const distanceFromFront = Math.min(visibleAngle, 360 - visibleAngle);
      return distanceFromFront < closest.distance ? { plank, distance: distanceFromFront } : closest;
    },
    { plank: planks[0], distance: Number.POSITIVE_INFINITY }
  ).plank;

  const fullLink = link ? `/${language}${link}` : undefined;

  return (
    <section className="relative z-[1] bg-background py-8 md:py-12">
      <div
        className="flex flex-col items-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e.clientX); }}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e.touches[0].clientX); }}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        <h3 className="text-foreground/90 tracking-wide mb-2 text-center text-lg md:text-xl font-heading font-semibold">
          {title}
        </h3>

        <div
          className="relative flex items-center justify-center w-full"
          style={{
            perspective: "800px",
            height: screenSize === 'mobile' ? "280px" : screenSize === 'tablet' ? "360px" : "400px",
            marginTop: screenSize === 'mobile' ? "10px" : "20px"
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
              const inner = (
                <motion.div
                  whileHover={{ scale: 1.08, z: 30 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="relative overflow-hidden rounded-lg shadow-xl transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(198,177,149,0.25)]"
                    style={{ width: `${plankWidth}px`, height: `${plankHeight}px`, backfaceVisibility: "hidden" }}
                  >
                    <img src={plank.image} alt={plank.name} className="w-full h-full object-cover" draggable={false} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 opacity-50 group-hover:opacity-30 transition-opacity" />
                  </div>
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
                </motion.div>
              );

              return fullLink ? (
                <Link
                  key={`${plank.id}-${index}`}
                  to={fullLink}
                  className="absolute left-1/2 top-1/2 cursor-pointer group pointer-events-auto"
                  style={{ transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`, transformStyle: "preserve-3d" }}
                  onClick={(e) => { if (dragStartedRef.current) e.preventDefault(); }}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={`${plank.id}-${index}`}
                  className="absolute left-1/2 top-1/2 group"
                  style={{ transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`, transformStyle: "preserve-3d" }}
                >
                  {inner}
                </div>
              );
            })}
          </motion.div>

          <div
            className="absolute left-1/2 text-center pointer-events-none"
            style={{
              top: `calc(50% + ${plankHeight / 2 + (screenSize === 'mobile' ? 34 : 40)}px)`,
              transform: "translateX(-50%)"
            }}
          >
            <span className="text-foreground/70 text-[10px] md:text-xs font-medium tracking-[0.18em] uppercase whitespace-nowrap">
              {activePlank.name}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarouselWheel3D;
