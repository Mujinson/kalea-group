import { motion } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import { Target, Lightbulb, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ChiSiamo = () => {
  const values = [
    {
      icon: Target,
      title: "Innovazione",
      description: "Ricerca continua di materiali e soluzioni all'avanguardia per il settore delle costruzioni.",
    },
    {
      icon: Lightbulb,
      title: "Design",
      description: "Estetica minimal e funzionalità si fondono in ogni prodotto che sviluppiamo.",
    },
    {
      icon: Users,
      title: "Collaborazione",
      description: "Lavoriamo a fianco di architetti, interior designer e imprese per realizzare progetti unici.",
    },
    {
      icon: Award,
      title: "Qualità",
      description: "Standard produttivi elevati e controllo rigoroso in ogni fase, dal design alla consegna.",
    },
  ];

  const customers = [
    { title: "Architetti e progettisti", description: "Soluzioni tecniche per progetti residenziali e commerciali" },
    { title: "Interior designer", description: "Materiali premium per spazi dal design curato" },
    { title: "Imprese edili", description: "Prodotti affidabili con posa veloce e certificazioni complete" },
    { title: "Rivenditori", description: "Partner commerciali per distribuzione e supporto territoriale" },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="section-spacing bg-gradient-to-b from-muted/30 to-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
                Chi Siamo
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Kalēa nasce dall'esperienza nel settore delle costruzioni e dalla passione per l'innovazione dei
                materiali. Sviluppiamo superfici in MgO (ossido di magnesio) che ridefiniscono gli standard di
                prestazione, estetica e sostenibilità.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Ogni prodotto della gamma Kalēa è progettato in Italia con l'obiettivo di semplificare la posa,
                garantire durata nel tempo e offrire soluzioni all'avanguardia per architetti, designer e imprese.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl bg-muted overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Immagine azienda / team</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Storia */}
      <section className="section-spacing section-overlap bg-background" style={{ zIndex: 1 }}>
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">La nostra storia</h2>
            <div className="space-y-6 text-left text-muted-foreground leading-relaxed">
              <p>
                Il progetto Kalēa nasce dalla volontà di superare i limiti dei materiali tradizionali nel settore
                dell'edilizia e dell'interior design. L'ossido di magnesio (MgO) si è rivelato la chiave per
                sviluppare una gamma di prodotti dalle prestazioni eccezionali.
              </p>
              <p>
                Dopo anni di ricerca e sviluppo, abbiamo creato tre linee integrate: <strong>StoneCore 10</strong> per
                i pavimenti, <strong>EdgeLine</strong> per profili e battiscopa, e <strong>OneWall</strong> per pareti
                e soffitti. Ogni prodotto è pensato per essere semplice da posare, bello da vedere e capace di durare
                nel tempo.
              </p>
              <p>
                Oggi Kalēa è sinonimo di innovazione italiana nel campo delle superfici tecniche, scelto da
                professionisti che cercano qualità, design e affidabilità.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cosa ci guida */}
      <section className="section-spacing section-overlap bg-card" style={{ zIndex: 2 }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Cosa ci guida</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              I valori che ispirano ogni decisione e ogni prodotto Kalēa
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <FeatureCard key={value.title} {...value} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Per chi lavoriamo */}
      <section className="section-spacing section-overlap bg-background" style={{ zIndex: 3 }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Per chi lavoriamo</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              I professionisti che scelgono Kalēa per i loro progetti
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customers.map((customer, index) => (
              <motion.div
                key={customer.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{customer.title}</h3>
                <p className="text-muted-foreground">{customer.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing section-overlap bg-primary text-primary-foreground" style={{ zIndex: 4 }}>
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Vuoi collaborare con noi?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Cerchiamo partner, rivenditori e professionisti che condividono la nostra visione
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

export default ChiSiamo;
