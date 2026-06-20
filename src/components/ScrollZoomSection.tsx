import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ScrollZoomSectionProps {
  image: string;
  eyebrow?: string;
  title: string;
  description?: string;
  alt?: string;
}

/**
 * PayPal-style scroll-pinned zoom section.
 * - Container is ~220vh tall
 * - Inner wrapper is sticky (100vh)
 * - Image scales from ~0.55 -> 1, border-radius 24px -> 0px, tied to scroll progress
 */
const ScrollZoomSection = ({
  image,
  eyebrow,
  title,
  description,
  alt = "",
}: ScrollZoomSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.7], [0.55, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.7], [24, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.25], [0, -20]);

  return (
    <section
      ref={ref}
      className="relative bg-background"
      style={{ height: "220vh" }}
      aria-label={title}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Intro copy fades out as the image grows */}
        <motion.div
          style={prefersReduced ? undefined : { opacity: textOpacity, y: textY }}
          className="absolute top-[8vh] left-0 right-0 z-10 px-6 text-center pointer-events-none"
        >
          {eyebrow && (
            <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-foreground/60 mb-3">
              {eyebrow}
            </p>
          )}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-light text-foreground max-w-3xl mx-auto leading-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </motion.div>

        <motion.div
          style={
            prefersReduced
              ? { borderRadius: 0 }
              : { scale, borderRadius: radius }
          }
          className="relative w-[92vw] h-[78vh] md:w-[88vw] md:h-[82vh] overflow-hidden will-change-transform shadow-2xl"
        >
          <img
            src={image}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ScrollZoomSection;
