import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RelatedItem {
  slug: string;
  name: string;
  tagline?: string;
  image: string;
}

interface RelatedCollectionsProps {
  /** Full collection list (will be filtered to exclude currentSlug) */
  items: RelatedItem[];
  currentSlug: string;
  /** Path prefix WITHOUT language, e.g. "/indoor/spc" or "/biowall" */
  basePath: string;
  /** Optional override title */
  title?: string;
  /** Optional override eyebrow */
  eyebrow?: string;
  /** Max number of cards to show (default 4) */
  limit?: number;
}

const RelatedCollections = ({
  items,
  currentSlug,
  basePath,
  title,
  eyebrow,
  limit = 4,
}: RelatedCollectionsProps) => {
  const { language } = useLanguage();

  const others = items.filter((i) => i.slug !== currentSlug).slice(0, limit);
  if (others.length === 0) return null;

  const labels: Record<string, { eyebrow: string; title: string; cta: string }> = {
    it: { eyebrow: "Continua a esplorare", title: "Altre collezioni che potrebbero interessarti", cta: "Scopri" },
    en: { eyebrow: "Keep exploring", title: "Other collections you may like", cta: "Discover" },
    de: { eyebrow: "Weiter entdecken", title: "Weitere Kollektionen, die Sie interessieren könnten", cta: "Entdecken" },
    fr: { eyebrow: "Continuer à explorer", title: "Autres collections qui pourraient vous intéresser", cta: "Découvrir" },
  };
  const l = labels[language] ?? labels.it;

  return (
    <section className="relative z-[1] bg-background py-20 md:py-28 px-4 md:px-8 lg:px-12 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-foreground/50 mb-3">
            {eyebrow ?? l.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            {title ?? l.title}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {others.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/${language}${basePath}/${c.slug}`}
                className="group block relative aspect-[4/5] overflow-hidden rounded-2xl bg-foreground/5"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-heading font-semibold text-kalea-tan whitespace-nowrap overflow-hidden text-ellipsis">
                    {c.name}
                  </h3>
                  {c.tagline && (
                    <p className="text-xs md:text-sm text-kalea-cream/80 font-light line-clamp-1 mt-0.5">
                      {c.tagline}
                    </p>
                  )}
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-kalea-tan opacity-0 group-hover:opacity-100 transition-opacity">
                    {l.cta} <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedCollections;
