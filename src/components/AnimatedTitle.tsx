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
  
  // Split text into characters, keeping ® and trailing punctuation attached to the previous word
  const letters = useMemo(() => {
    const chars = text.split("");
    const result: string[] = [];
    const stickyChars = new Set(["®", ".", ",", ";", ":", "!", "?"]);
    for (let i = 0; i < chars.length; i++) {
      if (stickyChars.has(chars[i]) && result.length > 0 && result[result.length - 1] !== " ") {
        result[result.length - 1] += chars[i];
      } else {
        result.push(chars[i]);
      }
    }
    return result;
  }, [text]);

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
      {(() => {
        // Group letters into whole words: a word never breaks in the middle.
        const out: ReactNode[] = [];
        let word: { letter: string; index: number }[] = [];
        const flush = (k: number) => {
          if (!word.length) return;
          const w = word;
          word = [];
          out.push(
            <span key={`${animationKey}:w${k}`} className="inline-block whitespace-nowrap">
              {w.map(({ letter, index }) =>
                reduceMotion ? (
                  <span key={`${animationKey}:${index}`} className="inline-block">{letter}</span>
                ) : (
                  <motion.span
                    key={`${animationKey}:${index}`}
                    custom={index}
                    variants={letterVariants}
                    initial="hidden"
                    animate={armed ? "show" : "hidden"}
                    className="inline-block will-change-transform"
                  >
                    {letter}
                  </motion.span>
                )
              )}
            </span>
          );
        };
        letters.forEach((letter, index) => {
          if (letter === " ") { flush(index); out.push(" "); }
          else if (letter === "\n") { flush(index); out.push(<br key={`${animationKey}:br${index}`} />); }
          else word.push({ letter, index });
        });
        flush(letters.length);
        return out;
      })()}

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


