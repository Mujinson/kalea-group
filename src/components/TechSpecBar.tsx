import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface TechSpec {
  label: string;
  value: string;
}

interface TechSpecBarProps {
  title: string;
  subtitle?: string;
  specs: TechSpec[];
  applicationsLabel?: string;
  applications?: string[];
  fullSheetHref?: string;
  fullSheetLabel?: string;
  className?: string;
}

/**
 * Editorial dark spec bar — luxury flooring style (Porcelanosa / Mutina).
 * Used across product pages to present technical specifications.
 */
const TechSpecBar = ({
  title,
  subtitle,
  specs,
  applicationsLabel,
  applications,
  fullSheetHref,
  fullSheetLabel,
  className = "",
}: TechSpecBarProps) => {
  return (
    <section
      className={`relative bg-kalea-dark text-white overflow-hidden ${className}`}
    >
      {/* Bottom fade to transparent for seamless blend with the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-background/40" />

      <div className="container-custom py-14 md:py-[56px]">
        {/* Heading — left aligned with sidebar accent line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-start gap-4 mb-10 md:mb-14"
        >
          <span
            aria-hidden
            className="mt-2 md:mt-3 block h-[2px] w-10 md:w-14 bg-kalea-tan flex-shrink-0"
          />
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold tracking-tight text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm md:text-base text-white/60 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </motion.div>

        {/* Spec columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 md:divide-x md:divide-white/30">
          {specs.map((spec, i) => (
            <motion.div
              key={`${spec.label}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="px-0 md:px-6 lg:px-8 first:md:pl-0"
            >
              <p
                className="uppercase text-white/60 font-medium"
                style={{ fontSize: "11px", letterSpacing: "0.15em" }}
              >
                {spec.label}
              </p>
              <p className="mt-3 text-white font-semibold leading-tight text-[22px] md:text-[24px] lg:text-[26px]">
                {spec.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Applications row */}
        {applications && applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-white/15"
          >
            {applicationsLabel && (
              <p
                className="uppercase text-white/60 font-medium mb-4"
                style={{ fontSize: "11px", letterSpacing: "0.15em" }}
              >
                {applicationsLabel}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
              {applications.map((app, i) => (
                <span key={`${app}-${i}`} className="flex items-center gap-x-2">
                  <span
                    className="inline-block px-3.5 py-1.5 text-xs md:text-sm border border-white/40 text-white rounded-full transition-colors duration-200 hover:bg-white hover:text-kalea-dark cursor-default"
                  >
                    {app}
                  </span>
                  {i < applications.length - 1 && (
                    <span className="text-white/30 select-none" aria-hidden>
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Optional full sheet link */}
        {fullSheetHref && (
          <div className="mt-8 flex justify-end">
            <a
              href={fullSheetHref}
              target={fullSheetHref.startsWith("http") ? "_blank" : undefined}
              rel={fullSheetHref.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <span className="border-b border-white/30 group-hover:border-white pb-0.5">
                {fullSheetLabel || "Scheda tecnica completa"}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default TechSpecBar;
