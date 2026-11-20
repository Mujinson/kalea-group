import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import ravaioliLogo from "@/assets/ravaioli-logo.png.asset.json";

const CertifiedInstallersSection = () => {
  const { language, t } = useTranslation();

  const tags = [
    t("home.certification.tags.decking"),
    t("home.certification.tags.cladding"),
    t("home.certification.tags.parquet"),
  ];

  return (
    <section className="relative bg-background pb-16 pt-2 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to={`/${language}/servizi/fornitura-e-posa`}
            className="group grid border-y border-kalea-tan/40 bg-kalea-cream/30 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]"
          >
            <div className="flex items-center justify-center border-b border-kalea-tan/30 px-8 py-8 md:border-b-0 md:border-r md:py-12">
              <img
                src={ravaioliLogo.url}
                alt="Ravaioli Academy"
                className="h-24 w-32 object-contain transition-transform duration-500 group-hover:scale-105 md:h-28 md:w-36"
                loading="lazy"
              />
            </div>

            <div className="min-w-0 px-6 py-8 md:px-10 md:py-10 lg:px-14 lg:py-12">
              <div className="flex items-start justify-between gap-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-foreground/55 md:text-xs">
                  {t("home.certification.eyebrow")}
                </p>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground/20 text-foreground transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>

              <h2 className="mt-4 max-w-4xl font-heading text-3xl font-light leading-[1.08] text-foreground md:text-4xl lg:text-[2.75rem]">
                {t("home.certification.title")}
              </h2>
              <p className="mt-5 max-w-2xl text-sm font-normal leading-relaxed text-foreground/70 md:text-base">
                {t("home.certification.description")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 md:mt-10">
                {tags.map((tag, index) => (
                  <span key={tag} className="flex items-center gap-4">
                    {index > 0 && <span className="h-3 w-px bg-kalea-tan" aria-hidden="true" />}
                    <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.2em] text-foreground/80">
                      {tag}
                    </span>
                  </span>
                ))}
              </div>

              <span className="mt-8 inline-flex items-center gap-2 border-b border-foreground/30 pb-1 text-sm tracking-wide text-foreground/80 transition-colors group-hover:border-foreground group-hover:text-foreground">
                {t("home.certification.link")}
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CertifiedInstallersSection;
