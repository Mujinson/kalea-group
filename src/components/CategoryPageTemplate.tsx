import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import logo from "@/assets/logo-new.png";

interface SubCategory {
  title: string;
  description: string;
  icon: React.ElementType;
}

interface CategoryPageProps {
  heroImage: string;
  title: string;
  subtitle: string;
  introTitle: string;
  introText: string[];
  subcategories: SubCategory[];
  ctaText?: string;
}

const CategoryPageTemplate = ({
  heroImage,
  title,
  subtitle,
  introTitle,
  introText,
  subcategories,
  ctaText = "Richiedere una Consulenza",
}: CategoryPageProps) => {
  const { language } = useTranslation();

  return (
    <div className="relative bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm tracking-[0.3em] uppercase text-white/60 font-medium mb-4"
          >
            KALĒA® — LUXURY SUPPLY HUB
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-xl text-white/80 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              {introTitle}
            </h2>
            {introText.map((paragraph, i) => (
              <p key={i} className="text-base md:text-lg text-foreground/70 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Subcategories Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Le Nostre Soluzioni
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {subcategories.map((sub, i) => (
              <motion.div
                key={sub.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0, 0, 0, 0.15)" }}
                className="bg-card rounded-2xl p-6 md:p-8 border border-border"
              >
                <sub.icon className="w-10 h-10 text-foreground/60 mb-4" strokeWidth={1.5} />
                <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">{sub.title}</h3>
                <p className="text-sm md:text-base text-foreground/60 leading-relaxed">{sub.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4 flex flex-wrap items-center justify-center gap-3">
              <span>Collabora con</span>
              <img src={logo} alt="Kalēa®" className="inline-block h-[1.2em] w-auto" style={{ verticalAlign: 'middle', transform: 'translateY(0.02em)' }} />
            </h2>
            <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
              Consulenza tecnica dedicata e supporto completo per il tuo progetto.
            </p>
            <Link
              to={`/${language}/contatti`}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background text-sm font-medium rounded-xl px-10 py-3.5 hover:opacity-90 transition-all duration-150"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPageTemplate;
