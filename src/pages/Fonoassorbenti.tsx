import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import AnimatedTitle from "@/components/AnimatedTitle";
import TechSpecBar from "@/components/TechSpecBar";
import hero from "@/assets/fonoassorbenti/hero.webp";
import decor from "@/assets/fonoassorbenti/decor-akustika.webp";
import mikro from "@/assets/fonoassorbenti/mikro.webp";

const collections = [
  {
    slug: "decor-akustika",
    name: "Decor Akustika",
    tagline: "Pannelli fonoassorbenti decorativi",
    description:
      "Pannello a parete con anima fonoassorbente e superficie decorativa in finiture legno e tinte naturali. Migliora il comfort acustico di sale conferenze, uffici, ristoranti e zone living, mantenendo un'estetica calda e raffinata.",
    image: decor,
    finiture: ["Neve", "Noce Aurora", "Noce Dogale", "Rovere Ambrato"],
    applicazioni: ["Sale conferenze", "Uffici direzionali", "Ristoranti", "Hospitality"],
  },
  {
    slug: "mikro",
    name: "Mikro",
    tagline: "Microforatura tecnica, alta performance acustica",
    description:
      "Pannello a microforatura per assorbimento acustico ad ampio spettro. Disegno discreto e modulare, ideale per ambienti dove la riduzione del riverbero deve essere massima senza compromessi estetici.",
    image: mikro,
    finiture: ["Microforato", "Tinte naturali", "Modulare"],
    applicazioni: ["Auditorium", "Studi registrazione", "Aule", "Sale meeting"],
  },
];

const Fonoassorbenti = () => {
  const { language } = useTranslation();

  return (
    <div className="bg-background">
      <SEOHead
        title="Fonoassorbenti | Pannelli acustici decorativi | Kalēa®"
        description="Selezione esclusiva Kalēa® di pannelli fonoassorbenti decorativi: Decor Akustika e Mikro. Comfort acustico ed estetica per uffici, sale conferenze, ristoranti, hospitality."
        keywords="pannelli fonoassorbenti, acustica, fonoassorbenza, pannelli acustici decorativi, comfort acustico uffici"
      />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        <img src={hero} alt="Fonoassorbenti Kalēa" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="relative z-10 h-full container-custom flex flex-col justify-end pb-16 md:pb-24">
          <div className="max-w-3xl">
            <AnimatedTitle
              text="Fonoassorbenti"
              className="text-4xl md:text-6xl lg:text-7xl text-kalea-tan font-bold tracking-tight mb-4"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-base md:text-lg lg:text-xl text-kalea-cream/80 font-light max-w-2xl"
            >
              Selezione esclusiva <span className="whitespace-nowrap">Kalēa®</span> di pannelli fonoassorbenti decorativi.
              Comfort acustico e linguaggio architettonico contemporaneo.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="relative z-[1] py-16 md:py-20 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-4">
            Acustica e design, insieme
          </h2>
          <p className="text-base md:text-lg text-foreground/70 font-light leading-relaxed">
            Soluzioni a parete e a soffitto che riducono il riverbero senza rinunciare all'estetica.
            Due famiglie complementari per ambienti dove il suono — e l'immagine — contano.
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
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1.5">Finiture</p>
                      <ul className="space-y-0.5">
                        {c.finiture.map((it) => (
                          <li key={it} className="text-sm text-foreground/85 font-light">{it}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1.5">Applicazioni</p>
                      <ul className="space-y-0.5">
                        {c.applicazioni.map((it) => (
                          <li key={it} className="text-sm text-foreground/85 font-light">{it}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-[3] bg-background">
        <TechSpecBar
          title="Comfort acustico"
          subtitle="Performance e materia"
          specs={[
            { label: "Tipologie", value: "Decor Akustika · Mikro" },
            { label: "Applicazione", value: "Pareti · Soffitti" },
            { label: "Effetto", value: "Decorativo + fonoassorbente" },
            { label: "Ambito", value: "Uffici · Hospitality · Education" },
          ]}
        />
      </div>
    </div>
  );
};

export default Fonoassorbenti;
