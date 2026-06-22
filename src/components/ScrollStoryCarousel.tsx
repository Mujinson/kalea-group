import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  MotionValue,
} from "framer-motion";

export interface ScrollStorySlide {
  image: string;
  eyebrow?: string;
  title: string;
  description?: string;
  tint?: string; // CSS color, used for the ambient background gradient
}

interface ScrollStoryCarouselProps {
  slides: ScrollStorySlide[];
  /** Total scroll height of the section, in vh per slide. Default 100 -> 6 slides = 600vh */
  vhPerSlide?: number;
}

/**
 * Premium scrollytelling carousel.
 * - Section is N * vhPerSlide tall.
 * - Inner wrapper is sticky (100vh).
 * - Scroll progress maps to the active slide; the active image fades in with zoom,
 *   the previous one fades out with blur. Ambient gradient shifts per slide.
 * - Uses Framer Motion (GSAP not in the stack).
 */
const ScrollStoryCarousel = ({
  slides,
  vhPerSlide = 100,
}: ScrollStoryCarouselProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Map progress 0..1 -> index 0..slides.length-1 (float)
  const indexMv = useTransform(
    scrollYProgress,
    [0, 1],
    [0, slides.length - 0.001]
  );

  const sectionHeight = `${slides.length * vhPerSlide}vh`;

  return (
    <section
      ref={ref}
      className="relative bg-[hsl(34_18%_12%)]"
      style={{ height: sectionHeight }}
      aria-label="Kalēa scroll story"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Ambient color background — shifts with the active slide */}
        <AmbientBackground slides={slides} indexMv={indexMv} />

        {/* Soft dark overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 pointer-events-none" />

        {/* Image stack — text travels inside each slide */}
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-8 md:px-16">
          <div className="relative w-full max-w-[1400px] aspect-[16/10] md:aspect-[16/9]">
            {slides.map((s, i) => (
              <SlideImage
                key={i}
                slide={s}
                index={i}
                indexMv={indexMv}
                reduced={!!prefersReduced}
              />
            ))}
          </div>
        </div>

        {/* Progress bar (vertical on md+, horizontal on mobile) */}
        <ProgressIndicator
          total={slides.length}
          indexMv={indexMv}
          scrollYProgress={scrollYProgress}
        />
      </div>
    </section>
  );
};

/* ---------------- Sub-components ---------------- */

const AmbientBackground = ({
  slides,
  indexMv,
}: {
  slides: ScrollStorySlide[];
  indexMv: MotionValue<number>;
}) => {
  // Build a stack of tinted layers, each fading in around its index.
  return (
    <div className="absolute inset-0">
      {slides.map((s, i) => {
        const opacity = useTransform(indexMv, (v) => {
          const d = Math.abs(v - i);
          return Math.max(0, 1 - d);
        });
        const tint = s.tint || "hsl(34 30% 25%)";
        return (
          <motion.div
            key={i}
            aria-hidden
            style={{
              opacity,
              background: `radial-gradient(ellipse at 30% 20%, ${tint} 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, ${tint} 0%, transparent 55%)`,
            }}
            className="absolute inset-0"
          />
        );
      })}
    </div>
  );
};

const SlideImage = ({
  slide,
  index,
  indexMv,
  reduced,
}: {
  slide: ScrollStorySlide;
  index: number;
  indexMv: MotionValue<number>;
  reduced: boolean;
}) => {
  // Each slide enters from the right, sits centered, exits to the left.
  // VISIBLE = fully centered & opaque; HIDDEN = fully off-screen & invisible.
  // The 0.10 gap between HIDDEN of one slide and -HIDDEN of the next leaves a brief empty moment.
  const VISIBLE = 0.3;
  const HIDDEN = 0.45;

  const opacity = useTransform(indexMv, (v) => {
    const a = Math.abs(v - index);
    if (a >= HIDDEN) return 0;
    if (a <= VISIBLE) return 1;
    return 1 - (a - VISIBLE) / (HIDDEN - VISIBLE);
  });

  // x: future slides start at +110% (right), past slides leave at -110% (left).
  const x = useTransform(indexMv, (v) => {
    const d = v - index;
    if (d <= -HIDDEN) return "110%";
    if (d >= HIDDEN) return "-110%";
    if (d < -VISIBLE) {
      const t = (-d - VISIBLE) / (HIDDEN - VISIBLE); // 0 at -VISIBLE → 1 at -HIDDEN
      return `${(t * 110).toFixed(2)}%`;
    }
    if (d > VISIBLE) {
      const t = (d - VISIBLE) / (HIDDEN - VISIBLE);
      return `${(-t * 110).toFixed(2)}%`;
    }
    return "0%";
  });

  const visibility = useTransform(indexMv, (v) =>
    Math.abs(v - index) >= HIDDEN ? "hidden" : "visible"
  );

  return (
    <motion.div
      style={
        reduced
          ? { opacity: index === 0 ? 1 : 0 }
          : { opacity, x, visibility, pointerEvents: "none" }
      }
      className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] will-change-transform"
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
      />
      {/* Subtle inner gradient to seat the text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      {/* Text travels together with the image */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-14 text-white max-w-2xl">
        {slide.eyebrow && (
          <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-white/70 mb-3">
            {slide.eyebrow}
          </p>
        )}
        <h3 className="font-heading font-light text-2xl md:text-4xl lg:text-5xl leading-tight">
          {slide.title}
        </h3>
        {slide.description && (
          <p className="mt-3 text-sm md:text-base text-white/80 max-w-lg leading-relaxed">
            {slide.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};


const ProgressIndicator = ({
  total,
  indexMv,
  scrollYProgress,
}: {
  total: number;
  indexMv: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
}) => {
  const widthPct = useTransform(scrollYProgress, (v) => `${Math.min(100, v * 100)}%`);
  const currentLabel = useTransform(indexMv, (v) =>
    String(Math.min(total, Math.floor(v) + 1)).padStart(2, "0")
  );

  return (
    <>
      {/* Counter */}
      <div className="absolute top-8 right-8 md:top-10 md:right-12 z-20 text-white/90 font-mono text-xs md:text-sm tracking-widest flex items-center gap-2">
        <motion.span>{currentLabel}</motion.span>
        <span className="text-white/40">/ {String(total).padStart(2, "0")}</span>
      </div>

      {/* Vertical bar on md+ */}
      <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 z-20 w-[2px] h-[200px] bg-white/15 overflow-hidden rounded-full">
        <motion.div
          style={{ height: widthPct }}
          className="w-full bg-white/80 origin-top"
        />
      </div>

      {/* Horizontal bar on mobile */}
      <div className="md:hidden absolute left-6 right-6 bottom-3 z-20 h-[2px] bg-white/15 overflow-hidden rounded-full">
        <motion.div style={{ width: widthPct }} className="h-full bg-white/80" />
      </div>
    </>
  );
};

export default ScrollStoryCarousel;
