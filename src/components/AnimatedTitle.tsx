import { motion, useReducedMotion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

interface AnimatedTitleProps {
  text: string;
  className?: string;
  /** Delay before the first letter starts */
  delay?: number;
  as?: "h1" | "h2" | "h3";
  suffix?: ReactNode;
}

// “Falling letters” effect: letters drop in one-by-one.
const LETTER_STAGGER = 0.065;
const DROP_DISTANCE = 28;
// Extra delay so the user sees the whole animation (page/hero finishes appearing first).
const START_AFTER_MS = 900;

const SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 32,
  bounce: 0.25,
} as const;

const AnimatedTitle = ({
  text,
  className,
  // Keep this small; the real “start later” is controlled by START_AFTER_MS.
  delay = 0.05,
  as: Tag = "h1",
  suffix,
}: AnimatedTitleProps) => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const letters = useMemo(() => text.split(""), [text]);

  // Remount on navigation to reliably replay the animation.
  const animationKey = `${location.key}:${location.pathname}:${text}`;

  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    setArmed(false);
    const t = window.setTimeout(() => setArmed(true), START_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [animationKey, reduceMotion]);

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: -DROP_DISTANCE,
      rotate: -2,
    },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        ...SPRING,
        delay: delay + i * LETTER_STAGGER,
      },
    }),
  };

  return (
    <Tag key={animationKey} className={className} aria-label={text}>
      {letters.map((letter, index) =>
        reduceMotion ? (
          <span
            key={`${animationKey}:${index}`}
            className="inline-block"
            style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ) : (
          <motion.span
            key={`${animationKey}:${index}`}
            custom={index}
            variants={letterVariants}
            initial="hidden"
            animate={armed ? "show" : "hidden"}
            className="inline-block will-change-transform"
            style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        )
      )}

      {suffix &&
        (reduceMotion ? (
          <span key={`${animationKey}:suffix`} className="inline-block">
            {suffix}
          </span>
        ) : (
          <motion.span
            key={`${animationKey}:suffix`}
            custom={letters.length}
            variants={letterVariants}
            initial="hidden"
            animate={armed ? "show" : "hidden"}
            className="inline-block will-change-transform"
          >
            {suffix}
          </motion.span>
        ))}
    </Tag>
  );
};

export default AnimatedTitle;


