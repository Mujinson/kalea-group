import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  zIndex?: number;
  background?: "default" | "card" | "primary" | "muted" | "transparent";
  noPadding?: boolean;
  noOverlap?: boolean;
}

const PageSection = ({ 
  children, 
  className, 
  zIndex = 1,
  background = "default",
  noPadding = false,
  noOverlap = false,
}: PageSectionProps) => {
  const bgClasses = {
    default: "bg-background",
    card: "bg-card",
    primary: "bg-primary text-primary-foreground",
    muted: "bg-muted",
    transparent: "bg-transparent",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "relative rounded-[36px] shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
        !noOverlap && "-mt-16 md:-mt-24",
        !noPadding && "section-spacing",
        bgClasses[background],
        className
      )}
      style={{ zIndex }}
    >
      {children}
    </motion.section>
  );
};

export default PageSection;
