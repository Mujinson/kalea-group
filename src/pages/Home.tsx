import { motion } from "framer-motion";
import { useEffect } from "react";
import DualCarouselSection from "@/components/DualCarouselSection";
import HomeHero from "@/components/HomeHero";
import DualCarousel3D from "@/components/DualCarousel3D";
import IndoorOutdoorSection from "@/components/IndoorOutdoorSection";
import SEOHead from "@/components/SEOHead";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Heart, ShoppingCart, Leaf, Clock, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-new.png";

import bgManifesto from "@/assets/bg-manifesto.jpg";
import bgSustainabilityForest from "@/assets/bg-sustainability-forest.jpg";
import bgSustainabilityDurability from "@/assets/bg-sustainability-durability.jpg";
import bgSustainabilityMaintenance from "@/assets/bg-sustainability-maintenance.jpg";
import bgApplicationResidential from "@/assets/bg-application-residential.jpg";
import bgApplicationHospitality from "@/assets/bg-application-hospitality.jpg";
import bgApplicationRetail from "@/assets/bg-application-retail.jpg";
import bgApplicationOffices from "@/assets/bg-application-offices.jpg";
import bgApplicationHealthcare from "@/assets/bg-application-healthcare.jpg";
import bgApplicationCommercial from "@/assets/bg-application-commercial.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import productBiomagFloor from "@/assets/product-biocore-floor-new.jpg";
import productBiocoreFloor from "@/assets/hero-biomag-floor-new.webp";
import heroEdgeline from "@/assets/hero-edgeline.jpg";
import productBiowall from "@/assets/product-biowall-interior.jpg";
import productKaleaElements from "@/assets/product-kalea-elements.png";
import productKaleabase from "@/assets/product-kaleabase-underlays.jpg";
import productKaleadeck from "@/assets/product-kaleadeck.jpg";
import productKaleaceiling from "@/assets/product-kaleaceiling-new.jpg";
import { useTranslation } from "@/i18n/useTranslation";

const Home = () => {
  const { t, language } = useTranslation();

  // Indoor products organized by rows:
  // Row 1: BIOMAG FLOOR + BIOWOOD FLOOR
  const indoorRow1 = [
    {
      title: t('home.stonecore.title'),
      description: t('home.stonecore.description'),
      link: `/${language}/biomag-floor`,
      comingSoon: false,
      image: productBiomagFloor,
    },
    {
      title: t('home.biocore.title'),
      description: t('home.biocore.description'),
      link: `/${language}/biocore-floor`,
      comingSoon: false,
      image: productBiocoreFloor,
    },
  ];

  // Row 2: EDGELINE + KALEABASE
  const indoorRow2 = [
    {
      title: t('home.edgeline.title'),
      description: t('home.edgeline.description'),
      link: `/${language}/edgeline`,
      comingSoon: false,
      image: heroEdgeline,
    },
    {
      title: t('home.kaleabase.title'),
      description: t('home.kaleabase.description'),
      link: `/${language}/kaleabase`,
      comingSoon: false,
      image: productKaleabase,
    },
  ];

  // Row 3: BIOWALL (centered)
  const indoorRow3 = [
    {
      title: t('home.onewall.title'),
      description: t('home.onewall.description'),
      link: `/${language}/biowall`,
      comingSoon: true,
      comingSoonLabel: t('home.onewall.comingSoonLabel'),
      image: productBiowall,
    },
  ];

  const outdoorProducts = [
    {
      title: t('home.kaleaElements.title'),
      description: t('home.kaleaElements.description'),
      link: `/${language}/kalea-elements`,
      comingSoon: true,
      comingSoonLabel: t('home.onewall.comingSoonLabel'),
      image: productKaleaElements,
    },
    {
      title: t('home.kaleadeck.title'),
      description: t('home.kaleadeck.description'),
      link: `/${language}/kaleadeck`,
      comingSoon: true,
      comingSoonLabel: t('home.onewall.comingSoonLabel'),
      image: productKaleadeck,
    },
    {
      title: t('home.kaleaceiling.title'),
      description: t('home.kaleaceiling.description'),
      link: `/${language}/kaleaceiling`,
      comingSoon: true,
      comingSoonLabel: t('home.onewall.comingSoonLabel'),
      image: productKaleaceiling,
    },
  ];

  const applications = [
    { icon: HomeIcon, title: t('home.applications.residential.title'), description: t('home.applications.residential.description'), bg: bgApplicationResidential },
    { icon: Building2, title: t('home.applications.hospitality.title'), description: t('home.applications.hospitality.description'), bg: bgApplicationHospitality },
    { icon: ShoppingBag, title: t('home.applications.retail.title'), description: t('home.applications.retail.description'), bg: bgApplicationRetail },
    { icon: Briefcase, title: t('home.applications.offices.title'), description: t('home.applications.offices.description'), bg: bgApplicationOffices },
    { icon: Heart, title: t('home.applications.healthcare.title'), description: t('home.applications.healthcare.description'), bg: bgApplicationHealthcare },
    { icon: ShoppingCart, title: t('home.applications.commercial.title'), description: t('home.applications.commercial.description'), bg: bgApplicationCommercial },
  ];

  const sustainability = [
    { icon: Leaf, title: t('home.sustainability.impact.title'), description: t('home.sustainability.impact.description'), bg: bgSustainabilityForest, link: `/${language}/sostenibilita/impatto-ambientale` },
    { icon: Clock, title: t('home.sustainability.durability.title'), description: t('home.sustainability.durability.description'), bg: bgSustainabilityDurability, link: `/${language}/sostenibilita/lunga-durata` },
    { icon: Wrench, title: t('home.sustainability.maintenance.title'), description: t('home.sustainability.maintenance.description'), bg: bgSustainabilityMaintenance, link: `/${language}/sostenibilita/manutenzione` },
  ];

  return (
    <div className="relative bg-background">
      <SEOHead
        title={language === 'it' ? "Pavimenti Flottanti in MgO e Fibra Naturale | Kalēa® Surface System" :
               language === 'en' ? "Floating Floors in MgO & Natural Fiber | Kalēa® Surface System" :
               language === 'de' ? "Schwimmende Böden aus MgO & Naturfaser | Kalēa® Surface System" :
               "Sols Flottants en MgO & Fibre Naturelle | Kalēa® Surface System"}
        description={language === 'it' ? "Pavimenti flottanti di nuova generazione in ossido di magnesio e fibra naturale. Waterproof, ignifughi, click-clack senza colla. Ideali per ristrutturazioni, abitazioni e spazi commerciali. Progettati in Italia." :
                     language === 'en' ? "Next-generation floating floors in magnesium oxide and natural fiber. Waterproof, fireproof, click-lock installation. Ideal for renovations, homes and commercial spaces. Designed in Italy." :
                     language === 'de' ? "Schwimmende Böden der neuen Generation aus Magnesiumoxid und Naturfaser. Wasserdicht, feuerfest, Klick-Verlegung. Ideal für Renovierungen, Wohnungen und Gewerbeflächen. In Italien entworfen." :
                     "Sols flottants de nouvelle génération en oxyde de magnésium et fibre naturelle. Étanches, ignifuges, pose clipsable. Idéaux pour rénovations, habitations et espaces commerciaux. Conçus en Italie."}
        keywords={language === 'it' ? "pavimenti flottanti, pavimento flottante, pavimenti in MgO, pavimenti click clack, pavimento senza colla, pavimenti waterproof, pavimenti ignifughi, pavimento galleggiante, pavimento sopraelevato, pavimento flottante prezzi, ristrutturazione pavimenti, pavimento per ristrutturazione, pavimenti innovativi, pavimenti di design, pavimenti sostenibili, pavimento ecologico, parquet flottante, laminato flottante, SPC pavimento, LVT pavimento" :
                  language === 'en' ? "floating floors, floating floor, MgO flooring, click-lock flooring, glueless flooring, waterproof flooring, fireproof flooring, raised flooring, innovative flooring, sustainable flooring, eco-friendly floor, design flooring" :
                  language === 'de' ? "schwimmender Boden, Klickboden, MgO Boden, wasserdichter Boden, feuerfester Boden, nachhaltiger Bodenbelag, Design Bodenbelag, ökologischer Boden" :
                  "sol flottant, parquet flottant, sol clipsable, sol MgO, sol étanche, sol ignifuge, revêtement de sol design, sol écologique"}
        ogType="website"
      />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Kalēa® Surface System",
            url: "https://www.kalea.space",
            logo: "https://www.kalea.space/favicon-k.png",
            description: "Pavimenti flottanti di nuova generazione in ossido di magnesio e fibra naturale. Progettati in Italia.",
            sameAs: [],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              availableLanguage: ["Italian", "English", "German", "French"],
            },
            makesOffer: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Product",
                  name: "BIOMAG FLOOR®",
                  description: "Pavimento flottante in ossido di magnesio, waterproof e ignifugo con installazione click-clack.",
                  category: "Pavimenti flottanti",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Product",
                  name: "BIOCORE FLOOR®",
                  description: "Pavimento flottante in fibra naturale e carbonio, ecologico e biodegradabile.",
                  category: "Pavimenti flottanti",
                },
              },
            ],
          }),
        }}
      />

      {/* Hero Section */}
      <HomeHero />

      {/* Indoor/Outdoor Section */}
      <IndoorOutdoorSection />

      {/* 3D Dual Carousel Collection - BIOMAG + BIOCORE side by side */}
      <section className="relative min-h-screen bg-background">
        <DualCarousel3D />
      </section>

      {/* Products Section */}
      <section className="relative min-h-screen bg-background py-10 md:py-16 overflow-hidden">
        <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-8 lg:px-12">
          <div className="text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-foreground/85 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto mb-8 md:mb-12"
            >
              {t('hero.home.systemDescription')}
            </motion.p>

            {/* Indoor Products */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4 md:mb-6"
            >
              {t('home.productsSection.indoor')}
            </motion.h3>
            
            {/* Row 1: BIOMAG FLOOR + BIOWOOD FLOOR */}
            <div className="grid grid-cols-2 gap-3 md:gap-5 max-w-4xl mx-auto mb-3 md:mb-5">
              {indoorRow1.map((product, index) => (
                <Link key={product.title} to={product.link} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 16px 48px rgba(0, 0, 0, 0.25)" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer h-full min-h-[200px] sm:min-h-[220px] md:min-h-[250px] group"
                  >
                    <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-4 md:p-5">
                      <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base tracking-wider mb-1">{product.title.toUpperCase()}</h3>
                      <p className="text-white/90 text-[10px] sm:text-xs leading-relaxed line-clamp-2">{product.description}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
            
            {/* Row 2: EDGELINE + KALEABASE */}
            <div className="grid grid-cols-2 gap-3 md:gap-5 max-w-4xl mx-auto mb-3 md:mb-5">
              {indoorRow2.map((product, index) => (
                <Link key={product.title} to={product.link} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 16px 48px rgba(0, 0, 0, 0.25)" }}
                    transition={{ duration: 0.5, delay: (index + 2) * 0.1 }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer h-full min-h-[200px] sm:min-h-[220px] md:min-h-[250px] group"
                  >
                    <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-4 md:p-5">
                      <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base tracking-wider mb-1">{product.title.toUpperCase()}</h3>
                      <p className="text-white/90 text-[10px] sm:text-xs leading-relaxed line-clamp-2">{product.description}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
            
            {/* Row 3: BIOWALL (centered) */}
            <div className="flex justify-center gap-3 md:gap-5 max-w-4xl mx-auto mb-10 md:mb-14">
              {indoorRow3.map((product, index) => (
                <motion.div
                  key={product.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative rounded-2xl overflow-hidden cursor-default min-h-[200px] sm:min-h-[220px] md:min-h-[250px] group w-[calc(50%-6px)]"
                >
                  <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                  <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-4 md:p-5">
                    <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white text-[9px] font-medium px-2 py-0.5 rounded-full">
                      {product.comingSoonLabel || "Novità in arrivo"}
                    </div>
                    <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base tracking-wider mb-1">{product.title.toUpperCase()}</h3>
                    <p className="text-white/80 text-[10px] sm:text-xs leading-relaxed line-clamp-2">{product.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Outdoor Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 md:mb-6"
            >
              <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                {t('home.productsSection.outdoor')}
              </h3>
              <p className="text-sm md:text-base text-foreground/60 font-medium">
                Novità in arrivo
              </p>
            </motion.div>
            
            {/* Outdoor Cards Container */}
            <div className="relative max-w-4xl mx-auto">

              {/* Row 1: 2 cards */}
              <div className="grid grid-cols-2 gap-3 md:gap-5 mb-3 md:mb-5">
                {outdoorProducts.slice(0, 2).map((product, index) => (
                  <motion.div
                    key={product.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative rounded-2xl overflow-hidden cursor-default min-h-[200px] sm:min-h-[220px] md:min-h-[250px] group"
                  >
                    <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-4 md:p-5">
                      <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base tracking-wider mb-1">{product.title}</h3>
                      <p className="text-white/80 text-[10px] sm:text-xs leading-relaxed line-clamp-2">{product.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Row 2: 1 card centered */}
              <div className="flex justify-center gap-3 md:gap-5">
                {outdoorProducts.slice(2).map((product, index) => (
                  <motion.div
                    key={product.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative rounded-2xl overflow-hidden cursor-default min-h-[200px] sm:min-h-[220px] md:min-h-[250px] group w-[calc(50%-6px)]"
                  >
                    <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-4 md:p-5">
                      <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base tracking-wider mb-1">{product.title}</h3>
                      <p className="text-white/80 text-[10px] sm:text-xs leading-relaxed line-clamp-2">{product.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Dual Carousel Section - BIOMAG + BIOCORE side by side */}
      <DualCarouselSection />

      {/* Applicazioni */}
      <section className="relative h-[100svh] bg-background">
        <div className="h-full flex flex-col px-6 md:px-12 lg:px-20 py-10 md:py-14">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              {t('home.applicationsTitle')}
            </h2>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
              {t('home.applicationsSubtitle')}
            </p>
          </motion.div>

          {/* Cards - 3 per row on desktop, 2 rows */}
          <div className="flex-1 min-h-0 grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto w-full md:max-h-[65vh] lg:max-h-none">
            {applications.map((app, index) => (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.25)",
                }}
                className="relative rounded-2xl overflow-hidden group"
              >
                <img
                  src={app.bg}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/10 to-foreground/75" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <app.icon className="w-10 h-10 md:w-12 md:h-12 text-white mb-3" strokeWidth={1.5} />
                  <h3 className="text-base md:text-lg lg:text-xl font-heading font-semibold text-white mb-1">
                    {app.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white font-medium hidden sm:block">
                    {app.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sostenibilità */}
      <section className="relative h-screen bg-background">
        <div className="h-full flex flex-col px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-10 md:py-14">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-8 md:mb-10"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              {t('home.sustainabilityTitle')}
            </h2>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
              {t('home.sustainabilitySubtitle')}
            </p>
          </motion.div>

          {/* Cards - mobile: stacked squares that always fit; md+: original 3 columns */}
          <div className="flex-1 min-h-0 md:flex md:items-center md:justify-center">
            <div className="h-full grid grid-rows-3 gap-4 max-w-6xl mx-auto w-full md:h-auto md:grid-rows-1 md:grid-cols-3 md:gap-6 lg:gap-8">
              {sustainability.map((item, index) => (
                <Link
                  key={item.title}
                  to={item.link}
                  className="h-full flex items-center justify-center md:block md:h-auto"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{
                      y: -6,
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
                    }}
                    className="relative h-full aspect-square rounded-2xl overflow-hidden group md:aspect-[4/5] md:h-auto md:w-full md:rounded-3xl"
                  >
                    <img
                      src={item.bg}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/10 to-foreground/70" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 sm:p-4 md:p-6">
                      <item.icon className="w-8 h-8 md:w-12 md:h-12 text-white mb-2 md:mb-3" strokeWidth={1.5} />
                      <h3 className="text-sm md:text-xl lg:text-2xl font-heading font-semibold text-white mb-1 md:mb-2 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs md:text-sm text-white font-medium max-w-xs line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="relative h-screen bg-background">
        <div className="h-full flex items-center justify-center">
          <div className="w-full px-6 md:px-12 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-3xl mx-auto text-center space-y-3 md:space-y-4"
            >
              <div className="space-y-2 md:space-y-3">
                <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line1')}
                </p>
                <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line2')}
                </p>
                <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line3')}
                </p>
                <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line4')}
                </p>
                <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 font-light tracking-wide leading-relaxed italic">
                  {t('hero.manifesto.line5')}
                </p>
              </div>

              <div className="h-px w-16 mx-auto bg-foreground/30 my-4" />

              <div className="space-y-2 text-sm md:text-base text-foreground/75 font-light leading-relaxed">
                <p>{t('hero.manifesto.problem1')}<br />{t('hero.manifesto.problem2')}</p>
                <p className="mt-3">{t('hero.manifesto.question1')}<br /><span className="italic">{t('hero.manifesto.question2')}</span></p>
                <p className="mt-3">{t('hero.manifesto.reflection1')}<br />{t('hero.manifesto.reflection2')}<br />{t('hero.manifesto.reflection3')}<br />{t('hero.manifesto.reflection4')}</p>
                <p className="mt-3">{t('hero.manifesto.value1')}<br />{t('hero.manifesto.value2')}<br />{t('hero.manifesto.value3')}<br />{t('hero.manifesto.value4')}</p>
                <p className="mt-3">{t('hero.manifesto.conclusion1')}<br />{t('hero.manifesto.conclusion2')}</p>
              </div>

              <div className="pt-5 md:pt-8 space-y-2">
                <p className="text-sm md:text-base lg:text-lg tracking-[0.25em] text-foreground font-medium uppercase">
                  KALĒA® — SURFACE SYSTEM®
                </p>
                <p className="text-sm md:text-base text-foreground/75 font-light">
                  {t('hero.manifesto.brandStatement')}
                </p>
                <p className="text-sm md:text-base text-foreground/75 font-light">
                  {t('hero.manifesto.brandStatement2')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="relative h-screen bg-background">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgCtaCollabora})` }}
        />
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)' 
          }}
        />
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 
                className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-6 flex flex-wrap items-center justify-center gap-3 text-white"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
                <span>{t('home.ctaTitleBefore')}</span>
                <img 
                  src={logo} 
                  alt="Kalēa®" 
                  className="inline-block h-[1.2em] w-auto"
                  style={{ 
                    filter: 'brightness(0) invert(1)',
                    verticalAlign: 'middle',
                    transform: 'translateY(0.02em)'
                  }}
                />
                <span>{t('home.ctaTitleAfter')}</span>
              </h2>
              <p 
                className="text-base mb-10 max-w-2xl mx-auto text-white/90"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
                {t('home.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to={`/${language}/contatti`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#111] text-button rounded-xl px-10 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
                >
                  {t('home.ctaButton1')}
                </Link>
                <Link 
                  to={`/${language}/diventa-partner`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#111] text-button rounded-xl px-10 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
                >
                  {t('home.ctaButton2')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
