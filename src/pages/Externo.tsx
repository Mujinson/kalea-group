import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import AnimatedTitle from "@/components/AnimatedTitle";
import ProductLightbox from "@/components/ProductLightbox";
import { Droplets, Sun, Shield, Palette, Settings, CheckCircle, Clock, ChevronDown, Search } from "lucide-react";
import type { ExternoProduct } from "@/data/externoProducts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import SEOHead from "@/components/SEOHead";
import heroOutdoor from "@/assets/hero-outdoor.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import lifestylePool from "@/assets/externo/lifestyle-pool.webp";
import lifestyleTraditional from "@/assets/externo/lifestyle-traditional.webp";
import { externoTraditional, externoSkudo } from "@/data/externoProducts";
import CarouselWheel3D from "@/components/CarouselWheel3D";

const Externo = () => {
  const { language, t } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedProduct, setSelectedProduct] = useState<ExternoProduct | null>(null);
  
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

  const advantages = [
    { icon: Droplets, title: t("externo.adv1Title"), description: t("externo.adv1Desc") },
    { icon: Sun, title: t("externo.adv2Title"), description: t("externo.adv2Desc") },
    { icon: Shield, title: t("externo.adv3Title"), description: t("externo.adv3Desc") },
    { icon: Palette, title: t("externo.adv4Title"), description: t("externo.adv4Desc") },
    { icon: Settings, title: t("externo.adv5Title"), description: t("externo.adv5Desc") },
    { icon: CheckCircle, title: t("externo.adv6Title"), description: t("externo.adv6Desc") },
  ];

  const applications = [
    t("externo.app1"),
    t("externo.app2"),
    t("externo.app3"),
    t("externo.app4"),
    t("externo.app5"),
    t("externo.app6"),
  ];

  return (
    <>
      <div className="relative bg-background">
      <SEOHead
        title={language === 'it' ? "EXTERNO® — Decking per Esterni in MgO | Kalēa®" :
               language === 'en' ? "EXTERNO® — Outdoor MgO Decking | Kalēa®" :
               language === 'de' ? "EXTERNO® — MgO-Terrassendielen für Außen | Kalēa®" :
               "EXTERNO® — Terrasse Extérieure en MgO | Kalēa®"}
        description={language === 'it' ? "EXTERNO® di Kalēa®: decking in MgO per esterni, impermeabile, resistente a UV e gelo. Zero manutenzione, aspetto legno naturale." :
                     language === 'en' ? "EXTERNO® by Kalēa®: outdoor MgO decking, waterproof, UV and frost resistant. Zero maintenance, natural wood look." :
                     language === 'de' ? "EXTERNO® von Kalēa®: MgO-Terrassendielen für Außen, wasserdicht, UV- und frostbeständig. Wartungsfrei." :
                     "EXTERNO® par Kalēa® : terrasse en MgO pour extérieurs, imperméable, résistant UV et gel. Zéro entretien."}
        keywords="decking esterno, decking MgO, pavimento esterno impermeabile, decking senza manutenzione, terrazza pavimento, decking resistente gelo, pavimento esterno effetto legno"
      />
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ 
            scale: heroScale,
            borderRadius: heroBorderRadius,
          }}
        >
          <motion.img 
            src={heroOutdoor} 
            alt="EXTERNO" 
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
                text="EXTERNO"
                suffix={<sup className="text-2xl md:text-3xl">®</sup>}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                {t("externo.heroSubtitle")}
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
      </section>

      {/* 3D Carousels */}
      <CarouselWheel3D
        title="Externo Traditional"
        planks={externoTraditional.products.map(p => ({ id: p.id, name: p.name, image: p.image }))}
        link="/externo"
      />
      <CarouselWheel3D
        title="Externo Skudo"
        planks={externoSkudo.products.map(p => ({ id: p.id, name: p.name, image: p.image }))}
        link="/externo"
        direction={-1}
      />

      {/* Lifestyle Gallery */}
      <section className="relative z-[1] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              {t("externo.lifestyleTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t("externo.lifestyleDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-2xl shadow-xl"
            >
              <img src={lifestylePool} alt="Externo bordo piscina con area lounge" className="w-full h-[300px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="overflow-hidden rounded-2xl shadow-xl"
            >
              <img src={lifestyleTraditional} alt="Externo Traditional posa su terrazza" className="w-full h-[300px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base text-muted-foreground/80 max-w-4xl mx-auto mt-10 text-center leading-relaxed"
          >
            {t("externo.lifestyleFooter")}
          </motion.p>
        </div>
      </section>

      {/* Finiture Traditional Section */}
      <section className="relative z-[1] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              {t("externo.traditionalTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externo.traditionalSubtitle")}
            </p>
            <p className="text-base text-muted-foreground/80 max-w-3xl mx-auto mt-4">
              {t("externo.traditionalDesc")}
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {externoTraditional.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group text-center cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto">
                  <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <button className="absolute -top-1 -right-1 md:top-0 md:right-0 w-8 h-8 md:w-10 md:h-10 bg-foreground/60 hover:bg-foreground/80 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-md" aria-label={`Visualizza ${product.name}`}>
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-background" />
                  </button>
                </div>
                <p className="mt-3 text-sm md:text-base font-medium text-foreground whitespace-nowrap">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.finish}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Finiture Skudo Section */}
      <section className="relative z-[1] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              {t("externo.skudoTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externo.skudoSubtitle")}
            </p>
            <p className="text-base text-muted-foreground/80 max-w-3xl mx-auto mt-4">
              {t("externo.skudoDesc")}
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {externoSkudo.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group text-center cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto">
                  <div className="w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <button className="absolute -top-1 -right-1 md:top-0 md:right-0 w-8 h-8 md:w-10 md:h-10 bg-foreground/60 hover:bg-foreground/80 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-md" aria-label={`Visualizza ${product.name}`}>
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-background" />
                  </button>
                </div>
                <p className="mt-3 text-sm md:text-base font-medium text-foreground whitespace-nowrap">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.finish}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perché sceglierlo Section */}
      <section className="relative z-[1] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              {t("externo.whyTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externo.whySubtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Technical Section */}
      <section className="relative z-[2] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t("externo.specsTitle")}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto rounded-2xl p-8 bg-card-surface"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <ul className="space-y-4 text-white font-medium">
              {[t("externo.spec1"), t("externo.spec2"), t("externo.spec3"), t("externo.spec4"), t("externo.spec5")].map((spec) => (
                <li key={spec} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="relative z-[3] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t("externo.appsTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("externo.appsSubtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {applications.map((app, index) => (
              <motion.div
                key={app}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-foreground/5 rounded-xl p-4 text-center"
              >
                <span className="text-foreground/80 font-medium">{app}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Contatti */}
      <section className="relative z-[4] py-20 md:py-32 overflow-hidden bg-background">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgCtaCollabora})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">
              {t("externo.ctaTitle")}
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white font-medium">
              {t("externo.ctaDesc")}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to={`/${language}/contatti`}>{t("externo.ctaButton")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>

    <ProductLightbox
      open={!!selectedProduct}
      image={selectedProduct?.image}
      name={selectedProduct?.name}
      onOpenChange={(open) => {
        if (!open) setSelectedProduct(null);
      }}
    />
    </>
  );
};

export default Externo;
