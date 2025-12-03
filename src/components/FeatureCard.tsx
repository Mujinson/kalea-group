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
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
      }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className="kalea-card group relative overflow-hidden h-full flex flex-col"
      style={{
        background: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "32px",
        padding: "48px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon */}
        <div className="mb-8">
          <Icon className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-heading font-semibold text-foreground mb-4 tracking-tight" style={{ lineHeight: '1.15' }}>
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground text-body flex-grow">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
