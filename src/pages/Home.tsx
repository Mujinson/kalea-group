import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Layers, Shield, Sparkles, Home as HomeIcon, Building2, ShoppingBag, Briefcase, Leaf, Clock, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-home.jpg";
import bgProducts from "@/assets/bg-products.jpg";

const Home = () => {
  const productLines = [
    {
      icon: Layers,
      title: "Kalēa StoneCore 10",
      description:
        "Pavimenti in MgO da 10 mm, flottanti, waterproof e ignifughi. Posa veloce, prestazioni professionali, estetica naturale.",
    },
    {
      icon: Shield,
      title: "Kalēa EdgeLine",
      description:
        "Profili e battiscopa in alluminio coordinati. Design minimal, resistenza superiore, finitura perfetta per ogni spazio.",
    },
    {
      icon: Sparkles,
      title: "Kalēa OneWall",
      description:
        "Pannelli in MgO per pareti e soffitti, già finiti. Alternativa avanzata al cartongesso, versatile e rapida da installare.",
    },
  ];

  const mgoAdvantages = [
    { icon: Shield, text: "Fireproof - Ignifugo" },
    { icon: Layers, text: "Waterproof - Impermeabile" },
    { icon: Sparkles, text: "Stabilità dimensionale" },
    { icon: Shield, text: "Anti-muffa" },
    { icon: Layers, text: "Comfort acustico" },
    { icon: Sparkles, text: "Posa flottante" },
  ];

  const applications = [
    { icon: HomeIcon, title: "Residenziale", description: "Abitazioni private di design" },
    { icon: Building2, title: "Hospitality", description: "Hotel e strutture ricettive" },
    { icon: ShoppingBag, title: "Retail", description: "Negozi e showroom" },
    { icon: Briefcase, title: "Uffici", description: "Spazi di lavoro contemporanei" },
  ];

  const sustainability = [
    { icon: Leaf, title: "Ridotto impatto ambientale", description: "Materiali sostenibili e processi ecocompatibili" },
    { icon: Clock, title: "Lunga durata", description: "Investimento che dura nel tempo" },
    { icon: Wrench, title: "Manutenzione minima", description: "Risparmio di risorse e tempo" },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title="Superfici di nuova generazione in MgO"
        subtitle="Pavimenti, profili e pannelli sviluppati in Italia per durare e trasformare gli spazi."
        ctaPrimary={{ text: "Scopri le nostre soluzioni", link: "/stonecore-10" }}
        ctaSecondary={{ text: "Richiedi un preventivo", link: "/contatti" }}
        backgroundImage={heroImage}
        minHeight="min-h-[85vh]"
      />

      {/* Le linee Kalēa */}
      <section className="section-spacing relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={bgProducts} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/75" />
        </div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Le linee Kalēa
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Tre sistemi integrati per dare forma agli spazi del futuro
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {productLines.map((product, index) => (
              <FeatureCard key={product.title} {...product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Perché MgO */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">Perché MgO</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                L'ossido di magnesio (MgO) rappresenta il futuro delle costruzioni. Un materiale dalle prestazioni
                eccezionali che supera i limiti dei sistemi tradizionali.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {mgoAdvantages.map((advantage, index) => (
                  <motion.div
                    key={advantage.text}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <advantage.icon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-foreground">{advantage.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <Button asChild variant="default">
                  <Link to="/area-tecnica">Approfondisci</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-muted overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Schema comparativo MgO</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Applicazioni */}
      <section className="section-spacing bg-card">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Applicazioni
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kalēa si adatta a ogni contesto, dal residenziale al commerciale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {applications.map((app, index) => (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative aspect-square rounded-2xl bg-muted overflow-hidden hover-lift"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/80" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <app.icon className="w-12 h-12 text-background mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-background mb-2">{app.title}</h3>
                  <p className="text-sm text-background/80">{app.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sostenibilità */}
      <section className="section-spacing">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Sostenibilità
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Investire in Kalēa significa scegliere il futuro
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {sustainability.map((item, index) => (
              <FeatureCard key={item.title} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
              Vuoi usare Kalēa nei tuoi progetti?
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90">
              Contattaci per ricevere campioni, documentazione tecnica o un preventivo personalizzato
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/contatti">Richiedi preventivo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/chi-siamo">Diventa partner</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
