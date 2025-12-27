import { motion } from "framer-motion";
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

// Slightly slower so the effect is clearly visible
const LETTER_STAGGER = 0.045;
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const AnimatedTitle = ({
  text,
  className,
  delay = 0.1,
  as: Tag = "h1",
  suffix,
}: AnimatedTitleProps) => {
  const location = useLocation();
  const letters = useMemo(() => text.split(""), [text]);

  // Key forces a remount on navigation so the animation reliably replays.
  const animationKey = `${location.key}:${location.pathname}:${text}`;

  return (
    <Tag key={animationKey} className={className} aria-label={text}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.28,
            delay: delay + index * LETTER_STAGGER,
            ease: EASE,
          }}
          className="inline-block"
          style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
      {suffix && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.28,
            delay: delay + letters.length * LETTER_STAGGER,
            ease: EASE,
          }}
          className="inline-block"
        >
          {suffix}
        </motion.span>
      )}
    </Tag>
  );
};

export default AnimatedTitle;

