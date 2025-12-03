import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

const LayerDiagram = () => {
  const { t } = useTranslation();

  const layers = [
    {
      name: t('stonecore.layers.wear'),
      thickness: "0.3 mm",
      bgColor: "bg-[#A8A29E]",
    },
    {
      name: t('stonecore.layers.decorative'),
      thickness: "0.7 mm",
      bgColor: "bg-[#D4C8B8]",
    },
    {
      name: t('stonecore.layers.core'),
      thickness: "8.5 mm",
      bgColor: "bg-[#3D3833]",
      isCore: true,
    },
    {
      name: t('stonecore.layers.mat'),
      thickness: "1.5 mm",
      bgColor: "bg-[#B8B8B8]",
    },
  ];

  return (
    <div 
      className="rounded-[18px] p-8 md:p-10"
      style={{ 
        backgroundColor: '#FAF9F6',
        boxShadow: '0 4px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)'
      }}
    >
      <h3 className="text-lg font-medium text-foreground/90 mb-6 tracking-tight">
        Composizione strati
      </h3>
      
      <div className="space-y-0">
        {layers.map((layer, index) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div 
                  className={`w-10 ${layer.isCore ? 'h-6' : 'h-3'} rounded-sm ${layer.bgColor}`}
                />
                <span className="text-sm font-normal text-foreground/80">
                  {layer.name}
                </span>
              </div>
              <span className="text-xs font-light text-foreground/50 tracking-wide">
                {layer.thickness}
              </span>
            </div>
            {index < layers.length - 1 && (
              <div className="h-px bg-foreground/8" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LayerDiagram;
