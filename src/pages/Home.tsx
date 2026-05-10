import { motion } from "framer-motion";
import { useEffect } from "react";

import HomeHero from "@/components/HomeHero";

import IndoorOutdoorSection from "@/components/IndoorOutdoorSection";
import SEOHead from "@/components/SEOHead";
import { Leaf, Clock, Wrench, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Heart, ShoppingCart } from "lucide-react";
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
import valueContinuousSystem from "@/assets/value-continuous-system.jpg";
import valueSeamlessMaterial from "@/assets/value-seamless-material.jpg";
import valueTimelessAesthetic from "@/assets/value-timeless-aesthetic.jpg";
import valueSimpleTechnology from "@/assets/value-simple-technology.jpg";
import valueServiceInstallation from "@/assets/value-service-installation.jpg";
import { useTranslation } from "@/i18n/useTranslation";

const Home = () => {
  const { t, language } = useTranslation();



  const applications = [
    { icon: HomeIcon, title: t('home.applications.residential.title'), description: t('home.applications.residential.description'), bg: bgApplicationResidential },
    { icon: Building2, title: t('home.applications.hospitality.title'), description: t('home.applications.hospitality.description'), bg: bgApplicationHospitality },
    { icon: ShoppingBag, title: t('home.applications.retail.title'), description: t('home.applications.retail.description'), bg: bgApplicationRetail },
    { icon: Briefcase, title: t('home.applications.offices.title'), description: t('home.applications.offices.description'), bg: bgApplicationOffices },
    { icon: Heart, title: t('home.applications.healthcare.title'), description: t('home.applications.healthcare.description'), bg: bgApplicationHealthcare },
    { icon: ShoppingCart, title: t('home.applications.commercial.title'), description: t('home.applications.commercial.description'), bg: bgApplicationCommercial },
  ];

  const sustainability = [
    { icon: Leaf, title: t('home.sustainability.impact.title'), description: t('home.sustainability.impact.description'), bg: bgSustainabilityForest, video: '/videos/sustainability-forest.mp4', link: `/${language}/sostenibilita/impatto-ambientale` },
    { icon: Clock, title: t('home.sustainability.durability.title'), description: t('home.sustainability.durability.description'), bg: bgSustainabilityDurability, video: '/videos/sustainability-durability.mp4', link: `/${language}/sostenibilita/lunga-durata` },
    { icon: Wrench, title: t('home.sustainability.maintenance.title'), description: t('home.sustainability.maintenance.description'), bg: bgSustainabilityMaintenance, video: '/videos/sustainability-maintenance.mp4', link: `/${language}/sostenibilita/manutenzione` },
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
                  name: "Hypermatt",
                  description: "Collezione SPC ultra-matte con finitura laser. Realismo estremo del legno e del cemento.",
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

      {/* Chi Siamo — Manifesto del brand (paper-write reveal) */}
      <ChiSiamoManifesto language={language} nextSectionId="chi-siamo-next" />

      <div id="chi-siamo-next" className="scroll-mt-20" />

      {/* Applicazioni */}
      <section className="relative min-h-screen bg-background flex items-center">
        <div className="w-full flex flex-col px-6 md:px-12 lg:px-20 py-10">
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
                className="relative rounded-2xl overflow-hidden group min-h-[180px] sm:min-h-[220px] md:min-h-[250px]"
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

      <section className="relative md:min-h-screen bg-background flex items-center">
        <div className="w-full flex flex-col px-4 sm:px-6 md:px-12 lg:px-20 py-10 md:py-16">
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
            <div className="grid grid-cols-1 gap-4 max-w-6xl mx-auto w-full md:grid-cols-3 md:gap-6 lg:gap-8">
              {sustainability.map((item, index) => (
                <Link
                  key={item.title}
                  to={item.link}
                  className="block"
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
                    className="relative w-full rounded-2xl overflow-hidden group md:rounded-3xl min-h-[180px] sm:min-h-[220px] md:min-h-[250px] md:aspect-square"
                  >
                    {item.video ? (
                      <div className="absolute inset-[-10%] overflow-hidden">
                        <video
                          src={item.video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <img
                        src={item.bg}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
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

      {/* Manifesto — Philosophy & System */}
      <section className="relative bg-background overflow-hidden">
        <div className="w-full py-20 md:py-28 px-6 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            {/* Flowing prose paragraphs */}
            <div className="space-y-8 md:space-y-10 text-center">
              {[
                t('hero.manifesto.para1'),
                t('hero.manifesto.para2'),
                t('hero.manifesto.para3'),
              ].map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-body text-lg md:text-xl text-foreground/85 font-normal leading-relaxed"
                >
                  {para}
                </motion.p>
              ))}
            </div>

            {/* Animated divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="h-px w-24 mx-auto bg-foreground/30 my-14 md:my-20 origin-center"
            />

            {/* Value propositions — 5 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-14 md:mb-20">
              {[
                { text: t('hero.manifesto.value1'), image: valueContinuousSystem },
                { text: t('hero.manifesto.value2'), image: valueSeamlessMaterial },
                { text: t('hero.manifesto.value3'), image: valueTimelessAesthetic },
                { text: t('hero.manifesto.value4'), image: valueSimpleTechnology },
                { text: t('hero.manifesto.value5'), image: valueServiceInstallation },
              ].map((item, i, arr) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                  className={`group relative overflow-hidden rounded-2xl min-h-[200px] md:min-h-[220px] cursor-default ${
                    arr.length % 2 === 1 && i === arr.length - 1 ? "md:col-span-2" : ""
                  }`}
                >
                  <img
                    src={item.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/65" />
                  <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end h-full">
                    <div className="text-white/30 text-4xl font-heading font-bold mb-2">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <p className="text-base md:text-lg text-white font-medium leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Conclusion + Brand signature */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-center space-y-10"
            >
              <p className="font-body text-lg md:text-xl text-foreground/85 font-normal leading-relaxed">
                {t('hero.manifesto.conclusion')}
              </p>

              <div className="space-y-3 pt-4">
                <p className="text-sm md:text-base lg:text-lg tracking-[0.3em] text-foreground font-medium uppercase">
                  KALĒA® — SURFACE SYSTEM®
                </p>
                <div className="h-px w-12 mx-auto bg-foreground/20" />
                <p className="text-sm md:text-base text-foreground/60 font-light">
                  {t('hero.manifesto.brandStatement')}
                </p>
                <p className="text-sm md:text-base text-foreground/60 font-light">
                  {t('hero.manifesto.brandStatement2')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="relative bg-background">
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
        
        <div className="relative z-10 py-12 md:py-16 flex flex-col items-center justify-between min-h-[80vh] gap-10">
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
                className="text-base max-w-2xl mx-auto text-white/90"
                style={{ textShadow: '0px 4px 16px rgba(0, 0, 0, 0.55)' }}
              >
                {t('home.ctaSubtitle')}
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="container-custom flex flex-col sm:flex-row gap-4 justify-center"
          >
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
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
