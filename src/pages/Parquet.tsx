import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import AnimatedTitle from "@/components/AnimatedTitle";
import { parquetCollections } from "@/data/parquetCollections";
import heroParquet from "@/assets/card-parquet-ambient.jpg";

const Parquet = () => {
  const { language } = useTranslation();

  return (
    <div className="bg-background">
      <SEOHead
        title="Parquet | Collezioni in Rovere e Legni Pregiati | Kalēa®"
        description="Scopri le collezioni di parquet Kalēa®: rovere e legni pregiati, plance, spine e finiture artigianali per ambienti dal carattere autentico."
        keywords="parquet, parquet rovere, pavimenti in legno, plancia, spina italiana, spina ungherese, parquet luxury"
      />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        <img
          src={heroParquet}
          alt="Parquet Kalēa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="relative z-10 h-full container-custom flex flex-col justify-end pb-16 md:pb-24">
          <div className="max-w-3xl">
            <AnimatedTitle
              text="Parquet"
              className="text-4xl md:text-6xl lg:text-7xl text-kalea-tan font-bold tracking-tight mb-4"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-base md:text-lg lg:text-xl text-kalea-cream/80 font-light max-w-2xl"
            >
              Collezioni in rovere e legni pregiati. Plance, spine e finiture
              artigianali per progetti d'autore.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Collections grid */}
      <section className="py-20 md:py-28 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
              Le nostre collezioni
            </h2>
            <p className="text-base md:text-lg text-foreground/70 font-light max-w-2xl mx-auto">
              Nove linee di parquet, ciascuna con la sua identità: dal segno
              minimale alle tonalità più materiche.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {parquetCollections.map((c, i) => (
              <Link
                key={c.slug}
                to={`/${language}/parquet/${c.slug}`}
                className="block"
              >
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
                    <p className="text-sm text-kalea-cream/80 mt-1 mb-3">
                      {c.tagline}
                    </p>
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

export default Parquet;
