import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import AnimatedTitle from "@/components/AnimatedTitle";
import { laminatiCollections } from "@/data/laminatiCollections";
import heroLaminati from "@/assets/laminati/hero.webp";

const IndoorLaminati = () => {
  const { language } = useTranslation();

  return (
    <div className="bg-background">
      <SEOHead
        title="Laminati Tecnici | Pavimenti in Laminato | Kalēa®"
        description="Selezione esclusiva Kalēa® di laminati tecnici: maxi doghe, spina di pesce, tiles effetto pietra e acciaio. Sincroporo, Hydro, alta resistenza AC6 per residenziale e contract."
        keywords="laminati tecnici, pavimenti laminato, laminato spina pesce, laminato AC6, laminato hydro, pavimenti contract"
      />

      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        <img src={heroLaminati} alt="Laminati Tecnici Kalēa" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="relative z-10 h-full container-custom flex flex-col justify-end pb-16 md:pb-24">
          <div className="max-w-3xl">
            <AnimatedTitle
              text="Laminati Tecnici"
              className="text-4xl md:text-6xl lg:text-7xl text-kalea-tan font-bold tracking-tight mb-4"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-base md:text-lg lg:text-xl text-kalea-cream/80 font-light max-w-2xl"
            >
              Selezione esclusiva <span className="whitespace-nowrap">Kalēa®</span> di laminati tecnici.
              Maxi doghe, spina di pesce, tiles materici — sincroporo, hydro e altissima resistenza all'abrasione.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-4">
            Realismo e prestazioni in un'unica superficie
          </h2>
          <p className="text-base md:text-lg text-foreground/70 font-light leading-relaxed">
            Tecnologia sincroporo per riprodurre fedelmente le venature del legno,
            superficie opaca, antistatico, compatibile con riscaldamento a pavimento.
            Posa flottante rapida, ideale per residenziale, hotel, uffici e spazi commerciali.
          </p>
        </div>
      </section>

      <section className="pb-20 md:pb-28 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              Le collezioni Laminato
            </h2>
            <p className="text-base md:text-lg text-foreground/70 font-light max-w-2xl mx-auto">
              Sette linee dalla doga maxi alla spina di pesce, dai tiles materici al laminato di facile posa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {laminatiCollections.map((c, i) => (
              <Link key={c.slug} to={`/${language}/laminati/${c.slug}`} className="block">
                <motion.div
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
                    <p className="text-sm text-kalea-cream/80 mt-1 mb-3">{c.tagline}</p>
                    <span className="inline-flex items-center gap-2 text-kalea-cream/90 text-xs font-medium uppercase tracking-wider">
                      Scopri
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndoorLaminati;
