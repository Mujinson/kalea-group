import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

type Lang = "it" | "en" | "de" | "fr" | string;

interface Props {
  language: Lang;
  nextSectionId: string;
}

const KaleaWord = () => (
  <span className="whitespace-nowrap">
    Kalēa<sup className="text-[0.5em] align-super">®</sup>
  </span>
);

const lines: Record<string, ReactNode[]> = {
  it: [
    <>Siamo <KaleaWord />.</>,
    <>Selezioniamo, integriamo e installiamo superfici di prima qualità.</>,
    <>Pavimenti. Ceramiche. Parquet. Outdoor.</>,
    <>Ogni superficie è una scelta di qualità, durata e design.</>,
    <>Una continuità che parla la lingua dell'architettura.</>,
  ],
  en: [
    <>We are <KaleaWord />.</>,
    <>We select, integrate and install premium surfaces.</>,
    <>Floors. Ceramics. Parquet. Outdoor.</>,
    <>Every surface is a choice of quality, durability and design.</>,
    <>A continuity that speaks the language of architecture.</>,
  ],
  de: [
    <>Wir sind <KaleaWord />.</>,
    <>Wir wählen, integrieren und verlegen erstklassige Oberflächen.</>,
    <>Böden. Keramik. Parkett. Outdoor.</>,
    <>Jede Oberfläche ist eine Entscheidung für Qualität, Langlebigkeit und Design.</>,
    <>Eine Kontinuität, die die Sprache der Architektur spricht.</>,
  ],
  fr: [
    <>Nous sommes <KaleaWord />.</>,
    <>Nous sélectionnons, intégrons et posons des surfaces de premier choix.</>,
    <>Sols. Céramiques. Parquet. Outdoor.</>,
    <>Chaque surface est un choix de qualité, durabilité et design.</>,
    <>Une continuité qui parle le langage de l'architecture.</>,
  ],
};

const labels: Record<string, { eyebrow: string; cta: string; paragraph: string }> = {
  it: {
    eyebrow: "Chi siamo",
    cta: "Scopri Kalēa®",
    paragraph:
      "Kalēa® porta nel progetto una nuova idea di superficie: selezione curata, posa precisa, accompagnamento dall'idea al cantiere. Un partner unico per chi non scende a compromessi sull'estetica e sulla durata.",
  },
  en: {
    eyebrow: "About us",
    cta: "Discover Kalēa®",
    paragraph:
      "Kalēa® brings a new idea of surface into every project: curated selection, precise installation, support from concept to site. A single partner for those who do not compromise on aesthetics or durability.",
  },
  de: {
    eyebrow: "Über uns",
    cta: "Kalēa® entdecken",
    paragraph:
      "Kalēa® steht für eine neue Idee von Oberfläche im Projekt: kuratierte Auswahl, präzise Verlegung, Begleitung von der Idee bis zur Baustelle. Ein einziger Partner für alle, die bei Ästhetik und Haltbarkeit keine Kompromisse eingehen.",
  },
  fr: {
    eyebrow: "À propos",
    cta: "Découvrir Kalēa®",
    paragraph:
      "Kalēa® apporte une nouvelle idée de la surface dans chaque projet : sélection soignée, pose précise, accompagnement de l'idée au chantier. Un partenaire unique pour ceux qui ne transigent ni sur l'esthétique ni sur la durabilité.",
  },
};

const ChiSiamoManifesto = ({ language, nextSectionId }: Props) => {
  const lang = (["it", "en", "de", "fr"].includes(language) ? language : "it") as keyof typeof lines;
  const sectionRef = useRef<HTMLElement>(null);
  const phrases = lines[lang];
  const t = labels[lang];

  // Subtle parallax on the paper sheet as user scrolls through the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const sheetY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const sheetRotate = useTransform(scrollYProgress, [0, 1], [-0.4, 0.4]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden h-screen flex items-center justify-center"
      style={{
        backgroundColor: "#FBF6EC",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(140,123,107,0.04) 0px, rgba(140,123,107,0.04) 1px, transparent 1px, transparent 6px), radial-gradient(circle at 15% 8%, rgba(140,123,107,0.07), transparent 55%), radial-gradient(circle at 85% 92%, rgba(140,123,107,0.06), transparent 55%)",
      }}
    >
      {/* Ambient warm vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(140,123,107,0.10) 0%, rgba(247,241,231,0) 70%)",
        }}
      />

      <div className="relative w-full px-6 md:px-12 lg:px-16">
        <motion.div
          style={{ y: sheetY, rotate: sheetRotate }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="relative px-2 sm:px-6 md:px-10 py-4">

            {/* Manifesto lines */}
            <div className="space-y-3 md:space-y-4 text-center">
              {phrases.map((line, i) => (
                <motion.p
                  key={`${lang}-${i}`}
                  initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: 1.1,
                    delay: i * 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-base md:text-lg lg:text-xl font-heading font-light leading-snug text-foreground"
                  style={{ letterSpacing: "0.005em" }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Animated divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="my-6 md:my-8 mx-auto h-px w-20 origin-left bg-foreground/30"
            />

            {/* Descriptive paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xs md:text-sm text-foreground/65 font-light leading-relaxed max-w-2xl mx-auto text-center italic"
            >
              {t.paragraph}
            </motion.p>

            {/* Signature-style CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 md:mt-8 text-center"
            >
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(nextSectionId)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="group relative inline-flex items-center gap-3 text-xs md:text-sm tracking-[0.3em] uppercase text-foreground/70 hover:text-foreground transition-colors"
              >
                <span className="relative pb-1">
                  {t.cta}
                  <span className="absolute left-0 bottom-0 h-px w-full bg-foreground/30 origin-left scale-x-100 transition-transform duration-500" />
                  <span className="absolute left-0 bottom-0 h-px w-full bg-foreground origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </span>
                <motion.span
                  aria-hidden
                  initial={{ y: 0 }}
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-foreground/50 group-hover:text-foreground"
                >
                  ↓
                </motion.span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChiSiamoManifesto;
