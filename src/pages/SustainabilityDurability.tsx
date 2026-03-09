import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import { Clock, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bgSustainabilityDurability from "@/assets/bg-sustainability-durability.jpg";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";

const SustainabilityDurability = () => {
  const { language } = useTranslation();

  const benefits = [
    "Minore deterioramento nel tempo",
    "Superficie stabile anche su grandi superfici",
    "Ideale per abitazioni, famiglie, animali domestici",
    "Investimento che mantiene valore nel lungo periodo",
  ];

  return (
    <div>
      <SEOHead
        title={language === 'it' ? "Lunga Durata — Pavimenti Resistenti nel Tempo | Kalēa®" :
               language === 'en' ? "Long-Lasting — Durable Floors Over Time | Kalēa®" :
               language === 'de' ? "Langlebigkeit — Beständige Böden | Kalēa®" :
               "Longue Durée — Sols Résistants dans le Temps | Kalēa®"}
        description={language === 'it' ? "Pavimenti Kalēa® progettati per durare: superficie stabile, minore deterioramento, ideali per famiglie e animali domestici." :
                     language === 'en' ? "Kalēa® floors designed to last: stable surface, less deterioration, ideal for families and pets." :
                     language === 'de' ? "Kalēa® Böden für Langlebigkeit: stabile Oberfläche, weniger Verschleiß, ideal für Familien." :
                     "Sols Kalēa® conçus pour durer : surface stable, moins de détérioration, idéaux pour les familles."}
        keywords="pavimenti resistenti, pavimenti lunga durata, pavimenti famiglie, pavimenti animali domestici, durabilità pavimenti"
      />
      {/* Hero */}
      <HeroSection
        title="Un pavimento progettato per durare nel tempo"
        subtitle="Stabilità dimensionale e resistenza all'usura per anni di prestazioni eccellenti."
        backgroundImage={bgSustainabilityDurability}
        ctaPrimary={{ text: "Richiedi informazioni", link: `/${language}/diventa-partner` }}
      />

      {/* Main Content */}
      <section className="section-spacing bg-background">
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
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground m-0">
                Resistenza dove altri cedono
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              BIOMAG FLOOR® è progettato per resistere dove altri pavimenti mostrano i primi segni di cedimento. La struttura in ossido di magnesio garantisce stabilità dimensionale, resistenza all'usura quotidiana e un comportamento eccellente anche in ambienti molto vissuti.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Grazie alla sua composizione, il pavimento mantiene inalterate prestazioni ed estetica nel corso degli anni, riducendo drasticamente la necessità di sostituzione o interventi correttivi.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 rounded-2xl p-8 bg-card-surface"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <h3 className="text-xl font-heading font-semibold text-white mb-6">
              Benefici concreti
            </h3>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-white font-medium">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 p-8 rounded-2xl bg-card border border-border"
          >
            <p className="text-lg text-foreground leading-relaxed italic">
              Una lunga durata non è solo una scelta tecnica: è una scelta economica e sostenibile.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
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

export default SustainabilityDurability;
