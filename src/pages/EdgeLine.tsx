import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Sparkles, Shield, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-edgeline.jpg";

const EdgeLine = () => {
  const advantages = [
    {
      icon: Sparkles,
      title: "Design minimal",
      description: "Profili eleganti che valorizzano il pavimento senza invadere l'estetica degli spazi.",
    },
    {
      icon: Shield,
      title: "Resistenza superiore",
      description: "Alluminio di alta qualità che garantisce durata e stabilità nel tempo.",
    },
    {
      icon: Ruler,
      title: "Versatilità",
      description: "Soluzioni per ogni esigenza: terminali, giunzioni, dilatazioni, scalini.",
    },
  ];

  const products = [
    {
      title: "Profilo terminale",
      description: "Finitura perfetta per terminazioni a vista del pavimento",
    },
    {
      title: "Profilo di giunzione",
      description: "Raccordo tra pavimenti dello stesso livello",
    },
    {
      title: "Profilo di dilatazione",
      description: "Gestione dei giunti di dilatazione strutturali",
    },
    {
      title: "Battiscopa",
      description: "Coordinato con i pavimenti StoneCore 10",
    },
    {
      title: "Profilo scalino",
      description: "Protezione e finitura per gradini e dislivelli",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title="Kalēa EdgeLine"
        subtitle="Profili e battiscopa in alluminio coordinati. La finitura perfetta per ogni progetto."
        ctaPrimary={{ text: "Richiedi catalogo", link: "/contatti" }}
        ctaSecondary={{ text: "Scopri StoneCore 10", link: "/stonecore-10" }}
        backgroundImage={heroImage}
      />

      {/* Vantaggi */}
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
              Perché scegliere EdgeLine
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La soluzione completa per profili e battiscopa
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Griglia prodotti */}
      <section className="section-spacing bg-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Gamma prodotti</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluzioni tecniche per ogni situazione di posa
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-background border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <p className="text-muted-foreground text-xs">Immagine prodotto</p>
                  </div>
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{product.title}</h3>
                <p className="text-muted-foreground text-sm">{product.description}</p>
              </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Finiture disponibili</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Coordinati con i pavimenti Kalēa StoneCore 10
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {["Alluminio naturale", "Bronzo satinato", "Nero opaco", "Argento lucido"].map((finish, index) => (
              <motion.div
                key={finish}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="aspect-square rounded-xl bg-muted border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-center p-4 cursor-pointer hover-lift"
              >
                <p className="text-sm font-medium text-foreground">{finish}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Completa il tuo progetto con EdgeLine
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Richiedi un preventivo personalizzato o campioni gratuiti
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contatti">Contattaci</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default EdgeLine;
