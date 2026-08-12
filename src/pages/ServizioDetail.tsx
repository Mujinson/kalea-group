import { motion } from "framer-motion";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { getServizioBySlug, serviziPages, type Lang } from "@/data/serviziPages";

const ServizioDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useTranslation();
  const lang = (language || "it") as Lang;
  const servizio = getServizioBySlug(slug);

  if (!servizio) return <Navigate to={`/${lang}/indoor`} replace />;

  const c = servizio.content[lang] ?? servizio.content.it;
  const others = serviziPages.filter((s) => s.slug !== servizio.slug);

  const ctaLabel =
    lang === "it" ? "Richiedi un sopralluogo" :
    lang === "en" ? "Request a site survey" :
    lang === "de" ? "Aufmaß anfragen" :
    "Demander une visite technique";

  const otherLabel =
    lang === "it" ? "Altri servizi" :
    lang === "en" ? "Other services" :
    lang === "de" ? "Weitere Leistungen" :
    "Autres services";

  return (
    <div>
      <SEOHead title={c.seoTitle} description={c.seoDescription} />

      <HeroSection
        title={c.title}
        subtitle={c.subtitle}
        backgroundImage={servizio.hero}
        ctaPrimary={{ text: ctaLabel, link: `/${lang}/contatti` }}
      />

      {/* Intro */}
      <section className="relative z-10 bg-background py-16 md:py-24">
        <div className="container-custom max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-foreground/50 font-medium mb-4">
              {c.eyebrow}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {c.intro}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 bg-background pb-16 md:pb-24">
        <div className="container-custom max-w-5xl">
          <h2 className="font-heading text-2xl md:text-4xl font-semibold text-foreground text-center mb-10 md:mb-14">
            {c.stepsTitle}
          </h2>
          <div className="space-y-4">
            {c.steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex gap-5 md:gap-8 rounded-2xl border border-border bg-card p-6 md:p-8"
              >
                <span className="font-heading text-2xl md:text-3xl font-semibold text-foreground/25 leading-none w-10 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="relative z-10 bg-background pb-16 md:pb-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {servizio.gallery.map((img, i) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="overflow-hidden rounded-lg aspect-[4/5]"
              >
                <img
                  src={img}
                  alt={`${c.title} — ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bullets */}
      <section className="relative z-10 bg-background pb-16 md:pb-24">
        <div className="container-custom max-w-4xl">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-8">
            {c.bulletsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {c.bullets.map((b, i) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-5"
              >
                <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{b}</span>
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-lg md:text-xl text-foreground italic leading-relaxed">
            {c.closing}
          </p>

          <div className="mt-10">
            <Link to={`/${lang}/contatti`}>
              <Button size="lg" className="gap-2">
                {ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="relative z-10 bg-background pb-20 md:pb-28">
        <div className="container-custom">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground text-center mb-8 md:mb-12">
            {otherLabel}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {others.map((s) => {
              const oc = s.content[lang] ?? s.content.it;
              return (
                <Link
                  key={s.slug}
                  to={`/${lang}/servizi/${s.slug}`}
                  className="group relative block overflow-hidden rounded-lg aspect-[16/10]"
                >
                  <img
                    src={s.hero}
                    alt={oc.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-5 left-6 right-6 font-heading text-lg md:text-xl font-semibold text-white">
                    {oc.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServizioDetail;
