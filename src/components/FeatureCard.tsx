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
      transition={{ duration: 0.7, delay }}
      className="group relative overflow-hidden rounded-3xl p-10 hover-lift transition-all duration-500"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Glassmorphism overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-heading font-semibold text-white mb-5 leading-tight">{title}</h3>
        <p className="text-white/70 leading-relaxed text-[15px]">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
