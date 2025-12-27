import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import heroOutdoor from "@/assets/hero-outdoor.jpg";
import { useTranslation } from "@/i18n/useTranslation";

interface ProductCardProps {
  name: string;
  description: string;
  link: string;
  index: number;
}

const PremiumProductCard = ({ name, description, link, index }: ProductCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
  >
    <Link 
      to={link}
      className="group relative block bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-2xl p-6 md:p-8 overflow-hidden transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/8 hover:shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm md:text-base text-foreground/60 leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
          <span>Scopri di più</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  </motion.div>
);

const Outdoor = () => {
  const { language } = useTranslation();
  
  const products = [
    {
      name: "KALEABASE OUT®",
      description: "Sistema di supporto per pavimentazioni outdoor.",
      link: `/${language}/kaleabase-out`,
    },
    {
      name: "KALEADECK®",
      description: "Pavimentazione outdoor per portici, terrazze e piscine.",
      link: `/${language}/kaleadeck`,
    },
    {
      name: "KALEACEILING®",
      description: "Rivestimenti per soffitti esterni.",
      link: `/${language}/kaleaceiling`,
    },
  ];

  return (
    <div className="relative bg-background">
      <title>Outdoor Solutions | Kalēa Surface System</title>
      <meta
        name="description"
        content="Materiali progettati per resistere all'esterno, senza compromessi. Design, durata e funzionalità per ogni ambiente outdoor."
      />

      <HeroSection
        title="Outdoor Solutions"
        subtitle="Materiali progettati per resistere all'esterno, senza compromessi."
        backgroundImage={heroOutdoor}
        overlayClassName="bg-gradient-to-b from-black/50 via-black/40 to-black/60"
      />

      <section className="relative py-20 md:py-32 bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              I Nostri Prodotti Outdoor
            </h2>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
              Soluzioni progettate per resistere alle condizioni esterne più impegnative,
              senza rinunciare all'eleganza del design.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {products.map((product, index) => (
              <PremiumProductCard
                key={product.name}
                name={product.name}
                description={product.description}
                link={product.link}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Outdoor;
