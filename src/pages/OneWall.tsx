import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { Zap, Shield, Palette, Droplets, Flame, Clock, Grid3x3, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-onewall.jpg";
import bgOneWall from "@/assets/bg-onewall.jpg";
import bgOneWallApplications from "@/assets/bg-onewall-applications.jpg";

const OneWall = () => {
  const advantages = [
    {
      icon: Zap,
      title: "Posa velocissima",
      description: "Pannelli già finiti pronti all'uso. Installazione 3 volte più rapida del cartongesso tradizionale.",
    },
    {
      icon: Shield,
      title: "Resistenza superiore",
      description: "Core in MgO che garantisce stabilità, durezza e resistenza agli urti.",
    },
    {
      icon: Droplets,
      title: "Waterproof",
      description: "Perfetto per ambienti umidi come bagni e cucine senza rischio di degrado.",
    },
    {
      icon: Flame,
      title: "Fireproof",
      description: "Ignifugo certificato. Sicurezza massima per pareti e soffitti.",
    },
    {
      icon: Palette,
      title: "Versatilità estetica",
      description: "Disponibile in finiture legno, marmo, cemento, carta da parati e decorative.",
    },
    {
      icon: Clock,
      title: "Manutenzione zero",
      description: "Non richiede ritocchi, tinteggiature o trattamenti periodici.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Preparazione",
      description: "Installazione di struttura portante a secco (opzionale per pareti esistenti)",
    },
    {
      step: "2",
      title: "Posa pannelli",
      description: "Fissaggio dei pannelli OneWall con viti e tasselli. Taglio e adattamento semplici",
    },
    {
      step: "3",
      title: "Finitura",
      description: "Stuccatura giunti e applicazione profili. Pronto all'uso senza ulteriori finiture",
    },
  ];

  const finishes = [
    { name: "Effetto legno", description: "Texture naturali per ambienti caldi" },
    { name: "Effetto marmo", description: "Eleganza senza tempo per spazi raffinati" },
    { name: "Effetto cemento", description: "Stile industriale e contemporaneo" },
    { name: "Carta da parati", description: "Personalizzazione infinita con pattern esclusivi" },
    { name: "Finiture decorative", description: "Texture tridimensionali per pareti d'accento" },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection
        title="Kalēa OneWall"
        subtitle="Pannelli in MgO per pareti e soffitti. L'evoluzione del cartongesso, già finito."
        ctaPrimary={{ text: "Richiedi campioni", link: "/contatti" }}
        ctaSecondary={{ text: "Scarica catalogo", link: "/area-tecnica" }}
        backgroundImage={heroImage}
      />

      {/* Come funziona */}
      <section className="section-spacing section-overlap bg-background" style={{ zIndex: 1 }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Come funziona</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sistema semplice e veloce per pareti e soffitti perfetti
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-heading font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Finiture */}
      <section className="section-spacing section-overlap bg-card" style={{ zIndex: 2 }}>
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
              Personalizza pareti e soffitti secondo il tuo stile
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishes.map((finish, index) => (
              <motion.div
                key={finish.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-background border border-border rounded-xl overflow-hidden hover-lift"
              >
                <div className="aspect-video bg-muted">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <p className="text-muted-foreground text-xs">Immagine finitura</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{finish.name}</h3>
                  <p className="text-muted-foreground text-sm">{finish.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantaggi tecnici */}
      <section 
        className="section-spacing section-overlap relative"
        style={{
          zIndex: 3,
          backgroundImage: `url(${bgOneWall})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay scuro */}
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">Vantaggi tecnici</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Prestazioni superiori al cartongesso tradizionale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <FeatureCard key={advantage.title} {...advantage} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Applicazioni */}
      <section 
        className="section-spacing section-overlap relative py-24"
        style={{
          zIndex: 4,
          backgroundImage: `url(${bgOneWallApplications})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Dove usare OneWall
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Soluzioni versatili per ogni esigenza architettonica
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: Grid3x3,
                title: "Pareti divisorie architettoniche",
                description: "Soluzione ideale per creare ambienti flessibili e leggeri in uffici, abitazioni e spazi commerciali.",
              },
              {
                icon: Droplets,
                title: "Pareti di rivestimento impermeabili",
                description: "Perfette in bagni e cucine grazie alla totale resistenza all'umidità e alla stabilità nel tempo.",
              },
              {
                icon: Layers,
                title: "Controsoffitti e pannellature tecniche",
                description: "Installazione rapida, finitura immediata e prestazioni superiori rispetto al cartongesso tradizionale.",
              },
              {
                icon: Sparkles,
                title: "Pareti decorative e accent walls",
                description: "Per creare elementi scenografici in reception, showroom, hotel e zone living.",
              },
            ].map((application, index) => (
              <FeatureCard 
                key={application.title} 
                icon={application.icon}
                title={application.title}
                description={application.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="section-spacing section-overlap bg-primary text-primary-foreground" style={{ zIndex: 5 }}>
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Scopri le possibilità di OneWall
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Contattaci per una consulenza personalizzata sul tuo progetto
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contatti">Richiedi consulenza</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OneWall;
