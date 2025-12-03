import { motion } from "framer-motion";
import { Shield, Droplets, Flame, Bug, Ruler, Zap } from "lucide-react";

const MaterialPerformanceCard = () => {
  const features = [
    {
      icon: Shield,
      text: "Estrema stabilità (MgO core)",
    },
    {
      icon: Droplets,
      text: "Resistente all'acqua e all'umidità",
    },
    {
      icon: Flame,
      text: "Comportamento al fuoco avanzato",
    },
    {
      icon: Bug,
      text: "Antimuffa e antibatterico",
    },
    {
      icon: Ruler,
      text: "Nessuna deformazione nel tempo",
    },
    {
      icon: Zap,
      text: "Installazione rapida con sistema KalēaLock",
    },
  ];

  return (
    <div 
      className="h-full rounded-[18px] p-8 md:p-10"
      style={{ 
        backgroundColor: '#FAF9F6',
        boxShadow: '0 4px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)'
      }}
    >
      <h3 className="text-lg font-medium text-foreground/90 mb-6 tracking-tight">
        Prestazioni del materiale
      </h3>
      
      <div className="space-y-0">
        {features.map((feature, index) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
          >
            <div className="flex items-center gap-4 py-3">
              <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-4 h-4 text-foreground/60" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-normal text-foreground/80">
                {feature.text}
              </span>
            </div>
            {index < features.length - 1 && (
              <div className="h-px bg-foreground/8" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MaterialPerformanceCard;
