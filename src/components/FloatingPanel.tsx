import { motion } from "framer-motion";
import { useState } from "react";

interface FloatingPanelProps {
  panel: {
    id: number;
    x: number;
    y: number;
    rotate: number;
    floatDelay: number;
    image: string;
    keyword: string;
  };
  width: number;
  height: number;
  shadowSize: 'small' | 'medium' | 'large';
}

const FloatingPanel = ({ panel, width, height, shadowSize }: FloatingPanelProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const shadowStyles = {
    small: {
      default: '0 15px 30px rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.4)',
      hover: '0 25px 50px rgba(0,0,0,0.6), 0 10px 20px rgba(0,0,0,0.5), 0 0 30px rgba(200,150,80,0.3)',
    },
    medium: {
      default: '0 25px 50px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.4)',
      hover: '0 35px 70px rgba(0,0,0,0.6), 0 15px 30px rgba(0,0,0,0.5), 0 0 40px rgba(200,150,80,0.3)',
    },
    large: {
      default: '0 40px 80px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.4)',
      hover: '0 60px 120px rgba(0,0,0,0.6), 0 30px 60px rgba(0,0,0,0.5), 0 0 60px rgba(200,150,80,0.3)',
    },
  };

  const fontSizeMap = {
    small: 'text-[8px]',
    medium: 'text-[10px]',
    large: 'text-[18px]',
  };

  return (
    <motion.div
      className="absolute cursor-pointer pointer-events-auto"
      style={{
        x: panel.x,
        y: panel.y,
        width,
        height,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: panel.rotate }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: [panel.rotate - 2, panel.rotate + 2, panel.rotate - 2],
        y: [panel.y - (shadowSize === 'large' ? 12 : shadowSize === 'medium' ? 8 : 5), panel.y + (shadowSize === 'large' ? 12 : shadowSize === 'medium' ? 8 : 5), panel.y - (shadowSize === 'large' ? 12 : shadowSize === 'medium' ? 8 : 5)],
        x: [panel.x - (shadowSize === 'large' ? 6 : shadowSize === 'medium' ? 4 : 3), panel.x + (shadowSize === 'large' ? 6 : shadowSize === 'medium' ? 4 : 3), panel.x - (shadowSize === 'large' ? 6 : shadowSize === 'medium' ? 4 : 3)],
      }}
      whileHover={{ 
        scale: 1.4,
        rotate: 0,
        zIndex: 50,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 1.4,
        rotate: 0,
        zIndex: 50,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      transition={{ 
        opacity: { duration: 0.8, delay: 0.2 + panel.id * 0.08 },
        scale: { duration: 0.8, delay: 0.2 + panel.id * 0.08 },
        rotate: { duration: 6 + panel.floatDelay, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
        y: { duration: 4 + panel.floatDelay, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
        x: { duration: 5 + panel.floatDelay * 0.5, repeat: Infinity, ease: "easeInOut", delay: panel.floatDelay },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsHovered(true)}
      onTap={() => setTimeout(() => setIsHovered(false), 1500)}
    >
      <motion.div 
        className="w-full h-full rounded-sm overflow-hidden relative"
        style={{
          boxShadow: shadowStyles[shadowSize].default,
        }}
        whileHover={{
          boxShadow: shadowStyles[shadowSize].hover,
        }}
        whileTap={{
          boxShadow: shadowStyles[shadowSize].hover,
        }}
      >
        <img 
          src={panel.image} 
          alt="" 
          className="w-full h-full object-cover"
        />
        
        {/* Keyword overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span 
            className={`text-white font-bold tracking-wider text-center px-2 leading-tight ${fontSizeMap[shadowSize]}`}
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            {panel.keyword}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FloatingPanel;