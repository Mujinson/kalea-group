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

// Helper function to darken a hex color
const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

interface ColorItem {
  name: string;
  circleImage: string;
  plankImage: string;
  slug: string;
  colorHex?: string; // For colors without images
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
              {/* Circle image or color */}
              <div className="w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                {color.circleImage ? (
                  <img
                    src={color.circleImage}
                    alt={color.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{ 
                      background: color.colorHex 
                        ? `linear-gradient(135deg, ${color.colorHex} 0%, ${adjustColor(color.colorHex, -20)} 100%)`
                        : '#888'
                    }}
                  />
                )}
              </div>

              {/* Search icon button - only show if we have plank image or colorHex */}
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

                {/* Plank image or color display */}
                <div className="bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                  {selectedColor.plankImage ? (
                    <img
                      src={selectedColor.plankImage}
                      alt={`${selectedColor.name} - Lastra`}
                      className="w-auto max-w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div 
                      className="w-64 h-96 rounded-lg shadow-lg"
                      style={{ 
                        background: selectedColor.colorHex 
                          ? `linear-gradient(180deg, ${selectedColor.colorHex} 0%, ${adjustColor(selectedColor.colorHex, -30)} 100%)`
                          : '#888'
                      }}
                    />
                  )}
                  <p className="text-center mt-4 text-lg font-semibold text-foreground uppercase tracking-wider">
                    {selectedColor.name}
                  </p>
                  {!selectedColor.plankImage && (
                    <p className="text-center mt-2 text-sm text-muted-foreground">
                      Immagine prodotto in arrivo
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Default BIOMAG FLOOR® colors - can be reused
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

// CWC colors - BIOWOOD FLOOR® collection (7 colors)
export const cwcColors: ColorItem[] = [
  { name: "Nexa", slug: "nexa", circleImage: "", plankImage: "", colorHex: "#c9c4be" },
  { name: "Orama", slug: "orama", circleImage: "", plankImage: "", colorHex: "#6b6058" },
  { name: "Nuvia", slug: "nuvia", circleImage: "", plankImage: "", colorHex: "#c9a55c" },
  { name: "Mielea", slug: "mielea", circleImage: "", plankImage: "", colorHex: "#d8c9a8" },
  { name: "Argilla", slug: "argilla", circleImage: "", plankImage: "", colorHex: "#a09690" },
  { name: "Radice", slug: "radice", circleImage: "", plankImage: "", colorHex: "#8b5a3c" },
  { name: "Vetra", slug: "vetra", circleImage: "", plankImage: "", colorHex: "#c4bdb5" },
];

export type { ColorItem };
export default ColorCircleGallery;
