import { motion, useReducedMotion } from "framer-motion";
import { ReactNode, useMemo } from "react";
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

const AnimatedTitle = ({
  text,
  className,
  delay = 0.25,
  as: Tag = "h1",
  suffix,
}: AnimatedTitleProps) => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const letters = useMemo(() => text.split(""), [text]);

  // Remount on navigation to reliably replay the animation.
  const animationKey = `${location.key}:${location.pathname}:${text}`;

  return (
    <Tag key={animationKey} className={className} aria-label={text}>
      {letters.map((letter, index) => (
        <motion.span
          key={`${animationKey}:${index}`}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: -DROP_DISTANCE,
                  rotate: -2,
                }
          }
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 520,
                  damping: 32,
                  bounce: 0.25,
                  delay: delay + index * LETTER_STAGGER,
                }
          }
          className="inline-block will-change-transform"
          style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}

      {suffix && (
        <motion.span
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: -DROP_DISTANCE,
                  rotate: -2,
                }
          }
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 520,
                  damping: 32,
                  bounce: 0.25,
                  delay: delay + letters.length * LETTER_STAGGER,
                }
          }
          className="inline-block will-change-transform"
        >
          {suffix}
        </motion.span>
      )}
    </Tag>
  );
};

export default AnimatedTitle;


