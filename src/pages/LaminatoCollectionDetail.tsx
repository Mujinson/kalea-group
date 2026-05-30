import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import AnimatedTitle from "@/components/AnimatedTitle";
import TechSpecBar from "@/components/TechSpecBar";
import CollectionColorsSection from "@/components/CollectionColorsSection";
import { getLaminatoCollection, laminatiCollections } from "@/data/laminatiCollections";
import RelatedCollections from "@/components/RelatedCollections";
import { effettoFromFiniture, spessoreFromFormats, formatiFromFormats } from "@/lib/effetto";

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
          { label: "Spessore", value: spessoreFromFormats(collection.formats, "Laminato") },
          { label: "Effetto", value: effettoFromFiniture(collection.finishes, collection.name, "Legno") },
          { label: "Formato", value: formatiFromFormats(collection.formats) },
        ]}
        applications={collection.caratteristiche ?? collection.applicazioni}
        effectStory={collection.effectStory}
        effectStoryTitle={collection.effectStoryTitle}
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


      <RelatedCollections
        items={laminatiCollections}
        currentSlug={collection.slug}
        basePath="/laminati"
      />
    </div>
  );
};

export default LaminatoCollectionDetail;
