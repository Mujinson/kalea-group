import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedTitle from "@/components/AnimatedTitle";
import CertificationsSection from "@/components/CertificationsSection";
import { Check, ChevronDown, Droplets, Shield, Layers, Sparkles, Ruler, Wind, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/card-hypermatt-ambient.jpg";
import bgCtaCollabora from "@/assets/bg-cta-collabora.png";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import SEOHead from "@/components/SEOHead";
import { hypermattXL, hypermattSpina, hypermatt55 } from "@/data/hypermattProducts";
import roomXL from "@/assets/hero-hypermatt-xl.jpg";
import roomSpina from "@/assets/hero-hypermatt-spina.jpg";
import room55 from "@/assets/hero-hypermatt55.jpg";

const BiocoreFloor = () => {
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

  const features = [
    { icon: Sparkles, title: "Hypermatt Laser Technology", description: "Finitura esclusiva che modifica la superficie a livello microscopico. Ultra-opaca, protetta da impronte e usura quotidiana." },
    { icon: Droplets, title: "Impermeabile al 100%", description: "Struttura SPC in polvere di pietra per massima stabilità e impermeabilità totale." },
    { icon: Ruler, title: "Spessore ridotto 6,5 mm", description: "Per interventi rapidi e leggeri, ideale per ristrutturazioni su pavimenti esistenti." },
    { icon: Layers, title: "Sistema 5G brevettato", description: "Incastro brevettato per una posa flottante precisa e veloce, senza colla." },
    { icon: Shield, title: "Resistenza MSR-B1", description: "Resistenza elevata ai micrograffi per ambienti ad alto traffico." },
    { icon: Wind, title: "Emissioni VOC A+", description: "Privo di ftalati, emissioni molto basse. Sicuro per famiglie e animali domestici." },
  ];

  const formats = [
    "XL Wood — formato largo effetto legno",
    "XL Tile — formato piastrella effetto cemento",
    "Spina Italiana — posa classica italiana",
    "Spina Francese — posa elegante francese",
  ];

  return (
    <div className="relative bg-background">
      <SEOHead
        title="Collezione SPC Hypermatt — Pavimenti Ultra-Matte | Kalēa®"
        description="Collezione SPC Hypermatt di Kalēa®: pavimento ultra-matte con finitura laser, impermeabile, resistente ai micrograffi. Sistema 5G, formati XL e spina. Parte del KALĒA® — SURFACE SYSTEM®."
        keywords="SPC Hypermatt, pavimento ultra matte, pavimento laser finish, pavimento SPC, pavimento impermeabile, pavimento senza colla, pavimento click, Hypermatt Kalēa"
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen sticky top-0 z-[0]">
        <motion.div 
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ scale: heroScale, borderRadius: heroBorderRadius }}
        >
          <motion.img 
            src={heroImage} 
            alt="Collezione SPC Hypermatt"
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ y: heroImageY, scale: 1.1 }}
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
                text="Collezione SPC Hypermatt"
                className="text-[clamp(1.5rem,6vw,4.5rem)] text-white font-bold mb-4 tracking-tight"
              />
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-sm md:text-base text-white/70 font-light tracking-[0.12em] mb-4"
              >
                Parte del KALĒA® — SURFACE SYSTEM®
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto"
              >
                La natura ridefinita dalla luce del laser.<br />
                Ultra-matte al tatto, incredibilmente reale alla vista.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link 
                  to={`/${language}/contatti`}
                  className="group inline-flex items-center justify-center gap-2 bg-white text-[#111] text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-[#F3F3F3] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
                >
                  Richiedi campionatura
                </Link>
                <Link 
                  to={`/${language}/area-tecnica`}
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white text-sm font-medium rounded-xl px-8 py-3.5 hover:bg-white/10 transition-all duration-150"
                >
                  Scheda tecnica
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro filosofico */}
      <section className="relative z-[1] bg-background py-20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <p className="text-lg md:text-xl leading-relaxed text-foreground/80 font-light">
              La Collezione SPC Hypermatt rappresenta l'evoluzione silenziosa delle superfici.
              Grazie alla tecnologia Hypermatt Laser, la microstruttura della superficie viene scolpita con precisione, raggiungendo un'opacità estrema (2 gloss) e una texture morbida, vellutata, che invita al contatto.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-foreground/80 font-light">
              Un realismo materico senza precedenti: le venature del legno e le irregolarità del cemento prendono vita in modo tridimensionale, sia alla vista che al tatto.
              Impermeabile, stabile e resistente ai micrograffi, questa collezione unisce la bellezza naturale dei materiali classici alle performance tecniche più avanzate.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Caratteristiche */}
      <section className="relative z-[2] bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Hypermatt Laser Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Una finitura esclusiva che modifica la superficie a livello microscopico. Il risultato è una pavimentazione ultra-opaca, protetta da impronte e usura quotidiana, ideale anche in presenza di umidità o animali domestici.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="p-6 rounded-2xl bg-card-surface"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
              >
                <feature.icon className="w-8 h-8 text-white mb-4" strokeWidth={1.5} />
                <h3 className="font-heading font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/80 font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formati disponibili */}
      <section className="relative z-[3] bg-background py-20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Formati disponibili
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formats.map((format, index) => (
              <motion.div
                key={format}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-3 p-5 rounded-2xl bg-card-surface"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
              >
                <Check className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-white font-medium">{format}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Le Collezioni Hypermatt */}
      <section className="relative z-[3] bg-background py-20 md:py-32">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12 md:mb-16">
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto italic">Tre collezioni, molteplici soluzioni di interior design per ambienti straordinari e unici.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: "Hypermatt XL", image: roomXL, link: `/${language}/hypermatt-xl` },
              { title: "Hypermatt Spina", image: roomSpina, link: `/${language}/hypermatt-spina` },
              { title: "Hypermatt 55", image: room55, link: `/${language}/hypermatt-55` },
            ].map(({ title, image, link }, index) => (
              <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Link to={link} className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <h3 className="absolute bottom-4 left-5 text-lg md:text-xl font-heading font-bold text-white">{title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Applicazioni ideali */}
      <section className="relative z-[4] bg-background py-20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Applicazioni ideali
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto"
          >
            Perfetta per residenze di prestigio, progetti contract e ristrutturazioni dove si desidera un pavimento che sembri naturale ma offra resistenza e facilità di manutenzione senza eguali.
          </motion.p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-[5] bg-background">
        <div className="absolute inset-0">
          <img src={bgCtaCollabora} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)' }} />
        </div>
        <div className="relative z-10 py-32 md:py-40">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light" style={{ textShadow: '0px 4px 16px rgba(0,0,0,0.55)' }}>
                Parte integrante del KALĒA® — SURFACE SYSTEM®, la Collezione SPC Hypermatt si integra perfettamente con Biomag Floor®, con i parquet pregiati e con le soluzioni outdoor, creando continuità tra interni ed esterni.
              </p>
              <p className="text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-light" style={{ textShadow: '0px 4px 16px rgba(0,0,0,0.55)' }}>
                Pezzi speciali, profili e accessori sono disponibili per completare l'opera con la stessa attenzione al dettaglio.
              </p>
              <p className="text-lg text-white font-medium" style={{ textShadow: '0px 4px 16px rgba(0,0,0,0.55)' }}>
                Richiedi campionatura o una consulenza con il nostro showroom mobile direttamente in cantiere.
              </p>
              <div className="pt-4">
                <Button asChild size="lg" variant="secondary">
                  <Link to={`/${language}/contatti`}>Richiedi informazioni</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certificazioni */}
      <div className="relative z-[6] bg-background">
        <CertificationsSection variant="compact" />
      </div>
    </div>
  );
};

export default BiocoreFloor;
