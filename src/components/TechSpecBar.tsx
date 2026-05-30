import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export interface TechSpec {
  label: string;
  value: string;
}

export type TechApplication = string | { label: string; description?: string };

interface TechSpecBarProps {
  title: string;
  subtitle?: string;
  specs: TechSpec[];
  applicationsLabel?: string;
  applications?: TechApplication[];
  effectStory?: string;
  effectStoryTitle?: string;
  fullSheetHref?: string;
  fullSheetLabel?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Brand palette (locked to spec — intentionally not theme tokens)     */
/* ------------------------------------------------------------------ */
const CREAM = "#F5F0EA";
const GOLD = "#C8A96E";
const DARK = "#3B2314";
const MUTED = "#8C7B6B";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const FORMAT_KEY = /(format|formati|formate|formats)/i;
const APPLICATION_KEY = /(applic|anwend|applica)/i;

/** Parse a value string into [numeric, suffix]. Returns null if no numeric prefix. */
function parseNumeric(value: string): { num: number; suffix: string } | null {
  const match = value.match(/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(",", "."));
  if (Number.isNaN(num)) return null;
  return { num, suffix: match[2].trim() };
}

/** Animated counter — runs once when the element enters the viewport */
function AnimatedNumber({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string>(() => {
    const p = parseNumeric(value);
    return p ? `0${p.suffix ? " " + p.suffix : ""}` : value;
  });
  const startedRef = useRef(false);

  useEffect(() => {
    const parsed = parseNumeric(value);
    if (!parsed) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || startedRef.current) return;
          startedRef.current = true;
          const startTs = performance.now();
          const isInt = Number.isInteger(parsed.num);
          const tick = (now: number) => {
            const t = Math.min(1, (now - startTs) / duration);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            const current = parsed.num * eased;
            const formatted = isInt
              ? Math.round(current).toString()
              : current.toFixed(1).replace(".", ",");
            setDisplay(`${formatted}${parsed.suffix ? " " + parsed.suffix : ""}`);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
const TechSpecBar = ({
  title,
  subtitle,
  specs,
  applicationsLabel,
  applications,
  effectStory,
  effectStoryTitle,
  fullSheetHref,
  fullSheetLabel,
  className = "",
}: TechSpecBarProps) => {
  const { t } = useTranslation();

  /* ---------- derive tabbed content from generic specs[] ---------- */
  const formatSpec = useMemo(
    () => specs.find((s) => FORMAT_KEY.test(s.label)),
    [specs]
  );
  const formats = useMemo(() => {
    if (!formatSpec) return [];
    // Split only on explicit separators (· / |). Do NOT split on "," — it is a decimal separator in IT/DE/FR.
    return formatSpec.value
      .split(/·|\/|\|/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [formatSpec]);

  const effectSpecs = useMemo(
    () =>
      specs.filter(
        (s) => !FORMAT_KEY.test(s.label) && !APPLICATION_KEY.test(s.label)
      ),
    [specs]
  );

  /* ---------- counter cards (top of section) ---------- */
  const counterCards = specs.slice(0, 4);

  /* ---------- tab state ---------- */
  type TabKey = "formats" | "effect" | "applications";
  const availableTabs: { key: TabKey; label: string }[] = [];
  if (formats.length > 0)
    availableTabs.push({ key: "formats", label: t("techSpec.tabFormats") });
  if (effectSpecs.length > 0)
    availableTabs.push({ key: "effect", label: t("techSpec.tabEffect") });
  if (applications && applications.length > 0)
    availableTabs.push({ key: "applications", label: t("techSpec.tabApplications") });

  const [activeTab, setActiveTab] = useState<TabKey>(
    availableTabs[0]?.key ?? "formats"
  );
  const [selectedFormatIdx, setSelectedFormatIdx] = useState(0);
  const [selectedEffectIdx, setSelectedEffectIdx] = useState(0);
  const [selectedAppIdx, setSelectedAppIdx] = useState<number | null>(0);

  /* ---------- compute surface area for selected format ---------- */
  const selectedSurface = useMemo(() => {
    const fmt = formats[selectedFormatIdx];
    if (!fmt) return null;
    // try to extract two numbers (cm or mm). Examples: "60×60", "228,6×1524 mm"
    const nums = fmt
      .replace(/mm|cm/gi, "")
      .split(/[×x]/i)
      .map((n) => parseFloat(n.replace(",", ".").trim()))
      .filter((n) => !Number.isNaN(n));
    if (nums.length < 2) return null;
    const isMillimeters = /mm/i.test(fmt) || nums[0] > 200;
    const divisor = isMillimeters ? 1_000_000 : 10_000; // mm² or cm² → m²
    const area = (nums[0] * nums[1]) / divisor;
    return area.toFixed(area < 1 ? 3 : 2).replace(".", ",");
  }, [formats, selectedFormatIdx]);

  /* ---------- effect swatch palettes (purely decorative) ---------- */
  const effectSwatches = useMemo(
    () =>
      effectSpecs.slice(0, 3).map((s, i) => ({
        label: s.value,
        gradient: [
          "linear-gradient(135deg,#D9C7A7 0%,#A88B5C 100%)",
          "linear-gradient(135deg,#5D5851 0%,#2E2A26 100%)",
          "linear-gradient(135deg,#7B5A3A 0%,#3B2314 100%)",
        ][i] ?? "linear-gradient(135deg,#A88B5C 0%,#3B2314 100%)",
      })),
    [effectSpecs]
  );

  return (
    <section
      className={`relative ${className}`}
      style={{ backgroundColor: CREAM, color: DARK }}
    >
      {/* Thin top divider */}
      <div className="container-custom pt-14 md:pt-20">
        <div
          aria-hidden
          className="h-px w-full"
          style={{ backgroundColor: `${DARK}1A` }}
        />
      </div>

      <div className="container-custom py-12 md:py-16">
        {/* ─── Heading ─────────────────────────────────────── */}
        <div className="flex items-stretch gap-4 mb-12 md:mb-16">
          <span
            aria-hidden
            className="block w-[2px] flex-shrink-0"
            style={{ backgroundColor: GOLD }}
          />
          <div>
            <h2
              className="font-heading font-semibold tracking-tight text-2xl md:text-3xl lg:text-[34px] leading-tight"
              style={{ color: DARK }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="mt-2 text-sm md:text-base max-w-2xl"
                style={{ color: MUTED }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ─── PART 1 — Top stat row (Spessore+Effetto, then Formati) ─── */}
        {(() => {
          const nonFmt = specs.filter(
            (s) => !FORMAT_KEY.test(s.label) && !APPLICATION_KEY.test(s.label)
          );
          const spessoreSpec = nonFmt[0] ?? null;
          const effettoSpec = nonFmt.find((s) => s !== spessoreSpec) ?? null;
          const divider = "rgba(59,35,20,0.15)";

          if (!spessoreSpec && !effettoSpec && formats.length === 0) return null;

          const GoldUnderline = () => (
            <span
              aria-hidden
              className="block mt-5"
              style={{ backgroundColor: GOLD, height: 2, width: 32 }}
            />
          );
          const Label = ({ children }: { children: React.ReactNode }) => (
            <p
              className="uppercase font-medium"
              style={{
                color: MUTED,
                fontSize: 11,
                letterSpacing: "0.15em",
              }}
            >
              {children}
            </p>
          );

          return (
            <div className="mb-14 md:mb-20">
              {/* ROW 1 — Spessore + Effetto */}
              {(spessoreSpec || effettoSpec) && (
                <div
                  className="tsb-row1 grid grid-cols-1 sm:grid-cols-2"
                  style={{ overflow: "hidden" }}
                >
                  {spessoreSpec && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="tsb-cell flex flex-col items-start min-w-0 px-0 sm:pr-8 md:pr-10 py-2 sm:py-0"
                      style={{ overflow: "hidden" }}
                    >
                      <Label>{spessoreSpec.label}</Label>
                      <p
                        className="font-heading font-bold leading-none tracking-tight mt-2 break-words"
                        style={{ color: DARK, fontSize: 52, maxWidth: "100%" }}
                      >
                        {spessoreSpec.value}
                      </p>
                      <GoldUnderline />
                    </motion.div>
                  )}
                  {effettoSpec && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
                      className="tsb-cell tsb-cell-right flex flex-col items-start min-w-0 px-0 sm:pl-8 md:pl-10 py-2 sm:py-0"
                      style={{ overflow: "hidden" }}
                    >
                      <Label>{effettoSpec.label}</Label>
                      <p
                        className="font-heading font-bold leading-tight tracking-tight mt-2 break-words"
                        style={{ color: DARK, fontSize: 28, maxWidth: "100%" }}
                      >
                        {effettoSpec.value}
                      </p>
                      <GoldUnderline />
                    </motion.div>
                  )}
                  <style>{`
                    .tsb-row1 > .tsb-cell + .tsb-cell {
                      border-top: 1px solid ${divider};
                      padding-top: 1.5rem;
                      margin-top: 1.5rem;
                    }
                    @media (min-width: 640px) {
                      .tsb-row1 > .tsb-cell + .tsb-cell {
                        border-top: 0;
                        border-left: 1px solid ${divider};
                        padding-top: 0;
                        margin-top: 0;
                      }
                    }
                  `}</style>
                </div>
              )}

              {/* ROW 2 — Formati (full width, pill tags) */}
              {formats.length > 0 && formatSpec && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
                  className="mt-8 md:mt-10 pt-6 md:pt-8"
                  style={{ borderTop: `1px solid ${divider}`, overflow: "hidden" }}
                >
                  <Label>{formatSpec.label}</Label>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formats.map((f, i) => (
                      <span
                        key={`${f}-${i}`}
                        className="font-heading font-bold whitespace-nowrap"
                        style={{
                          color: DARK,
                          fontSize: 15,
                          padding: "6px 16px",
                          border: `1px solid rgba(59,35,20,0.3)`,
                          borderRadius: 4,
                          backgroundColor: "transparent",
                          lineHeight: 1.2,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })()}


        {/* ─── PART 2 — Tabs ──────────────────────────────────── */}
        {availableTabs.length > 0 && (
          <div>
            {/* Tab triggers */}
            <div
              className="flex flex-wrap"
              role="tablist"
              style={{ borderBottom: `1px solid ${DARK}1A` }}
            >
              {availableTabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative px-5 md:px-7 py-3.5 text-sm md:text-[15px] font-medium uppercase tracking-[0.12em] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: isActive ? DARK : "transparent",
                      color: isActive ? CREAM : DARK,
                      borderRadius: 0,
                      ["--tw-ring-color" as never]: GOLD,
                      ["--tw-ring-offset-color" as never]: CREAM,
                    }}
                  >
                    {tab.label}
                    {!isActive && (
                      <span
                        aria-hidden
                        className="absolute left-0 right-0 -bottom-px h-px"
                        style={{ backgroundColor: `${DARK}1A` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab panels */}
            <div className="pt-10 md:pt-12 min-h-[220px]">
              <AnimatePresence mode="wait">
                {/* ===== FORMATI ===== */}
                {activeTab === "formats" && (
                  <motion.div
                    key="formats"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="tabpanel"
                  >
                    <div className="flex flex-wrap gap-4 md:gap-5">
                      {formats.map((fmt, i) => {
                        const active = i === selectedFormatIdx;
                        return (
                          <button
                            key={`${fmt}-${i}`}
                            onClick={() => setSelectedFormatIdx(i)}
                            className="relative aspect-square w-[124px] md:w-[148px] flex items-center justify-center text-center transition-all duration-150 ease-out outline-none focus-visible:ring-2"
                            style={{
                              backgroundColor: active ? DARK : "transparent",
                              color: active ? CREAM : DARK,
                              border: `1px solid ${active ? DARK : DARK + "33"}`,
                              borderRadius: 4,
                              boxShadow: active
                                ? `inset 0 0 0 2px ${GOLD}`
                                : "none",
                              ["--tw-ring-color" as never]: GOLD,
                            }}
                          >
                            <span
                              className="font-heading font-semibold leading-tight px-2"
                              style={{
                                fontSize:
                                  fmt.length > 12
                                    ? 16
                                    : fmt.length > 8
                                    ? 20
                                    : 26,
                              }}
                            >
                              {fmt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedSurface && (
                      <motion.p
                        key={selectedFormatIdx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-8 text-sm md:text-base"
                        style={{ color: MUTED }}
                      >
                        <span
                          className="uppercase tracking-[0.12em] mr-2"
                          style={{ fontSize: 11, color: MUTED }}
                        >
                          {t("techSpec.surfaceLabel")}:
                        </span>
                        <span className="font-semibold" style={{ color: DARK }}>
                          {selectedSurface} m²
                        </span>
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* ===== EFFETTO ===== */}
                {activeTab === "effect" && (
                  <motion.div
                    key="effect"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="tabpanel"
                  >
                    {effectStory ? (
                      <div className="max-w-3xl">
                        <h3
                          className="font-heading font-semibold text-2xl md:text-[28px] tracking-tight mb-6"
                          style={{ color: DARK }}
                        >
                          {effectStoryTitle ??
                            effectSpecs[0]?.value ??
                            t("techSpec.effectHeading")}
                        </h3>
                        <span
                          aria-hidden
                          className="block mb-6"
                          style={{ backgroundColor: GOLD, height: 2, width: 40 }}
                        />
                        {effectStory.split(/\n\n+/).map((para, i) => (
                          <p
                            key={i}
                            className="text-base md:text-[17px] leading-relaxed font-light"
                            style={{
                              color: DARK,
                              marginTop: i === 0 ? 0 : "1.1rem",
                            }}
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <>
                        <h3
                          className="font-heading font-semibold text-2xl md:text-[28px] tracking-tight mb-8"
                          style={{ color: DARK }}
                        >
                          {effectSpecs[selectedEffectIdx]?.value ??
                            t("techSpec.effectHeading")}
                        </h3>
                        <div className="flex flex-wrap gap-6 md:gap-8">
                          {effectSwatches.map((sw, i) => {
                            const active = i === selectedEffectIdx;
                            return (
                              <button
                                key={`${sw.label}-${i}`}
                                onClick={() => setSelectedEffectIdx(i)}
                                className="group flex flex-col items-center gap-3 outline-none transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2"
                                style={{ ["--tw-ring-color" as never]: GOLD }}
                              >
                                <span
                                  className="block w-[88px] h-[88px] md:w-[110px] md:h-[110px] transition-all duration-150 ease-out"
                                  style={{
                                    background: sw.gradient,
                                    border: `2px solid ${active ? GOLD : "transparent"}`,
                                    borderRadius: 4,
                                    boxShadow: active
                                      ? `0 12px 28px -16px ${DARK}88`
                                      : `0 6px 18px -14px ${DARK}66`,
                                  }}
                                />
                                <span
                                  className="uppercase font-medium"
                                  style={{
                                    color: active ? DARK : MUTED,
                                    fontSize: 11,
                                    letterSpacing: "0.12em",
                                  }}
                                >
                                  {effectSpecs[i]?.label ?? sw.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}



                {/* ===== APPLICAZIONI ===== */}
                {activeTab === "applications" && applications && (
                  <motion.div
                    key="apps"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="tabpanel"
                  >
                    {applicationsLabel && (
                      <p
                        className="uppercase font-medium mb-6"
                        style={{
                          color: MUTED,
                          fontSize: 11,
                          letterSpacing: "0.12em",
                        }}
                      >
                        {applicationsLabel}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                      {applications.map((app, i) => {
                        const active = i === selectedAppIdx;
                        return (
                          <button
                            key={`${app}-${i}`}
                            onClick={() =>
                              setSelectedAppIdx(active ? null : i)
                            }
                            className="text-left p-6 md:p-7 transition-all duration-200 ease-out outline-none focus-visible:ring-2"
                            style={{
                              backgroundColor: "transparent",
                              border: `1px solid ${active ? GOLD : DARK + "26"}`,
                              borderRadius: 4,
                              opacity: selectedAppIdx === null ? 1 : active ? 1 : 0.5,
                              boxShadow: active
                                ? `0 14px 32px -20px ${DARK}77`
                                : "none",
                              ["--tw-ring-color" as never]: GOLD,
                            }}
                          >
                            <p
                              className="font-heading font-semibold text-lg md:text-xl tracking-tight"
                              style={{ color: DARK }}
                            >
                              {app}
                            </p>
                            <AnimatePresence initial={false}>
                              {active && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                  animate={{
                                    opacity: 1,
                                    height: "auto",
                                    marginTop: 12,
                                  }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  transition={{ duration: 0.18, ease: "easeOut" }}
                                  className="text-sm md:text-[15px] leading-relaxed overflow-hidden"
                                  style={{ color: MUTED }}
                                >
                                  {app}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Optional full sheet link */}
        {fullSheetHref && (
          <div className="mt-10 flex justify-end">
            <a
              href={fullSheetHref}
              target={fullSheetHref.startsWith("http") ? "_blank" : undefined}
              rel={
                fullSheetHref.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="group inline-flex items-center gap-2 text-sm transition-colors duration-150"
              style={{ color: DARK }}
            >
              <span
                className="pb-0.5 border-b"
                style={{ borderColor: `${DARK}55` }}
              >
                {fullSheetLabel || "Scheda tecnica completa"}
              </span>
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                style={{ color: GOLD }}
              />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default TechSpecBar;
