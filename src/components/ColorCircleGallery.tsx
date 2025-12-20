import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Import finish images
import finishAurora from "@/assets/finish-aurora.jpg";
import finishCorteccia from "@/assets/finish-corteccia.jpg";
import finishPerla from "@/assets/finish-perla.jpg";
import finishSabbia from "@/assets/finish-sabbia.jpg";
import finishSilven from "@/assets/finish-silven.jpg";
import finishTerram from "@/assets/finish-terram.jpg";
import finishVelora from "@/assets/finish-velora.jpg";

interface ColorItem {
  name: string;
  circleImage: string;
  plankImage: string;
  slug: string;
}

interface ColorCircleGalleryProps {
  title: string;
  subtitle?: string;
  colors: ColorItem[];
}

const ColorCircleGallery = ({ title, subtitle, colors }: ColorCircleGalleryProps) => {
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);

  return (
    <>
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
        {colors.map((color, index) => (
          <motion.div
            key={color.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="flex flex-col items-center"
          >
            {/* Circle container */}
            <div className="relative group">
              {/* Circle image */}
              <div className="w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                <img
                  src={color.circleImage}
                  alt={color.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Search icon button */}
              <button
                onClick={() => setSelectedColor(color)}
                className="absolute -top-1 -right-1 md:top-0 md:right-0 w-8 h-8 md:w-10 md:h-10 bg-foreground/60 hover:bg-foreground/80 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-md"
                aria-label={`Visualizza ${color.name}`}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5 text-background" />
              </button>
            </div>

            {/* Color name */}
            <h3 className="mt-4 text-sm md:text-base font-semibold text-foreground uppercase tracking-wider">
              {color.name}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedColor} onOpenChange={() => setSelectedColor(null)}>
        <DialogContent className="max-w-lg p-0 bg-transparent border-none shadow-none">
          <AnimatePresence>
            {selectedColor && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative flex flex-col items-center"
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedColor(null)}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-foreground/90 hover:bg-foreground rounded-full flex items-center justify-center transition-colors z-50 shadow-lg"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5 text-background" />
                </button>

                {/* Plank image */}
                <div className="bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                  <img
                    src={selectedColor.plankImage}
                    alt={`${selectedColor.name} - Lastra`}
                    className="w-auto max-w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                  <p className="text-center mt-4 text-lg font-semibold text-foreground uppercase tracking-wider">
                    {selectedColor.name}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Default StoneCore 10 colors - can be reused
export const stonecoreColors: ColorItem[] = [
  { name: "Aurora", slug: "aurora", circleImage: finishAurora, plankImage: finishAurora },
  { name: "Corteccia", slug: "corteccia", circleImage: finishCorteccia, plankImage: finishCorteccia },
  { name: "Cenere", slug: "cenere", circleImage: finishCorteccia, plankImage: finishCorteccia },
  { name: "Sabbia", slug: "sabbia", circleImage: finishSabbia, plankImage: finishSabbia },
  { name: "Silven", slug: "silven", circleImage: finishSilven, plankImage: finishSilven },
  { name: "Terram", slug: "terram", circleImage: finishTerram, plankImage: finishTerram },
  { name: "Perla", slug: "perla", circleImage: finishPerla, plankImage: finishPerla },
  { name: "Velora", slug: "velora", circleImage: finishVelora, plankImage: finishVelora },
];

export default ColorCircleGallery;
