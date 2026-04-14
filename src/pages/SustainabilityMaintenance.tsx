import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import { Wrench, Check, X, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bgSustainabilityMaintenance from "@/assets/bg-sustainability-maintenance.jpg";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";

const SustainabilityMaintenance = () => {
  const { language } = useTranslation();

  const canUse = [
    "Acqua tiepida",
    "Detergenti neutri ecologici",
    "Panni o mop non abrasivi",
  ];

  const avoidUsing = [
    "Solventi chimici aggressivi",
    "Cere industriali",
    "Prodotti inquinanti superflui",
  ];

  return (
    <div>
      <SEOHead
        title={language === 'it' ? "Manutenzione Pavimenti Flottanti — Pulizia e Cura | Kalēa®" :
               language === 'en' ? "Floating Floor Maintenance — Cleaning & Care | Kalēa®" :
               language === 'de' ? "Pflege Schwimmböden — Reinigung & Pflege | Kalēa®" :
               "Entretien Sols Flottants — Nettoyage et Soin | Kalēa®"}
        description={language === 'it' ? "Come pulire e mantenere i pavimenti flottanti Kalēa®: guida alla manutenzione semplice con acqua e detergenti neutri. Niente cere o solventi." :
                     language === 'en' ? "How to clean and maintain Kalēa® floating floors: simple maintenance guide with water and neutral cleaners." :
                     language === 'de' ? "Wie man Kalēa® Schwimmböden reinigt und pflegt: einfache Pflegeanleitung mit Wasser und neutralen Reinigern." :
                     "Comment nettoyer et entretenir les sols flottants Kalēa® : guide d'entretien simple."}
        keywords="manutenzione pavimenti flottanti, pulizia pavimento flottante, come pulire pavimento, cura pavimenti, manutenzione pavimento MgO"
      />
      {/* Hero */}
      <HeroSection
        title="Manutenzione semplice, rispetto per l'ambiente"
        subtitle="Una superficie che semplifica la vita quotidiana senza compromessi."
        backgroundImage={bgSustainabilityMaintenance}
        ctaPrimary={{ text: "Richiedi informazioni", link: `/${language}/diventa-partner` }}
      />

      {/* Main Content */}
      <section className="relative z-10 section-spacing bg-background">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg max-w-none"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground m-0">
                Pulizia senza complicazioni
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              BIOMAG FLOOR® è pensato per semplificare la vita quotidiana. La superficie non richiede cere, solventi o detergenti aggressivi. La pulizia ordinaria può essere effettuata con acqua e detergenti neutri, riducendo l'uso di prodotti chimici che inquinano l'ambiente e l'aria domestica.
            </p>
          </motion.div>

          {/* What to use / What to avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl p-8 bg-card-surface"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            >
              <h3 className="text-xl font-heading font-semibold text-white mb-6">
                Cosa si può usare
              </h3>
              <ul className="space-y-4">
                {canUse.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-white font-medium">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-2xl p-8 bg-card border border-border"
            >
              <h3 className="text-xl font-heading font-semibold text-foreground mb-6">
                Cosa evitare
              </h3>
              <ul className="space-y-4">
                {avoidUsing.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Health Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  Focus salute
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  L'assenza di sostanze nocive rende BIOMAG FLOOR® sicuro per bambini e animali domestici, contribuendo a un ambiente domestico più sano.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 p-8 rounded-2xl bg-card border border-border"
          >
            <p className="text-lg text-foreground leading-relaxed italic">
              Meno manutenzione significa meno costi, meno fatica e più rispetto per l'ambiente.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Link to={`/${language}/biomag-floor`}>
              <Button size="lg" className="gap-2">
                Scopri BIOMAG FLOOR®
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SustainabilityMaintenance;
