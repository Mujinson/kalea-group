import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ProductLightboxProps {
  open: boolean;
  image?: string;
  name?: string;
  onOpenChange: (open: boolean) => void;
}

const ProductLightbox = ({ open, image, name, onOpenChange }: ProductLightboxProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (!open || !image) {
      setIsImageLoaded(false);
      return;
    }

    const preloadImage = new Image();
    preloadImage.src = image;

    if (preloadImage.complete) {
      setIsImageLoaded(true);
      return;
    }

    const handleReady = () => setIsImageLoaded(true);

    preloadImage.addEventListener("load", handleReady);
    preloadImage.addEventListener("error", handleReady);

    return () => {
      preloadImage.removeEventListener("load", handleReady);
      preloadImage.removeEventListener("error", handleReady);
    };
  }, [open, image]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-md p-0 bg-transparent border-none shadow-none overflow-visible [&>button]:hidden">
        {image && name && (
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-foreground/90 hover:bg-foreground rounded-full flex items-center justify-center z-50 shadow-lg"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5 text-background" />
            </button>

            <div className="w-full bg-card/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40">
                <img
                  src={image}
                  alt={name}
                  className={cn(
                    "absolute inset-0 w-full h-full object-contain transition-opacity duration-300",
                    isImageLoaded ? "opacity-100" : "opacity-0"
                  )}
                />

                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                    isImageLoaded ? "opacity-0" : "opacity-100"
                  )}
                >
                  <div className="h-10 w-10 rounded-full border-2 border-border border-t-primary animate-spin" />
                </div>
              </div>

              <p className="text-center mt-4 text-lg font-semibold text-foreground uppercase tracking-wider">
                {name}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductLightbox;
