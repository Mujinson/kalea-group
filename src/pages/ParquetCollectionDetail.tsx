import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import AnimatedTitle from "@/components/AnimatedTitle";
import CollectionColorsSection from "@/components/CollectionColorsSection";
import {
  getParquetCollection,
  parquetCollections,
} from "@/data/parquetCollections";

const ParquetCollectionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useTranslation();
  const collection = slug ? getParquetCollection(slug) : undefined;

  if (!collection) {
    return <Navigate to={`/${language}/parquet`} replace />;
  }

  const others = parquetCollections.filter((c) => c.slug !== collection.slug).slice(0, 4);

  return (
    <div className="bg-background">
      <SEOHead
        title={`Parquet ${collection.name} | Kalēa®`}
        description={collection.description}
        keywords={`parquet ${collection.name}, ${collection.tagline}, parquet rovere, pavimenti in legno`}
      />

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
        <img
          src={collection.image}
          alt={`Parquet ${collection.name}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/80" />

        <div className="relative z-10 h-full container-custom flex flex-col justify-between py-10 md:py-14">
          <Link
            to={`/${language}/parquet`}
            className="inline-flex items-center gap-2 text-kalea-cream/90 hover:text-kalea-tan text-sm font-medium w-fit"
          >
            <ArrowLeft size={16} /> Tutte le collezioni
          </Link>

          <div className="max-w-3xl">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-kalea-cream/70 mb-3">
              Collezione Parquet
            </p>
            <AnimatedTitle
              text={collection.name}
              className="text-5xl md:text-7xl lg:text-8xl text-kalea-tan font-bold tracking-tight mb-4 whitespace-nowrap"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-lg md:text-2xl text-kalea-cream/85 font-light"
            >
              {collection.tagline}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Description + specs */}
      <section className="py-20 md:py-28 px-4 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-5">
              L'identità della collezione
            </h2>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-light">
              {collection.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-3">
                Formati
              </h3>
              <ul className="space-y-2">
                {collection.formats.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground/80">
                    <Check size={18} className="text-foreground/60 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-3">
                Finiture disponibili
              </h3>
              <ul className="space-y-2">
                {collection.finishes.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground/80">
                    <Check size={18} className="text-foreground/60 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to={`/${language}/contatti`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              Richiedi informazioni
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Other collections */}
      <section className="pb-20 md:pb-28 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8">
            Altre collezioni
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {others.map((c) => (
              <Link
                key={c.slug}
                to={`/${language}/parquet/${c.slug}`}
                className="group block relative overflow-hidden rounded-xl"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <h3 className="absolute bottom-3 left-4 right-4 text-base md:text-lg font-heading font-semibold text-kalea-tan whitespace-nowrap">
                  {c.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CollectionColorsSection slug={collection.slug} collectionName={collection.name} />
    </div>
  );
};

export default ParquetCollectionDetail;
