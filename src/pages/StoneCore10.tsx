import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Droplets, Flame, Shield, Volume2, Zap, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-stonecore.jpg";

const StoneCore10 = () => {
  const advantages = [
    {
      icon: Droplets,
      title: "Waterproof",
      description: "100% impermeabile. Perfetto per bagni, cucine e ambienti umidi senza preoccupazioni.",
    },
    {
      icon: Flame,
      title: "Fireproof",
      description: "Ignifugo certificato. Sicurezza massima per spazi residenziali e commerciali.",
    },
    {
      icon: Shield,
      title: "Anti-muffa",
      description: "Naturalmente resistente a muffe e batteri. Ambiente più sano e salubre.",
    },
    {
      icon: Volume2,
      title: "Comfort acustico",
      description: "Riduce la trasmissione del rumore. Silenzio e tranquillità in ogni stanza.",
    },
    {
      icon: Zap,
      title: "Posa flottante",
      description: "Installazione rapida senza colla. Pronto all'uso in poche ore.",
    },
    {
      icon: Layers,
      title: "Stabilità dimensionale",
      description: "Non si espande né si contrae. Perfetto per grandi superfici continue.",
    },
  ];

  const finishes = [
    { name: "Rovere Naturale", color: "#C4A574" },
    { name: "Noce Scuro", color: "#5D4E37" },
    { name: "Grigio Cemento", color: "#B0B0B0" },
    { name: "Pietra Bianca", color: "#E8E8E8" },
    { name: "Legno Chiaro", color: "#D4B896" },
    { name: "Grafite", color: "#4A4A4A" },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title="Kalēa StoneCore 10"
        subtitle="Pavimenti in MgO di nuova generazione. Prestazioni professionali, estetica naturale, posa veloce."
        ctaPrimary={{ text: "Richiedi campioni", link: "/contatti" }}
        ctaSecondary={{ text: "Scarica scheda tecnica", link: "/area-tecnica" }}
        backgroundImage={heroImage}
      />

      {/* Schema multistrato */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Struttura multistrato avanzata
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              10 mm totali: 8,5 mm core MgO + 1,5 mm strato di usura decorativo
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-3">
              {[
                { label: "Strato decorativo", height: "h-8", bg: "bg-secondary" },
                { label: "Strato di usura", height: "h-6", bg: "bg-primary/30" },
                { label: "Core MgO", height: "h-32", bg: "bg-primary" },
                { label: "Tappetino", height: "h-4", bg: "bg-muted" },
              ].map((layer, index) => (
                <motion.div
                  key={layer.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${layer.height} ${layer.bg} rounded-lg flex items-center px-6 text-foreground font-medium`}
                >
                  {layer.label}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="section-spacing bg-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Vantaggi esclusivi
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Prestazioni superiori per ogni esigenza progettuale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Finiture */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Finiture disponibili
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Scegli tra le nostre esclusive texture naturali
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {finishes.map((finish, index) => (
              <motion.button
                key={finish.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all"
              >
                <div className="absolute inset-0" style={{ backgroundColor: finish.color }} />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <p className="text-xs font-medium text-background opacity-0 group-hover:opacity-100 transition-opacity">
                    {finish.name}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs tecnici */}
      <section className="section-spacing bg-card">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Tabs defaultValue="caratteristiche" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="caratteristiche">Caratteristiche</TabsTrigger>
                <TabsTrigger value="posa">Posa</TabsTrigger>
                <TabsTrigger value="manutenzione">Manutenzione</TabsTrigger>
              </TabsList>

              <TabsContent value="caratteristiche" className="mt-8 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Specifiche tecniche</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Spessore totale: 10 mm (8,5 mm + 1,5 mm)</li>
                    <li>Dimensioni plancia: 1220 x 180 mm</li>
                    <li>Classe di reazione al fuoco: A2-s1, d0</li>
                    <li>Resistenza all'acqua: IP68</li>
                    <li>Resistenza all'abrasione: AC5</li>
                    <li>Riduzione acustica: 19 dB</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="posa" className="mt-8 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Istruzioni di posa</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Sistema flottante senza colla</li>
                    <li>Preparazione sottofondo: livellato e pulito</li>
                    <li>Acclimatazione: 24-48 ore in ambiente</li>
                    <li>Giunto perimetrale: 8-10 mm</li>
                    <li>Posa a spina di pesce o dritta</li>
                    <li>Calpestabile immediatamente dopo la posa</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="manutenzione" className="mt-8 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Cura e manutenzione</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Pulizia quotidiana: panno umido o aspirapolvere</li>
                    <li>Detergenti neutri per macchie ostinate</li>
                    <li>Evitare prodotti abrasivi o solventi aggressivi</li>
                    <li>Protezioni in feltro sotto mobili pesanti</li>
                    <li>Nessuna ceratura o trattamento periodico necessario</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* CTA Download */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Scarica la documentazione completa</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Schede tecniche, certificazioni e guide di posa disponibili nell'Area Tecnica
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/area-tecnica">Vai all'Area Tecnica</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StoneCore10;
