import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import AnimatedTitle from "@/components/AnimatedTitle";
import CollectionColorsSection from "@/components/CollectionColorsSection";
import heroOut from "@/assets/outdoor-extra/hero.webp";
import compact from "@/assets/outdoor-extra/compact.webp";
import pacto from "@/assets/outdoor-extra/pacto.webp";
import real from "@/assets/outdoor-extra/real.webp";

const collections = [
  {
    slug: "compact",
    name: "Compact",
    tagline: "Doghe compatte effetto pietra",
    description:
      "Pavimento per esterni in materiale composito ad alta densità. Superficie effetto pietra antiscivolo, eccellente resistenza ai raggi UV e agli sbalzi termici. Ideale per terrazze, bordi piscina e dehors.",
    image: compact,
    formati: ["Doghe grande formato"],
    finiture: ["Effetto pietra", "Antiscivolo R11", "UV stable"],
    applicazioni: ["Terrazze", "Piscine", "Dehors", "Hospitality outdoor"],
  },
  {
    slug: "pacto",
    name: "Pacto",
    tagline: "WPC eolico, tonalità mediterranee",
    description:
      "Decking in WPC (legno + polimero) nella palette delle isole eolie (Lipari, Linosa, Panarea). Posa rapida a clip nascoste, manutenzione minima e tatto caldo a piedi nudi.",
    image: pacto,
    formati: ["Doghe WPC 2200 mm"],
    finiture: ["Spazzolato", "Clip nascoste", "Antiscivolo"],
    applicazioni: ["Terrazze residenziali", "Solarium", "Camminamenti giardino"],
  },
  {
    slug: "real",
    name: "Real",
    tagline: "Vero legno tropicale per esterni",
    description:
      "Decking in legno massello tropicale (Teak, Ipe Lapacho). Massima resistenza all'umidità, lavorazione di alta gamma e patina naturale nel tempo. Per progetti dove il materiale è protagonista.",
    image: real,
    formati: ["Doghe legno massello"],
    finiture: ["Teak naturale", "Ipe Lapacho", "Teak ossidato"],
    applicazioni: ["Ville", "Yacht", "Resort", "Architettura d'autore"],
  },
];

const OutdoorSelection = () => {
  const { language } = useTranslation();

  return (
    <div className="bg-background">
      <SEOHead
        title="Outdoor Selection | Decking e pavimenti per esterni | Kalēa®"
        description="Selezione esclusiva Kalēa® di pavimenti per esterni: Compact, Pacto, Real. Decking in composito, WPC e legno tropicale per terrazze, piscine e architetture d'autore."
        keywords="decking esterno, pavimento terrazza, WPC, decking teak, decking composito, pavimento piscina"
      />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        <img src={heroOut} alt="Outdoor Selection Kalēa" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="relative z-10 h-full container-custom flex flex-col justify-end pb-16 md:pb-24">
          <div className="max-w-3xl">
            <AnimatedTitle
              text="Outdoor Selection"
              className="text-4xl md:text-6xl lg:text-7xl text-kalea-tan font-bold tracking-tight mb-4"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-base md:text-lg lg:text-xl text-kalea-cream/80 font-light max-w-2xl"
            >
              Selezione esclusiva <span className="whitespace-nowrap">Kalēa®</span> di decking e pavimenti per esterni.
              Alternativa tecnica a Externo per progetti dove serve composito, WPC o vero legno tropicale.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="relative z-[1] py-16 md:py-20 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-4">
            Tre famiglie, un unico standard
          </h2>
          <p className="text-base md:text-lg text-foreground/70 font-light leading-relaxed">
            Tre tecnologie complementari per gli esterni: composito ad alta densità, WPC e legno tropicale massello.
            Ogni linea risponde a un brief progettuale diverso, mantenendo la qualità e la curatela tipica di <span className="whitespace-nowrap">Kalēa®</span>.
          </p>
        </div>
      </section>

      {/* Collections grid */}
      <section className="relative z-[2] pb-20 md:pb-28 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {collections.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-md hover:shadow-xl transition-shadow duration-500"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <h3 className="text-xl md:text-2xl font-heading font-semibold text-kalea-tan tracking-wide whitespace-nowrap">
                    {c.name}
                  </h3>
                  <p className="text-sm text-kalea-cream/80 mt-1 mb-3 italic">{c.tagline}</p>
                  <p className="text-sm text-kalea-cream/85 font-light leading-relaxed line-clamp-3">
                    {c.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="relative z-[3] pb-20 md:pb-28 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {collections.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-card rounded-2xl p-6 md:p-7 border border-border/40"
            >
              <h3 className="text-base font-heading font-semibold text-foreground mb-4">{c.name}</h3>
              {[
                { title: "Formati", items: c.formati },
                { title: "Finiture", items: c.finiture },
                { title: "Applicazioni", items: c.applicazioni },
              ].map((b) => (
                <div key={b.title} className="mb-4 last:mb-0">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1.5">{b.title}</p>
                  <ul className="space-y-0.5">
                    {b.items.map((it) => (
                      <li key={it} className="text-sm text-foreground/85 font-light">
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          ))}
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
    </div>
  );
};

export default OutdoorSelection;
