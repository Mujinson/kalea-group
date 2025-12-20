import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import { Leaf, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bgSustainabilityForest from "@/assets/bg-sustainability-forest.jpg";
import { useTranslation } from "@/i18n/useTranslation";

const SustainabilityImpact = () => {
  const { language } = useTranslation();

  const keyPoints = [
    "Materiale minerale stabile e sicuro",
    "Nessuna emissione nociva per ambienti interni",
    "Riduzione della necessità di sostituzione nel tempo",
    "Minore consumo di risorse a lungo termine",
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title="Pavimenti a basso impatto ambientale in ossido di magnesio"
        subtitle="Superfici tecniche progettate per rispettare l'ambiente lungo tutto il ciclo di vita."
        backgroundImage={bgSustainabilityForest}
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
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground m-0">
                Un approccio responsabile alle superfici
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Il pavimento StoneCore 10 nasce da una visione precisa: creare una superficie ad alte prestazioni che riduca l'impatto ambientale lungo tutto il suo ciclo di vita.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              L'ossido di magnesio è un materiale minerale stabile, privo di sostanze nocive, progettato per durare nel tempo senza rilasciare composti dannosi nell'ambiente domestico. A differenza di molte alternative tradizionali, StoneCore 10 non richiede trattamenti chimici aggressivi, né durante la produzione né durante l'utilizzo quotidiano.
            </p>
          </motion.div>

          {/* Key Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 rounded-2xl p-8 bg-gradient-to-b from-foreground/50 to-foreground/80"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <h3 className="text-xl font-heading font-semibold text-background mb-6">
              Punti chiave
            </h3>
            <ul className="space-y-4">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-background/90">
                  <Check className="w-5 h-5 text-background/70 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
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
              Scegliere StoneCore 10 significa investire in un pavimento che rispetta l'ambiente, migliora la qualità dell'aria indoor e contribuisce a uno stile di vita più consapevole, senza rinunciare all'estetica.
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
            <Link to={`/${language}/biocore`}>
              <Button size="lg" className="gap-2">
                Scopri BIOCORE®
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SustainabilityImpact;
