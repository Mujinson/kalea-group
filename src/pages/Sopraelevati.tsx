import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import AnimatedTitle from "@/components/AnimatedTitle";
import TechSpecBar from "@/components/TechSpecBar";
import CollectionColorsSection from "@/components/CollectionColorsSection";
import hero from "@/assets/sopraelevati/hero.webp";
import access from "@/assets/sopraelevati/access-floor.webp";
import tech from "@/assets/sopraelevati/tech-floor.webp";

const collections = [
  {
    slug: "access",
    name: "Access",
    tagline: "Pavimento sopraelevato modulare",
    description:
      "Sistema sopraelevato a pannelli modulari su piedistalli regolabili. Garantisce il passaggio di impianti elettrici, dati e HVAC sotto la superficie calpestabile, mantenendo accessibilità totale e flessibilità di layout.",
    image: access,
    formati: ["600 × 600 mm"],
    finiture: ["Solfato di calcio", "HPL", "Vinilico"],
    applicazioni: ["Uffici direzionali", "Data center", "Showroom", "Spazi flessibili"],
  },
  {
    slug: "tech",
    name: "Tech",
    tagline: "Sopraelevato per esterni e terrazze",
    description:
      "Sistema sopraelevato per esterni con supporti autolivellanti e lastre in gres porcellanato spesse 20 mm. Posa rapida a secco, ispezionabilità totale e drenaggio integrato per terrazze, coperture e bordo piscina.",
    image: tech,
    formati: ["600 × 600", "600 × 1200 mm"],
    finiture: ["Gres 20 mm", "Pietra ricostruita", "Effetto legno"],
    applicazioni: ["Terrazze", "Coperture", "Bordi piscina", "Roof garden"],
  },
];

const Sopraelevati = () => {
  const { language } = useTranslation();

  return (
    <div className="bg-background">
      <SEOHead
        title="Sopraelevati | Pavimenti modulari tecnici | Kalēa®"
        description="Selezione esclusiva Kalēa® di pavimenti sopraelevati: Access per interni e Tech per esterni. Sistemi modulari ispezionabili per uffici, data center, terrazze e roof garden."
        keywords="pavimenti sopraelevati, raised floor, access floor, pavimento tecnico, sopraelevato esterno, gres 20mm"
      />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        <img src={hero} alt="Sopraelevati Kalēa" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="relative z-10 h-full container-custom flex flex-col justify-end pb-16 md:pb-24">
          <div className="max-w-3xl">
            <AnimatedTitle
              text="Sopraelevati"
              className="text-4xl md:text-6xl lg:text-7xl text-kalea-tan font-bold tracking-tight mb-4"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-base md:text-lg lg:text-xl text-kalea-cream/80 font-light max-w-2xl"
            >
              Selezione esclusiva <span className="whitespace-nowrap">Kalēa®</span> di pavimenti sopraelevati.
              Sistemi modulari ispezionabili per interni tecnici ed esterni di pregio.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="relative z-[1] py-16 md:py-20 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-4">
            Modularità, accesso e libertà progettuale
          </h2>
          <p className="text-base md:text-lg text-foreground/70 font-light leading-relaxed">
            Due sistemi complementari: <strong>Access</strong> per impiantistica nascosta negli interni,
            <strong> Tech</strong> per finiture di gres su supporti autolivellanti in esterno.
            Posa a secco, ispezionabilità totale, performance certificate.
          </p>
        </div>
      </section>

      {/* Collections */}
      <section className="relative z-[2] pb-20 md:pb-28 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {collections.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-md hover:shadow-xl transition-shadow duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <h3 className="text-2xl font-heading font-semibold text-foreground tracking-wide whitespace-nowrap">
                    {c.name}
                  </h3>
                  <p className="text-sm text-foreground/60 mt-1 mb-3 italic">{c.tagline}</p>
                  <p className="text-base text-foreground/80 font-light leading-relaxed mb-5">
                    {c.description}
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
                    {[
                      { title: "Formati", items: c.formati },
                      { title: "Finiture", items: c.finiture },
                      { title: "Applicazioni", items: c.applicazioni },
                    ].map((b) => (
                      <div key={b.title}>
                        <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1.5">{b.title}</p>
                        <ul className="space-y-0.5">
                          {b.items.map((it) => (
                            <li key={it} className="text-sm text-foreground/85 font-light">{it}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Color palettes per collection */}
      {collections.map((c) => (
        <CollectionColorsSection
          key={`colors-${c.slug}`}
          slug={c.slug}
          collectionName={c.name}
          className="py-16 md:py-20 px-4 md:px-8 lg:px-12 bg-background border-t border-border/30"
        />
      ))}


      <div className="relative z-[3] bg-background">
        <TechSpecBar
          title="Sistemi sopraelevati"
          subtitle="Tecnica e accessibilità"
          specs={[
            { label: "Tipologie", value: "Access · Tech" },
            { label: "Modulo", value: "600 × 600 mm" },
            { label: "Posa", value: "A secco · ispezionabile" },
            { label: "Ambito", value: "Uffici · Terrazze · Data center" },
          ]}
        />
      </div>
    </div>
  );
};

export default Sopraelevati;
