import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ApplicationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  backgroundImage?: string;
  index: number;
}

const ApplicationCard = ({ icon: Icon, title, description, backgroundImage, index }: ApplicationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={{
        y: -6,
        rotateX: 2,
        rotateY: -2,
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
      }}
      className="kalea-card group relative aspect-square rounded-2xl bg-muted overflow-hidden"
    >
      {backgroundImage && (
        <img 
          src={backgroundImage} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/80" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <Icon className="w-12 h-12 text-background mb-4" />
        <h3 className="text-xl font-heading font-semibold text-background mb-2">{title}</h3>
        <p className="text-sm text-background/80">{description}</p>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;
