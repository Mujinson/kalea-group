import { useRef } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import AnimatedTitle from "@/components/AnimatedTitle";
import SEOHead from "@/components/SEOHead";
import ColorCircleGallery from "@/components/ColorCircleGallery";
import CollectionCarouselCard from "@/components/CollectionCarouselCard";
import TechSpecBar from "@/components/TechSpecBar";
import { getLocalizedCollectionBySlug, getLocalizedCollectionsByCategory } from "@/data/ceramicheCollectionsI18n";


const CeramicaCollectionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useTranslation();
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLDivElement>(null);

  const collection = slug ? getLocalizedCollectionBySlug(slug, language) : undefined;

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(heroProgress, [0, 1], isMobile ? [1, 0.96] : [1, 0.88]);
  const heroBorderRadius = useTransform(heroProgress, [0, 0.5], ["0px", isMobile ? "16px" : "28px"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.3], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.4], [0, isMobile ? -40 : -80]);
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", isMobile ? "8%" : "15%"]);

  if (!collection) {
    return <Navigate to={`/${language}/ceramiche-interni`} replace />;
  }

  const backRoute = `/${language}/${collection.parentRoute}`;
  const backLabel = collection.parentRoute === "ceramiche-esterni"
    ? t('ceramicaDetail.backEsterni')
    : t('ceramicaDetail.backInterni');
  // Translate applications via dictionary (fallback to original string)
  const localizedApps = collection.applications.map((app) => {
    const key = `ceramicaApplications.${app}`;
    const translated = t(key);
    return translated === key ? app : translated;
  });
  const variantsSubtitle = t('ceramicaDetail.variantsSubtitle').replace('{count}', String(collection.variants.length));
  const specsSubtitle = t('ceramicaDetail.specsSubtitle').replace('{name}', collection.name);
  const ctaText = t('ceramicaDetail.ctaText').replace('{name}', collection.name);

  return (
    <div className="relative bg-background">
      <SEOHead
        title={`${collection.name} | Ceramiche Kalēa®`}
        description={`${collection.tagline}. ${collection.description}`}
        keywords={`${collection.name}, ${collection.effect}, gres porcellanato, ceramiche Kalēa, ${collection.applications.join(", ")}`}
      />

      {/* Hero */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0 overflow-hidden origin-center will-change-transform"
          style={{ scale: heroScale, borderRadius: heroBorderRadius }}
        >
          <motion.img
            src={collection.hero}
            alt={`${collection.name} - Kalēa®`}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ y: heroImageY, scale: 1.1 }}
            initial={{ filter: "blur(10px)", scale: 1.15 }}
            animate={{ filter: "blur(0px)", scale: 1.1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
        </motion.div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32">
          <motion.div
            style={{ opacity: heroContentOpacity, y: heroContentY }}
            className="container-custom text-center will-change-transform"
          >
            <div className="max-w-4xl mx-auto">
              <Link
                to={backRoute}
                className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm uppercase tracking-widest mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Link>
              <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/70 mb-3 font-medium">
                {collection.effect}
              </p>
              <AnimatedTitle
                text={collection.name}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-bold mb-4 tracking-tight"
              />
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="text-lg md:text-xl lg:text-2xl text-white/90 font-light max-w-2xl mx-auto italic"
              >
                {collection.tagline}
              </motion.p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex justify-center mt-10"
              >
                <ChevronDown className="w-6 h-6 text-white/60" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="relative z-10 bg-background py-20 md:py-28">
        <div className="container-custom max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary/60 mb-4 font-medium">
              {t('ceramicaDetail.introEyebrow')}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              {t('ceramicaDetail.introTitle')}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {collection.longDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Lifestyle Gallery */}
      {collection.lifestyle.length > 0 && (
        <section className="relative z-10 bg-background py-12 md:py-20">
          <div className="container-custom">
            <div className={`grid gap-4 md:gap-6 ${collection.lifestyle.length === 1 ? "grid-cols-1" : collection.lifestyle.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
              {collection.lifestyle.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="overflow-hidden rounded-2xl group"
                >
                  <img
                    src={img}
                    alt={`${collection.name} - ${i + 1}`}
                    className="w-full h-[280px] md:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Variants Gallery */}
      <section className="relative z-10 bg-background py-20 md:py-28">
        <div className="container-custom">
          <ColorCircleGallery
            title={t('ceramicaDetail.variantsTitle')}
            subtitle={variantsSubtitle}
            colors={collection.variants}
          />
        </div>
      </section>

      {/* Sister collections carousel */}
      {(() => {
        const sisterCategory: "interni" | "esterni" = collection.parentRoute === "ceramiche-esterni" ? "esterni" : "interni";
        const sisters = getLocalizedCollectionsByCategory(sisterCategory, language)
          .filter((c) => c.slug !== collection.slug)
          .map((c) => ({
            id: c.slug,
            name: c.name,
            image: c.hero,
            link: `/${language}/ceramiche/${c.slug}`,
          }));
        if (sisters.length === 0) return null;
        return (
          <CollectionCarouselCard
            title={t('ceramicaDetail.sistersTitle') !== 'ceramicaDetail.sistersTitle' ? t('ceramicaDetail.sistersTitle') : 'Altre collezioni'}
            subtitle={t('ceramicaDetail.sistersSubtitle') !== 'ceramicaDetail.sistersSubtitle' ? t('ceramicaDetail.sistersSubtitle') : 'Esplora la selezione Kalēa®'}
            products={sisters}
          />
        );
      })()}

      {/* Specs — editorial dark bar */}
      <TechSpecBar
        title={t('ceramicaDetail.specsTitle')}
        subtitle={specsSubtitle}
        specs={[
          { label: t('ceramicaDetail.thickness'), value: collection.thickness },
          { label: t('ceramicaDetail.formats'), value: collection.formats.join(" · ") },
          { label: t('ceramicaDetail.effect'), value: collection.effect },
        ]}
        applicationsLabel={t('ceramicaDetail.applications')}
        applications={localizedApps}
        fullSheetLabel={t('ceramicaDetail.fullSheet')}
      />

      {/* CTA */}
      <section className="relative z-10 bg-primary py-20 md:py-28">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-6">
              {t('ceramicaDetail.ctaTitle')}
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              {ctaText}
            </p>
            <Link
              to={`/${language}/contatti`}
              className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-3.5 rounded-full font-medium hover:bg-background/90 transition-colors"
            >
              {t('ceramicaDetail.ctaButton')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CeramicaCollectionDetail;

