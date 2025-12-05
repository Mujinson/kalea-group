import { ReactNode } from "react";

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  zIndex?: number;
}

const ScrollSection = ({ children, className = "", zIndex = 1 }: ScrollSectionProps) => {
  return (
    <div 
      className={`sticky top-0 ${className}`}
      style={{ zIndex }}
    >
      {children}
    </div>
  );
};

export default ScrollSection;
