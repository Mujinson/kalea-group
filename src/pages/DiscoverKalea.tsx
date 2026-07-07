import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";

import heroImg from "@/assets/hero-chi-siamo.webp";
import m1 from "@/assets/metodo/metodo-1.png.asset.json";
import m2 from "@/assets/metodo/metodo-2.png.asset.json";
import m3 from "@/assets/metodo/metodo-3.png.asset.json";
import m4 from "@/assets/metodo/metodo-4.png.asset.json";
import m5 from "@/assets/metodo/metodo-5.png.asset.json";
import m6 from "@/assets/metodo/metodo-6.png.asset.json";
import m7 from "@/assets/metodo/metodo-7.png.asset.json";
import m8 from "@/assets/metodo/metodo-8.png.asset.json";
import m9 from "@/assets/metodo/metodo-9.png.asset.json";
import m10 from "@/assets/metodo/metodo-10.png.asset.json";
import bgCta from "@/assets/bg-cta-collabora.png";
import imgBiomag from "@/assets/biomag-hero-new.jpg";
import imgSpc from "@/assets/spc/hero.webp";
import imgLaminati from "@/assets/laminati/hero.webp";
import imgWpc from "@/assets/product-kaleadeck.jpg";
import imgIpe from "@/assets/card-outdoor.jpg";
import imgParquet from "@/assets/card-parquet-ambient.jpg";
import imgCeramiche from "@/assets/ceramiche-esterni-hero.jpg";
import imgCeramicheInterni from "@/assets/ceramiche-interni-hero.jpg";

interface MaterialCard {
  title: string;
  descriptor: string;
  description: string;
  image: string;
  href?: string;
}

const DiscoverKalea = () => {
  const { language } = useTranslation();

  const biomag: MaterialCard = {
    title: "Biomag Floor",
    descriptor: "Pavimentazione proprietaria in MgO per indoor e outdoor",
    description:
      "Biomag Floor rappresenta la sintesi della visione Kalēa. Una superficie evoluta basata su ossido di magnesio (MgO), progettata per coniugare estetica contemporanea, resistenza e versatilità applicativa. Disponibile per ambienti interni ed esterni, offre elevate prestazioni tecniche e un linguaggio materico essenziale. È la soluzione distintiva del brand, sviluppata per progetti che richiedono continuità tra architettura e materia.",
    image: imgBiomag,
  };

  const materials: MaterialCard[] = [
    {
      title: "SPC con polvere di pietra",
      descriptor: "Pavimento rigido ad alta stabilità",
      description:
        "Realizzato con nucleo minerale e polvere di pietra, garantisce resistenza, stabilità dimensionale e facilità di installazione. Una soluzione versatile per ambienti indoor e applicazioni specifiche outdoor.",
      image: imgSpc,
      href: `/${language}/indoor/spc`,
    },
    {
      title: "Laminati",
      descriptor: "Superfici indoor ad alte prestazioni",
      description:
        "Materiali evoluti che combinano estetica, praticità e resistenza all'uso quotidiano. Disponibili in finiture contemporanee e texture materiche, permettono di realizzare ambienti coerenti e durevoli nel tempo.",
      image: imgLaminati,
      href: `/${language}/indoor/laminati`,
    },
    {
      title: "Parquet",
      descriptor: "Parquet in legno naturale di pregio",
      description:
        "Eleganza e calore del legno per ambienti indoor raffinati. Ogni essenza è selezionata per carattere estetico, durabilità e capacità di valorizzare gli spazi residenziali e contract con un tocco senza tempo.",
      image: imgParquet,
      href: `/${language}/parquet`,
    },
    {
      title: "WPC Decking",
      descriptor: "Legno composito co-estruso per esterni",
      description:
        "Una soluzione outdoor ad alte prestazioni, progettata per resistere agli agenti atmosferici e ridurre la manutenzione nel tempo. L'estetica del legno incontra la stabilità dei materiali compositi, rendendolo ideale per terrazze, giardini e aree hospitality.",
      image: imgWpc,
      href: `/${language}/externo`,
    },
    {
      title: "IPE",
      descriptor: "Legno tropicale naturale per esterni",
      description:
        "Tra le essenze più apprezzate in architettura outdoor per densità, durabilità e carattere estetico. La sua naturale resistenza e la ricchezza cromatica lo rendono una scelta senza tempo per decking e superfici esterne di pregio.",
      image: imgIpe,
      href: `/${language}/externo`,
    },
    {
      title: "Ceramiche da interno",
      descriptor: "Superfici ceramiche per spazi indoor contemporanei",
      description:
        "Grès porcellanato e ceramiche di alta gamma pensate per abitazioni, hospitality e spazi commerciali. Texture materiche, formati generosi e performance tecniche per pavimenti e rivestimenti coordinati.",
      image: imgCeramicheInterni,
      href: `/${language}/ceramiche-interni`,
    },
    {
      title: "Ceramiche da esterno su piedini",
      descriptor: "Grès flottante per terrazze e rooftop",
      description:
        "Sistemi sopraelevati che uniscono precisione tecnica e pulizia formale. La posa su piedini consente ispezionabilità, drenaggio e flessibilità progettuale, offrendo una soluzione evoluta per spazi esterni contemporanei.",
      image: imgCeramiche,
      href: `/${language}/ceramiche-esterni`,
    },
  ];

  const serviceSteps = [
    { n: "01", title: "L'Idea", subtitle: "Ogni grande progetto nasce da una visione.", img: m1.url },
    { n: "02", title: "Il Sopralluogo", subtitle: "Le scelte migliori iniziano da un'analisi accurata.", img: m2.url },
    { n: "03", title: "La Scelta", subtitle: "Ogni ambiente merita il pavimento giusto.", img: m3.url },
    { n: "04", title: "La Fornitura", subtitle: "Materiali selezionati. Consegna senza pensieri.", img: m4.url },
    { n: "05", title: "Il Fondo", subtitle: "La qualità di un pavimento inizia da ciò che non si vede.", img: m5.url },
    { n: "06", title: "La Posa", subtitle: "La precisione è il dettaglio che dura negli anni.", img: m6.url },
    { n: "07", title: "Le Finiture", subtitle: "È qui che una casa acquista carattere.", img: m7.url },
    { n: "08", title: "Il Controllo", subtitle: "Ogni dettaglio viene verificato.", img: m8.url },
    { n: "09", title: "La Consegna", subtitle: "La casa che avevi immaginato.", img: m9.url },
    { n: "10", title: "Il Risultato", subtitle: "Niente promesse. Solo risultati straordinari.", img: m10.url },
  ];

  const clients = [
    {
      title: "Architetti e progettisti",
      description:
        "Supportiamo studi di progettazione con schede tecniche, capitolati, campionature e consulenza dedicata. Materiali e soluzioni pensati per integrarsi nel processo progettuale.",
    },
    {
      title: "Imprese edili e general contractor",
      description:
        "Collaboriamo con operatori del settore offrendo forniture continuative, tempi certi e supporto tecnico in tutte le fasi operative. L'obiettivo è garantire qualità esecutiva e affidabilità di cantiere.",
    },
    {
      title: "Privati esigenti",
      description:
        "Accompagniamo il cliente dalla scelta del materiale fino alla posa finale. Una gestione completa del progetto, pensata per chi ricerca qualità, semplicità e attenzione al dettaglio.",
    },
  ];

  const values = [
    {
      title: "Selezione rigorosa dei materiali",
      description:
        "Ogni superficie viene scelta sulla base di criteri estetici, tecnici e prestazionali. Selezioniamo solo materiali in grado di mantenere il proprio valore nel tempo.",
    },
    {
      title: "Competenza tecnica sulla posa",
      description:
        "La qualità di una superficie dipende anche da come viene installata. Per questo la posa è parte integrante del nostro servizio.",
    },
    {
      title: "Estetica come priorità assoluta",
      description:
        "Crediamo che la tecnica debba essere al servizio dell'architettura. Ogni soluzione nasce per valorizzare lo spazio e la sua identità.",
    },
  ];

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Discover Kalēa® — Superfici architettoniche premium chiavi in mano"
        description="Kalēa progetta e realizza superfici premium indoor e outdoor: dalla selezione del materiale alla posa finale, un unico partner per il tuo progetto."
        keywords="Kalea, superfici architettoniche, fornitura e posa, Biomag Floor, MgO, decking, ceramiche esterno"
      />

      {/* 1. HERO */}
      <HeroSection
        title={"Superfici architettoniche premium.\nFornitura e posa chiavi in mano."}
        subtitle="Dalla selezione del materiale alla posa finale: un unico partner per trasformare spazi indoor e outdoor con soluzioni tecniche ed estetiche di alta gamma."
        backgroundImage={heroImg}
        backgroundPosition="center"
        overlayClassName="bg-gradient-to-b from-black/50 via-black/40 to-black/70"
        minHeight="min-h-[80vh]"
      />

      {/* 2. CHI SIAMO */}
      <section className="section-spacing bg-background">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-heading text-foreground mb-8">Chi siamo</h2>
            <div className="space-y-5 text-muted-foreground text-left md:text-center">
              <p>
                Kalēa nasce da un'idea semplice: ogni superficie merita la stessa attenzione di un progetto architettonico.
              </p>
              <p>
                Il nome deriva dal greco e richiama i concetti di bellezza e nobiltà. Una visione che guida ogni scelta, dalla selezione dei materiali alla cura del dettaglio in cantiere.
              </p>
              <p className="text-foreground font-medium">
                Non distribuiamo materiali. Progettiamo soluzioni.
              </p>
              <p>
                Per noi una superficie non è un elemento accessorio, ma parte integrante dell'architettura: definisce il modo in cui uno spazio viene vissuto, attraversato e percepito nel tempo.
              </p>
              <p>
                Per questo accompagniamo ogni progetto in tutte le sue fasi: consulenza, fornitura, logistica, posa e finitura. Un processo integrato che garantisce continuità, controllo e qualità esecutiva.
              </p>
              <p>
                Il risultato è una realizzazione completa, costruita attorno alle esigenze del progetto e non attorno a un catalogo.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. SERVIZIO */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-custom max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-10"
          >
            <p className="font-heading tracking-[0.3em] text-xs text-foreground/60 mb-3">
              IL SERVIZIO KALĒA<span className="whitespace-nowrap">®</span>
            </p>
            <div className="w-10 h-px bg-kalea-tan mx-auto mb-5" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-light text-foreground mb-3">
              Fornitura e posa <span className="italic text-kalea-tan">chiavi in mano</span>
            </h2>
            <p className="text-sm md:text-base text-foreground/70 max-w-xl mx-auto">
              Lavoriamo come un partner di progetto. Un processo integrato dalla consulenza alla posa finale.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 mb-8 md:mb-10">
            {serviceSteps.map((s, i) => (
              <motion.article
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.06 }}
                className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-kalea-cream/60"
              >
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-contain p-1 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-2.5 md:p-3">
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="font-heading text-[10px] tracking-[0.25em]">{s.n}</span>
                    <span className="h-px flex-1 bg-white/40" />
                  </div>
                  <div>
                    <h3 className="font-heading text-white text-sm md:text-base leading-tight mb-1">
                      {s.title}
                    </h3>
                    <p className="text-white/85 text-[10px] leading-snug line-clamp-2">
                      {s.subtitle}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10"
          >
            Un unico interlocutore per l'intero processo. Nessun coordinamento tra fornitori diversi. Nessuna complessità operativa. Solo un servizio completo, pensato per garantire qualità e continuità dal concept alla realizzazione.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <a
              href="https://web.whatsapp.com/send?phone=393520351738&text=Ciao%2C%20vorrei%20richiedere%20un%20preventivo%20gratuito%20per%20i%20vostri%20pavimenti."
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium rounded-full px-8 py-3.5 shadow-[0_4px_20px_rgba(74,42,19,0.18)] ring-1 ring-kalea-tan/30 hover:bg-primary/90 hover:shadow-[0_6px_24px_rgba(74,42,19,0.24)] hover:ring-kalea-tan/50 transition-all duration-150"
            >
              <MessageCircle className="w-4 h-4" />
              Contattaci per un preventivo gratuito
            </a>
          </motion.div>
        </div>
      </section>

      {/* 4. MATERIALI */}
      <section className="section-spacing bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-foreground mb-4">I nostri materiali</h2>
          </motion.div>

          {/* Biomag — featured */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="kalea-card relative overflow-hidden rounded-3xl mb-8 lg:mb-10 border border-border/60"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative min-h-[280px] lg:min-h-[460px]">
                <img
                  src={biomag.image}
                  alt={biomag.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-[#3F3B33] text-xs font-medium tracking-wide uppercase">
                    <Sparkles size={12} />
                    Prodotto esclusivo
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-card">
                <h3 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-3">
                  {biomag.title}
                </h3>
                <p className="text-foreground/70 font-medium mb-5">{biomag.descriptor}</p>
                <p className="text-muted-foreground mb-6 leading-relaxed">{biomag.description}</p>
                <Link
                  to={`/${language}/biomag-floor`}
                  className="group inline-flex items-center gap-2 text-foreground font-medium"
                >
                  Scopri Biomag Floor
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.article>

          {/* Other materials grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((m, index) => (
              <motion.article
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="kalea-card group rounded-2xl overflow-hidden border border-border/60 bg-card flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-1.5">
                    {m.title}
                  </h3>
                  <p className="text-sm text-foreground/60 font-medium mb-3">{m.descriptor}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                  {m.href && (
                    <div className="mt-5 pt-4 border-t border-border/50">
                      <Link
                        to={m.href}
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-kalea-tan transition-colors group/link"
                      >
                        Scopri
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CON CHI LAVORIAMO */}
      <section className="section-spacing bg-secondary/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-foreground mb-4">Con chi lavoriamo</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clients.map((c, index) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="kalea-card rounded-2xl p-8 bg-background border border-border/60"
              >
                <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
                  {c.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{c.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. VALORI */}
      <section className="section-spacing bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-foreground mb-4">I nostri valori</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((v, index) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center md:text-left"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background mb-4">
                  <Check size={18} />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-3">
                  {v.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="section-spacing relative overflow-hidden bg-background">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgCta})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.55) 100%)",
          }}
        />

        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="font-heading mb-6 text-white"
              style={{ textShadow: "0px 4px 16px rgba(0, 0, 0, 0.55)" }}
            >
              Trasformiamo il tuo progetto in una superficie realizzata.
            </h2>
            <p
              className="mb-8 max-w-2xl mx-auto text-white/90"
              style={{ textShadow: "0px 4px 16px rgba(0, 0, 0, 0.55)" }}
            >
              Dalla consulenza iniziale alla posa finale, gestiamo ogni fase con un approccio chiavi in mano e un unico interlocutore.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to={`/${language}/contatti`}>Richiedi una consulenza</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DiscoverKalea;
