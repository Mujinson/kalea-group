import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import heroIndoor from "@/assets/hero-indoor.jpg";

interface ProductCardProps {
  name: string;
  description: string;
  index: number;
}

const ComingSoonProductCard = ({ name, description, index }: ProductCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
    className="relative bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-2xl p-6 md:p-8 cursor-default"
  >
    {/* Coming Soon Badge */}
    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-foreground/15 text-foreground/80 text-xs font-medium px-3 py-1.5 rounded-full">
      <Clock size={12} />
      COMING SOON
    </div>

    <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground/70 mb-3 mt-2">
      {name}
    </h3>
    <p className="text-sm md:text-base text-foreground/50 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const Indoor = () => {
  const products = [
    {
      name: "BIOMAG FLOOR®",
      description: "Pavimento minerale in MgO ad alte prestazioni per interni.",
    },
    {
      name: "BIOWOOD FLOOR®",
      description: "Pavimento in CWC con anima naturale e stabilità superiore.",
    },
    {
      name: "KALEABASE®",
      description: "Sistemi di posa e supporto per pavimenti indoor.",
    },
    {
      name: "KALEABASE SILENCE®",
      description: "Soluzioni per comfort acustico e isolamento.",
    },
    {
      name: "BIOWALL®",
      description: "Sistema di rivestimento indoor.",
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

      {/* Hero Section */}
      <HeroSection
        title="Indoor Solutions"
        subtitle="Tecnologie avanzate per pavimenti e superfici indoor."
        backgroundImage={heroIndoor}
        overlayClassName="bg-gradient-to-b from-black/50 via-black/40 to-black/60"
      />

      {/* Products Grid Section */}
      <section className="relative py-20 md:py-32 bg-background">
        <div className="container-custom">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              I Nostri Prodotti Indoor
            </h2>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
              Una gamma completa di soluzioni per pavimenti e rivestimenti interni, 
              progettate per prestazioni superiori e design contemporaneo.
            </p>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <ComingSoonProductCard
                key={product.name}
                name={product.name}
                description={product.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Indoor;
