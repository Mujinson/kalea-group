import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import AnimatedTitle from "@/components/AnimatedTitle";
import TechSpecBar from "@/components/TechSpecBar";
import CollectionColorsSection from "@/components/CollectionColorsSection";
import { getLaminatoCollection } from "@/data/laminatiCollections";

const LaminatoCollectionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useTranslation();
  const collection = slug ? getLaminatoCollection(slug) : undefined;

  if (!collection) return <Navigate to={`/${language}/indoor/laminati`} replace />;

  return (
    <div className="bg-background">
      <SEOHead
        title={`${collection.name} | Laminati Tecnici | Kalēa®`}
        description={collection.description.slice(0, 155)}
      />

      <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden">
        <img src={collection.image} alt={collection.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/75" />
        <div className="relative z-10 h-full container-custom flex flex-col justify-end pb-16 md:pb-24">
          <Link
            to={`/${language}/indoor/laminati`}
            className="inline-flex items-center gap-2 text-kalea-cream/80 hover:text-kalea-tan text-xs uppercase tracking-wider mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Laminati Tecnici
          </Link>
          <AnimatedTitle
            text={collection.name}
            className="text-5xl md:text-7xl lg:text-8xl text-kalea-tan font-bold tracking-tight mb-3"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-kalea-cream/85 font-light italic"
          >
            {collection.tagline}
          </motion.p>
        </div>
      </section>

      <CollectionColorsSection slug={collection.slug} collectionName={collection.name} />

      <TechSpecBar
        title={collection.name}
        subtitle={collection.tagline}
        specs={[
          { label: "Tipologia", value: "Laminato tecnico" },
          { label: "Caratteristica", value: collection.finishes[0] ?? "—" },
          { label: "Formati", value: collection.formats.join(" · ") },
        ]}
        applications={collection.applicazioni}
      />

      <section className="py-20 md:py-28 px-4 md:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-lg md:text-xl text-foreground/80 font-light leading-relaxed"
          >
            {collection.description}
          </motion.p>
        </div>
      </section>

      <section className="pb-20 md:pb-28 px-4 md:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: "Formati", items: collection.formats },
            { title: "Finiture", items: collection.finishes },
            { title: "Applicazioni", items: collection.applicazioni },
          ].map((block, i) => (
            <motion.div
              key={block.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 md:p-7 border border-border/40"
            >
              <h3 className="text-xs uppercase tracking-widest text-foreground/50 mb-3">{block.title}</h3>
              <ul className="space-y-1.5">
                {block.items.map((it) => (
                  <li key={it} className="text-base text-foreground/85 font-light">
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <CollectionColorsSection slug={collection.slug} collectionName={collection.name} />
    </div>
  );
};

export default LaminatoCollectionDetail;
