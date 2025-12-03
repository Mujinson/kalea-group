import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

const LayerDiagram = () => {
  const { t } = useTranslation();

  const layers = [
    {
      name: t('stonecore.layers.wear'),
      height: "h-4",
      bgColor: "bg-[#9E9E9E]",
      textColor: "text-foreground",
    },
    {
      name: t('stonecore.layers.decorative'),
      height: "h-8",
      bgColor: "bg-[#E0D6C8]",
      textColor: "text-foreground",
    },
    {
      name: t('stonecore.layers.core'),
      height: "h-32",
      bgColor: "bg-[#2A2520]",
      textColor: "text-white",
      rounded: true,
    },
    {
      name: t('stonecore.layers.mat'),
      height: "h-8",
      bgColor: "bg-[#D5D5D5]",
      textColor: "text-foreground",
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex flex-col gap-1 p-6 bg-muted/30 rounded-2xl">
        {layers.map((layer, index) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`
              ${layer.height} 
              ${layer.bgColor} 
              ${layer.textColor}
              ${layer.rounded ? 'rounded-xl' : 'rounded-sm'}
              flex items-center px-4 font-medium text-sm
            `}
          >
            {layer.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LayerDiagram;
