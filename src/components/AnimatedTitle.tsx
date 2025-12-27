import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
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

const LETTER_STAGGER = 0.03;
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      delayChildren: delay,
      staggerChildren: LETTER_STAGGER,
    },
  }),
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE,
    },
  },
};

const AnimatedTitle = ({
  text,
  className,
  delay = 0.1,
  as: Tag = "h1",
  suffix,
}: AnimatedTitleProps) => {
  const location = useLocation();
  const letters = useMemo(() => text.split(""), [text]);

  // Force replay on route changes (and when text changes)
  const [runId, setRunId] = useState(0);
  useEffect(() => {
    setRunId((v) => v + 1);
  }, [location.pathname, text]);

  // Start after paint to prevent "all at once" on first render
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [runId]);

  const tagClassName = ["inline", className].filter(Boolean).join(" ");

  return (
    <motion.div>
      <motion.div
        key={`${location.pathname}:${runId}`}
        variants={containerVariants}
        custom={delay}
        initial="hidden"
        animate={ready ? "visible" : "hidden"}
      >
        <Tag className={tagClassName}>
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="inline-block"
              style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
          {suffix && (
            <motion.span variants={letterVariants} className="inline-block">
              {suffix}
            </motion.span>
          )}
        </Tag>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedTitle;
