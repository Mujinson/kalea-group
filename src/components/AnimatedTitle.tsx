import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedTitleProps {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3";
  suffix?: ReactNode;
}

const AnimatedTitle = ({ text, className, delay = 0.1, as: Tag = "h1", suffix }: AnimatedTitleProps) => {
  const letters = text.split("");
  
  return (
    <motion.div className={className}>
      {Tag === "h1" ? (
        <h1 className="inline">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + index * 0.03,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="inline-block"
              style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
          {suffix && (
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + letters.length * 0.03,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="inline-block"
            >
              {suffix}
            </motion.span>
          )}
        </h1>
      ) : Tag === "h2" ? (
        <h2 className="inline">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + index * 0.03,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="inline-block"
              style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
          {suffix}
        </h2>
      ) : (
        <h3 className="inline">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + index * 0.03,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="inline-block"
              style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
          {suffix}
        </h3>
      )}
    </motion.div>
  );
};

export default AnimatedTitle;
