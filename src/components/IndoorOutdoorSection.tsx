import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import productBiomag from "@/assets/product-biocore-floor-new.jpg";
import cardHypermattAmbient from "@/assets/card-hypermatt-ambient.jpg";
import cardExternoAmbient from "@/assets/card-externo-ambient.jpg";
import cardParquetAmbient from "@/assets/card-parquet-ambient.jpg";
import cardOutdoor from "@/assets/card-outdoor.jpg";
import ceramicheInterni from "@/assets/ceramiche-interni-hero.jpg";
import ceramicheEsterni from "@/assets/ceramiche-esterni-hero.jpg";

interface Surface {
  title: string;
  description: string;
  link?: string;
  image: string;
  comingSoon?: boolean;
}

const IndoorOutdoorSection = () => {
  const { language, t } = useTranslation();

  const surfaces: Surface[] = [
    {
      title: t('surfaces.biomag.title'),
      description: t('surfaces.biomag.description'),
      link: `/${language}/biomag-floor`,
      image: productBiomag,
    },
    {
      title: t('surfaces.hypermatt.title'),
      description: t('surfaces.hypermatt.description'),
      link: `/${language}/biocore-floor`,
      image: cardHypermattAmbient,
    },
    {
      title: t('surfaces.parquet.title'),
      description: t('surfaces.parquet.description'),
      link: `/${language}/indoor`,
      image: cardParquetAmbient,
    },
    {
      title: t('surfaces.externo.title'),
      description: t('surfaces.externo.description'),
      link: `/${language}/outdoor`,
      image: cardExternoAmbient,
    },
    {
      title: t('surfaces.ceramicheInterni.title'),
      description: t('surfaces.ceramicheInterni.description'),
      link: `/${language}/ceramiche-interni`,
      image: ceramicheInterni,
    },
    {
      title: t('surfaces.ceramicheEsterni.title'),
      description: t('surfaces.ceramicheEsterni.description'),
      link: `/${language}/ceramiche-esterni`,
      image: ceramicheEsterni,
    },
  ];

  return (
    <section className="relative min-h-screen bg-background flex flex-col justify-center overflow-hidden px-4 md:px-8 lg:px-12 py-10">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 md:mb-12 max-w-3xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
          {t('surfaces.sectionTitle')}
        </h2>
        <p className="text-base md:text-lg text-foreground/70 font-light">
          {t('surfaces.sectionSubtitle')}
        </p>
      </motion.div>

      {/* 6 Cards Grid - 2x3 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto w-full">
        {surfaces.map((surface, index) => {
          const cardContent = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              whileHover={!surface.comingSoon ? { y: -6, boxShadow: "0 16px 48px rgba(0, 0, 0, 0.25)" } : undefined}
              className={`relative group overflow-hidden rounded-2xl min-h-[220px] sm:min-h-[250px] md:min-h-[280px] ${surface.comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <img
                src={surface.image}
                alt={surface.title}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${surface.comingSoon ? 'opacity-50' : 'group-hover:scale-105'}`}
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)" }}
              />

              {/* Coming Soon badge */}
              {surface.comingSoon && (
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-[10px] md:text-xs font-medium px-3 py-1 rounded-full z-20" style={{ color: "#ffffff" }}>
                  {t('surfaces.comingSoon')}
                </div>
              )}

              <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-6">
                <h3
                  className="text-base md:text-lg lg:text-xl font-heading font-semibold mb-1.5 tracking-wide"
                  style={{ color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
                >
                  {surface.title}
                </h3>
                <p
                  className="text-[11px] md:text-sm leading-relaxed line-clamp-3 mb-2 font-medium"
                  style={{ color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)" }}
                >
                  {surface.description}
                </p>
                {!surface.comingSoon && (
                  <span
                    className="inline-flex items-center gap-2 text-[10px] md:text-xs font-medium transition-all duration-300"
                    style={{ color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}
                  >
                    {t('surfaces.discover')}
                    <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
              </div>
            </motion.div>
          );

          if (surface.comingSoon) {
            return <div key={surface.title}>{cardContent}</div>;
          }

          return (
            <Link key={surface.title} to={surface.link!} className="block">
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Bottom connector text */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="text-center text-sm md:text-base text-foreground/60 font-light max-w-2xl mx-auto mt-8 md:mt-12 leading-relaxed"
      >
        {t('surfaces.bottomText')}
      </motion.p>
    </section>
  );
};

export default IndoorOutdoorSection;
