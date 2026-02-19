import { motion } from "framer-motion";
import HomeHero from "@/components/HomeHero";

import IndoorOutdoorSection from "@/components/IndoorOutdoorSection";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Clock, Wrench } from "lucide-react";
import logo from "@/assets/logo-new.png";

import bgSustainabilityForest from "@/assets/bg-sustainability-forest.jpg";
import bgSustainabilityDurability from "@/assets/bg-sustainability-durability.jpg";
import bgSustainabilityMaintenance from "@/assets/bg-sustainability-maintenance.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import bgManifesto from "@/assets/bg-manifesto.jpg";

// Category images
import categorySuperfici from "@/assets/category-superfici.jpg";
import categoryAperture from "@/assets/category-aperture.jpg";
import categoryBagno from "@/assets/category-bagno.jpg";
import categoryTecnologia from "@/assets/category-tecnologia.jpg";
import categoryOutdoor from "@/assets/category-outdoor-luxury.jpg";

import { useTranslation } from "@/i18n/useTranslation";
interface CategoryData {
  id: string;
  title: string;
  image: string;
  cta: string;
}

const CategoryCard = ({ category, index, language }: { category: CategoryData; index: number; language: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -8, boxShadow: "0 24px 64px rgba(0, 0, 0, 0.2)" }}
    className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-[4/5]"
  >
    <img 
      src={category.image} 
      alt={category.title} 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-8">
      <h3 className="text-white font-heading font-bold text-xl md:text-2xl lg:text-3xl mb-3">{category.title}</h3>
      <div className="inline-flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all">
        {category.cta}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </motion.div>
);

const Home = () => {
  const { t, language } = useTranslation();

  const categories: CategoryData[] = [
    { id: 'superfici', title: 'Superfici', image: categorySuperfici, cta: 'Scopri' },
    { id: 'aperture', title: 'Sistemi di Accesso', image: categoryAperture, cta: 'Scopri' },
    { id: 'bagno', title: 'Bagno & Wellness', image: categoryBagno, cta: 'Scopri' },
    { id: 'tecnologia', title: 'Tecnologia', image: categoryTecnologia, cta: 'Scopri' },
    { id: 'outdoor', title: 'Outdoor', image: categoryOutdoor, cta: 'Scopri' },
  ];

  const sustainability = [
    { icon: Leaf, title: t('home.sustainability.impact.title'), description: t('home.sustainability.impact.description'), bg: bgSustainabilityForest, link: `/${language}/sostenibilita/impatto-ambientale` },
    { icon: Clock, title: t('home.sustainability.durability.title'), description: t('home.sustainability.durability.description'), bg: bgSustainabilityDurability, link: `/${language}/sostenibilita/lunga-durata` },
    { icon: Wrench, title: t('home.sustainability.maintenance.title'), description: t('home.sustainability.maintenance.description'), bg: bgSustainabilityMaintenance, link: `/${language}/sostenibilita/manutenzione` },
  ];

  return (
    <div className="relative bg-background">
      {/* Hero Section */}
      <HomeHero />

      {/* Indoor / Outdoor Section */}
      <IndoorOutdoorSection />




      {/* 5 Macro-Categories */}
      <section className="relative bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Le Nostre Aree
            </h2>
            <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto">
              Cinque macro-aree per una fornitura completa e coordinata
            </p>
          </motion.div>

          {/* Grid: all 5 cards same size */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} language={language} />
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto Section - with background image */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0">
          <img 
            src={bgManifesto} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8"
            >
              <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-white/50 font-medium">
                Hub di Fornitura per l'Architettura d'Interni
              </p>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
                Selezione curata.<br />Eccellenza tecnica.<br />Fornitura integrata.
              </h2>

              <div className="h-px w-16 mx-auto bg-white/30" />

              <div className="space-y-4 text-base md:text-lg text-white/80 font-light leading-relaxed">
                <p>Kalēa® nasce dalla convinzione che ogni progetto meriti un interlocutore unico, competente e affidabile.</p>
                <p>Non un catalogo infinito, ma una selezione rigorosa di materiali e soluzioni che rispondono a criteri precisi di qualità, innovazione e sostenibilità.</p>
              </div>

              <div className="pt-4 md:pt-6">
                <p className="text-sm md:text-base lg:text-lg tracking-[0.25em] text-white font-medium uppercase">
                  KALĒA® — LUXURY SUPPLY HUB
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Perché Kalēa - Value Proposition */}
      <section className="relative py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Perché Kalēa®
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { num: '01', title: 'Selezione Curata', desc: 'Non vendiamo tutto. Selezioniamo solo materiali e soluzioni che superano i nostri standard di qualità, estetica e prestazione tecnica.' },
              { num: '02', title: 'Eccellenza Tecnica', desc: 'Ogni prodotto è accompagnato da documentazione completa, supporto alla progettazione e consulenza tecnica dedicata.' },
              { num: '03', title: 'Fornitura Integrata', desc: 'Un unico interlocutore per superfici, sistemi di accesso, bagno, tecnologia e outdoor. Coordinamento completo per il tuo progetto.' },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center md:text-left"
              >
                <span className="text-4xl md:text-5xl font-heading font-bold text-foreground/10 block mb-3">{item.num}</span>
                <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-foreground/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sostenibilità */}
      <section className="relative py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {sustainability.map((item, index) => (
                <Link key={item.title} to={item.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)" }}
                    className="relative aspect-[4/5] rounded-2xl overflow-hidden group"
                  >
                    <img src={item.bg} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/10 to-foreground/70" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 sm:p-4 md:p-6">
                      <item.icon className="w-8 h-8 md:w-12 md:h-12 text-white mb-2 md:mb-3" strokeWidth={1.5} />
                      <h3 className="text-sm md:text-xl lg:text-2xl font-heading font-semibold text-white mb-1 md:mb-2 leading-tight">{item.title}</h3>
                      <p className="text-xs md:text-sm text-white font-medium max-w-xs line-clamp-2">{item.description}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="relative py-16 md:py-24 bg-background">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgCtaCollabora})` }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)' }} />
        
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 text-center">
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
                <span>Collabora con</span>
                <img src={logo} alt="Kalēa®" className="inline-block h-[1.2em] w-auto" style={{ filter: 'brightness(0) invert(1)', verticalAlign: 'middle', transform: 'translateY(0.02em)' }} />
              </h2>
              <p className="text-base mb-10 max-w-2xl mx-auto text-white/90" style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}>
                Consulenza tecnica, campionature dedicate e un unico punto di riferimento per la fornitura completa dei tuoi progetti di architettura d'interni.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to={`/${language}/contatti`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#111] text-button rounded-xl px-10 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
                >
                  Richiedi Consulenza
                </Link>
                <Link 
                  to={`/${language}/diventa-partner`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#111] text-button rounded-xl px-10 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
                >
                  Diventa Partner
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
