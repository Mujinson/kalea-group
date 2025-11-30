import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

const FeatureCard = ({ icon: Icon, title, description, index = 0 }: FeatureCardProps) => {
  const delay = index * 0.15;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -6,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
      }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className="kalea-card group relative overflow-hidden h-full flex flex-col"
      style={{
        background: "rgba(255, 255, 255, 0.18)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "32px",
        padding: "48px",
      }}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon - no background, just floating */}
        <div className="mb-8">
          <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
        
        {/* Title - bold and premium */}
        <h3 className="text-3xl font-heading font-semibold text-white mb-6 tracking-tight" style={{ lineHeight: '1.15' }}>
          {title}
        </h3>
        
        {/* Description - white with 80% opacity */}
        <p className="text-white/80 text-body flex-grow">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
