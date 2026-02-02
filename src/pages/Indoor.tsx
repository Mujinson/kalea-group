import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import AnimatedTitle from "@/components/AnimatedTitle";
import heroIndoor from "@/assets/hero-indoor-wood.jpg";
import productBiomagFloor from "@/assets/product-biomag-floor-new.jpg";
import productBiocoreFloor from "@/assets/product-biocore-floor-new.jpg";
import productKaleabase from "@/assets/product-kaleabase-underlays.jpg";
import heroEdgeline from "@/assets/hero-edgeline.jpg";
import productBiowall from "@/assets/product-biowall.jpg";

interface Product {
  name: string;
  description: string;
  image: string;
  link: string;
}

const Indoor = () => {
  const { language } = useTranslation();
  const isMobile = useIsMobile();
  
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.96] : [1, 0.88]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "16px" : "28px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.3], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -40 : -80]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);

  const products: Product[] = [
    {
      name: "BIOMAG FLOOR®",
      description: "Pavimento minerale in MgO ad alte prestazioni per interni.",
      image: productBiomagFloor,
      link: `/${language}/biomag-floor`,
    },
    {
      name: "BIOCORE FLOOR®",
      description: "Pavimento in CWC con anima naturale e stabilità superiore.",
      image: productBiocoreFloor,
      link: `/${language}/biocore-floor`,
    },
    {
      name: "KALEABASE®",
      description: "Sistemi modulari di sottopavimento per ogni esigenza.",
      image: productKaleabase,
      link: `/${language}/kaleabase`,
    },
    {
      name: "EDGELINE®",
      description: "Profili e battiscopa per finiture architettoniche.",
      image: heroEdgeline,
      link: `/${language}/edgeline`,
    },
    {
      name: "BIOWALL®",
      description: "Sistema di rivestimento indoor.",
      image: productBiowall,
      link: `/${language}/biowall`,
    },
  ];

  return (
    <div className="relative bg-background">
      {/* SEO Meta */}
      <title>Indoor Solutions | Kalēa Surface System</title>
      <meta
        name="description"
        content="Tecnologie avanzate per pavimenti e superfici indoor. Soluzioni ad alte prestazioni per abitazioni e spazi commerciali."
      />

      {/* Hero Section - Fixed background */}
      <div ref={heroRef} className="fixed inset-0 z-[0]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: heroScale,
            borderRadius: heroBorderRadius,
          }}
        >
          <motion.img 
            src={heroIndoor} 
            alt="Indoor Solutions" 
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ 
              y: heroImageY,
              scale: 1.1,
            }}
            initial={{ filter: "blur(10px)", scale: 1.15 }}
            animate={{ filter: "blur(0px)", scale: 1.1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div 
            style={{ opacity: heroContentOpacity, y: heroContentY }} 
            className="container-custom text-center will-change-transform"
          >
            <div className="max-w-4xl mx-auto">
              <AnimatedTitle
                text="Indoor Solutions"
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                Tecnologie avanzate per pavimenti e superfici indoor.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{ opacity: heroContentOpacity }}
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center"
                >
                  <ChevronDown className="w-6 h-6 text-white/60" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Spacer to push content below fixed hero */}
      <div className="h-screen" />

      {/* Products Grid Section */}
      <section className="relative z-[1] bg-background pt-20 md:pt-32 pb-8">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Linea Indoor
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluzioni complete per pavimenti e rivestimenti interni di alta qualità.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={index === products.length - 1 && products.length % 2 !== 0 ? "md:col-span-2 md:max-w-[50%] md:mx-auto" : ""}
              >
                <Link 
                  to={product.link}
                  className="group relative block h-[320px] md:h-[380px] rounded-2xl overflow-hidden"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 transition-all duration-500 group-hover:from-black/90 group-hover:via-black/50" />
                  
                  {/* Content - fixed height layout for alignment */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <div className="min-h-[120px] flex flex-col justify-start">
                      <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2 tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-white/80 text-base md:text-lg mb-4">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-white font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <span>Scopri di più</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Indoor;
