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
    <section className="relative bg-background py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to={`/${language}/servizi/fornitura-e-posa`}
            className="group relative block overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-[0_10px_40px_rgba(74,42,19,0.06)] transition-shadow duration-300 hover:shadow-[0_18px_60px_rgba(74,42,19,0.12)]"
          >
            <div className="grid grid-cols-1 items-center gap-8 p-8 md:grid-cols-[auto_1fr_auto] md:gap-12 md:p-12 lg:p-14">
              {/* Ravaioli Academy mark */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-background p-4 md:h-28 md:w-28 md:p-5">
                <img
                  src={ravaioliLogo.url}
                  alt="Ravaioli Academy"
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>

              {/* Message */}
              <div className="min-w-0">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-foreground/50 md:text-sm">
                  {t("home.certification.eyebrow")}
                </p>
                <h2 className="font-heading text-xl font-semibold leading-tight text-foreground md:text-2xl lg:text-[1.75rem]">
                  {t("home.certification.title")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-normal text-foreground/75 md:text-base">
                  {t("home.certification.description")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="whitespace-nowrap rounded-full border border-foreground/15 px-4 py-1.5 text-xs font-medium text-foreground/85 md:text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <span className="hidden shrink-0 items-center gap-2 border-b border-foreground/30 pb-1 text-sm tracking-wide text-foreground/80 transition-colors group-hover:border-foreground md:inline-flex">
                {t("home.certification.link")}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CertifiedInstallersSection;
