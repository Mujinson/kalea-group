import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";
import { installers } from "@/data/installers";
import ravaioliLogo from "@/assets/ravaioli-logo.png.asset.json";

import heroImage from "@/assets/posatori-hero.webp.asset.json";
import bandImage from "@/assets/value-timeless-aesthetic.jpg";
import deckingImage from "@/assets/card-externo-ambient.jpg";
// Foto ufficiale Ravaioli Legnami: progetto Wood Court Restaurant, cladding in Western Red Cedar.
import claddingImage from "@/assets/cladding-esterno-ravaioli.webp.asset.json";
import parquetImage from "@/assets/card-parquet-ambient.jpg";

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-medium uppercase tracking-[0.42em] text-foreground/45 md:text-[11px]">
    {children}
  </span>
);

const SectionHead = ({
  index,
  label,
  title,
}: {
  index: string;
  label: string;
  title: string;
}) => (
  <motion.div {...reveal} className="border-t border-kalea-tan/50 pt-5">
    <div className="flex items-baseline justify-between gap-8">
      <span className="font-heading text-xs tabular-nums tracking-[0.3em] text-kalea-tan">
        {index}
      </span>
      <Label>{label}</Label>
    </div>
    <h2 className="mt-7 max-w-4xl font-heading text-3xl font-light leading-[1.05] tracking-[-0.02em] text-foreground md:text-5xl">
      {title}
    </h2>
  </motion.div>
);

const PosatoriCertificati = () => {
  const { language, t } = useTranslation();

  const titles = {
    it: "Posatori certificati Ravaioli Academy — Kalēa® Surface System®",
    en: "Ravaioli Academy certified installers — Kalēa® Surface System®",
    de: "Zertifizierte Verleger der Ravaioli Academy — Kalēa® Surface System®",
    fr: "Poseurs certifiés Ravaioli Academy — Kalēa® Surface System®",
  } as const;

  const descriptions = {
    it: "Tutti i posatori Kalēa® sono certificati Ravaioli Academy in decking, cladding e parquet. Stesso protocollo di posa, stesso controllo, in ogni cantiere.",
    en: "Every Kalēa® installer is certified by Ravaioli Academy in decking, cladding and parquet. The same installation protocol and the same checks on every site.",
    de: "Alle Kalēa®-Verleger sind von der Ravaioli Academy in Decking, Cladding und Parkett zertifiziert. Dasselbe Verlegeprotokoll, dieselbe Kontrolle auf jeder Baustelle.",
    fr: "Tous les poseurs Kalēa® sont certifiés Ravaioli Academy en decking, cladding et parquet. Le même protocole de pose et les mêmes contrôles sur chaque chantier.",
  } as const;

  const sectors = [
    { key: "Decking", image: deckingImage },
    { key: "Cladding", image: claddingImage.url },
    { key: "Parquet", image: parquetImage },
  ];

  const pathSteps = ["01", "02", "03", "04"];
  const principles = ["01", "02", "03", "04"];
  const specs = ["01", "02", "03", "04"];

  return (
    <>
      <SEOHead
        title={titles[language]}
        description={descriptions[language]}
        canonicalPath={`/${language}/posatori-certificati`}
      />

      <HeroSection
        title={t("installersPage.heroTitle")}
        subtitle={t("installersPage.heroSubtitle")}
        backgroundImage={heroImage.url}
        backgroundPosition="center 68%"
        minHeight="min-h-[36rem] lg:min-h-[70vh]"
        overlayClassName="bg-gradient-to-b from-kalea-dark/85 via-kalea-dark/60 to-kalea-dark/90"
        ctaPrimary={{
          text: t("installersPage.heroCta"),
          link: `/${language}/contatti`,
        }}
      />

      {/* ===== Spec strip ===== */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid border-b border-kalea-tan/40 md:grid-cols-4">
            {specs.map((key, i) => (
              <motion.div
                key={key}
                {...reveal}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="border-b border-kalea-tan/30 px-2 py-8 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-8"
              >
                <p className="font-heading text-2xl font-light tabular-nums tracking-[-0.02em] text-foreground md:text-3xl">
                  {t(`installersPage.spec${key}.value`)}
                </p>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.32em] text-foreground/50 md:text-[11px]">
                  {t(`installersPage.spec${key}.label`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Manifesto ===== */}
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            index="01"
            label={t("installersPage.manifestoLabel")}
            title={t("installersPage.manifestoTitle")}
          />
          <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-2">
            {principles.map((key, i) => (
              <motion.div
                key={key}
                {...reveal}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="border-t border-kalea-tan/30 pt-6"
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-heading text-xs tabular-nums tracking-[0.3em] text-kalea-tan">
                    {key}
                  </span>
                  <h3 className="font-heading text-xl font-light tracking-[-0.01em] text-foreground md:text-2xl">
                    {t(`installersPage.principle${key}Title`)}
                  </h3>
                </div>
                <p className="mt-4 max-w-xl pl-0 text-sm font-light leading-relaxed text-foreground/70 md:pl-[2.6rem] md:text-base">
                  {t(`installersPage.principle${key}Text`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Team ===== */}
      <section className="bg-background pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            index="02"
            label={t("installersPage.teamLabel")}
            title={t("installersPage.teamTitle")}
          />
          <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-foreground/70 md:text-base">
            {t("installersPage.teamIntro")}
          </p>

          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {installers.map((person, i) => (
              <motion.article
                key={person.id}
                {...reveal}
                transition={{ duration: 0.65, delay: (i % 3) * 0.08 }}
                className="group"
              >
                <div className="relative overflow-hidden bg-kalea-cream/40">
                  <img
                    src={person.photo}
                    alt={person.name}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover grayscale-[0.35] transition duration-[900ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0 sm:aspect-[3/4]"
                  />
                  <span className="absolute left-4 top-4 font-heading text-[11px] tabular-nums tracking-[0.3em] text-kalea-cream/90">
                    {person.id}
                  </span>
                  <span className="absolute inset-x-4 bottom-4 h-px bg-kalea-cream/40" />
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-kalea-tan/40 pt-4">
                  <h3 className="whitespace-nowrap font-heading text-lg font-light tracking-[-0.01em] text-foreground">
                    {person.name}
                  </h3>
                  <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.28em] text-foreground/45">
                    {t(`installersPage.specialty.${person.specialty}`)}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                  <span className="tabular-nums">
                    {person.years} {t("installersPage.yearsSuffix")}
                  </span>
                  <span className="h-2.5 w-px bg-kalea-tan" aria-hidden="true" />
                  <span className="whitespace-nowrap">{person.base}</span>
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Certification path ===== */}
      <section className="bg-kalea-dark py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div {...reveal} className="border-t border-kalea-cream/20 pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-6">
              <span className="font-heading text-xs tabular-nums tracking-[0.3em] text-kalea-tan">
                03
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.42em] text-kalea-cream/50 md:text-[11px]">
                {t("installersPage.pathLabel")}
              </span>
            </div>
            <h2 className="mt-7 max-w-3xl font-heading text-3xl font-light leading-[1.05] tracking-[-0.02em] text-kalea-tan md:text-5xl">
              {t("installersPage.pathTitle")}
            </h2>
          </motion.div>

          <div className="mt-14">
            {pathSteps.map((key, i) => (
              <motion.div
                key={key}
                {...reveal}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="grid gap-4 border-t border-kalea-cream/15 py-7 md:grid-cols-[72px_260px_1fr] md:items-baseline md:gap-8"
              >
                <span className="font-heading text-xs tabular-nums tracking-[0.3em] text-kalea-tan/70">
                  {key}
                </span>
                <h3 className="font-heading text-lg font-light tracking-[-0.01em] text-kalea-tan md:text-xl">
                  {t(`installersPage.path${key}Title`)}
                </h3>
                <p className="max-w-2xl text-sm font-light leading-relaxed text-kalea-cream/75">
                  {t(`installersPage.path${key}Text`)}
                </p>
              </motion.div>
            ))}
            <div className="border-t border-kalea-cream/15" />
          </div>

          <motion.div
            {...reveal}
            className="mt-14 flex flex-wrap items-center justify-between gap-8 border-t border-kalea-cream/20 pt-8"
          >
            <img
              src={ravaioliLogo.url}
              alt="Ravaioli Academy"
              className="h-16 w-auto object-contain md:h-20"
              loading="lazy"
            />
            <p className="max-w-md text-sm font-light leading-relaxed text-kalea-cream/75">
              {t("installersPage.pathNote")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== Sectors ===== */}
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            index="04"
            label={t("installersPage.sectorsLabel")}
            title={t("installersPage.sectorsTitle")}
          />
          <div className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-3">
            {sectors.map(({ key, image }, i) => (
              <motion.div
                key={key}
                {...reveal}
                transition={{ duration: 0.65, delay: i * 0.08 }}
                className="group"
              >
                <div className="overflow-hidden bg-kalea-cream/40">
                  <img
                    src={image}
                    alt={t(`installersPage.specialty.${key.toLowerCase()}`)}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover grayscale-[0.3] transition duration-[900ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                  />
                </div>
                <div className="mt-5 border-t border-kalea-tan/40 pt-4">
                  <h3 className="whitespace-nowrap font-heading text-lg font-light tracking-[-0.01em] text-foreground">
                    {t(`installersPage.sector${key}Title`)}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-foreground/70">
                    {t(`installersPage.sector${key}Text`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Band ===== */}
      <section className="relative overflow-hidden">
        <img
          src={bandImage}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-kalea-dark/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
          <motion.blockquote {...reveal} className="max-w-4xl">
            <p className="font-heading text-2xl font-light leading-[1.25] tracking-[-0.02em] text-kalea-tan md:text-4xl">
              {t("installersPage.bandQuote")}
            </p>
            <footer className="mt-8 text-[10px] font-medium uppercase tracking-[0.42em] text-kalea-cream/60 md:text-[11px]">
              {t("installersPage.bandAuthor")}
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            {...reveal}
            className="grid gap-10 border-y border-kalea-tan/40 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-2 md:py-14"
          >
            <div>
              <h2 className="max-w-2xl font-heading text-2xl font-light leading-[1.15] tracking-[-0.02em] text-foreground md:text-4xl">
                {t("installersPage.ctaTitle")}
              </h2>
              <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-foreground/70 md:text-base">
                {t("installersPage.ctaText")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                to={`/${language}/contatti`}
                className="group inline-flex items-center gap-3 whitespace-nowrap border border-foreground/25 px-7 py-4 text-xs font-medium uppercase tracking-[0.24em] text-foreground transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
              >
                {t("installersPage.ctaPrimary")}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to={`/${language}/servizi/fornitura-e-posa`}
                className="group inline-flex items-center gap-2 whitespace-nowrap border-b border-foreground/30 pb-1 text-xs font-medium uppercase tracking-[0.24em] text-foreground/75 transition-colors duration-300 hover:border-foreground hover:text-foreground"
              >
                {t("installersPage.ctaSecondary")}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default PosatoriCertificati;
