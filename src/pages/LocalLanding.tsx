import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, Check, MapPin, Phone } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { getLocalPage, localCities, localProducts, localSlug } from "@/data/localPages";

const BASE = "https://www.kalea.space";

const LocalLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = getLocalPage(slug);
  if (!page) return <Navigate to="/it/zone" replace />;
  const { product: p, city: c } = page;
  const where = c.slug === "lago-di-garda" ? "sul Lago di Garda" : `a ${c.name}`;
  const title = `${p.keyword} ${where} | Fornitura e posa — Kalēa®`;
  const description = `${p.keyword} ${where}${c.prov.includes("/") ? "" : ` (${c.prov})`}: fornitura e posa con squadre Kalēa®, sopralluogo e preventivo online. Sede a Desenzano del Garda.`;
  const path = `/it/zone/${page.slug}`;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${p.keyword} ${where}`,
      serviceType: p.keyword,
      description,
      url: `${BASE}${path}`,
      areaServed: { "@type": "Place", name: c.name },
      provider: {
        "@type": "HomeAndConstructionBusiness",
        name: "Kalēa Group S.r.l.",
        telephone: "+39 352 035 1738",
        url: BASE,
        address: { "@type": "PostalAddress", streetAddress: "Via Generale Bernasconi, 8A", postalCode: "25015", addressLocality: "Desenzano del Garda", addressRegion: "BS", addressCountry: "IT" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/it` },
        { "@type": "ListItem", position: 2, name: "Zone servite", item: `${BASE}/it/zone` },
        { "@type": "ListItem", position: 3, name: `${p.keyword} ${where}`, item: `${BASE}${path}` },
      ],
    },
  ];

  const otherProducts = localProducts.filter((x) => x.slug !== p.slug);
  const otherCities = localCities.filter((x) => x.slug !== c.slug);

  return (
    <div>
      <SEOHead title={title} description={description} canonicalPath={path} italianOnly structuredData={structuredData} />
      <HeroSection
        title={`${p.keyword} ${where}`}
        subtitle={`Fornitura e posa ${p.short} con squadre Kalēa®`}
        backgroundImage={p.hero}
        ctaPrimary={{ text: "Preventivo online", link: "/it/preventivo-online" }}
      />

      <section className="relative z-10 bg-background py-16 md:py-24">
        <div className="container-custom max-w-3xl">
          <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/it" className="hover:text-foreground">Home</Link> / <Link to="/it/zone" className="hover:text-foreground">Zone servite</Link> / <span>{c.name}</span>
          </nav>
          <h2 className="font-heading text-2xl md:text-4xl font-semibold text-foreground mb-6">
            {p.keyword} {where}: cosa offriamo
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{p.intro}</p>
          <p className="text-lg text-muted-foreground leading-relaxed">{c.note}</p>
          <p className="mt-6 flex items-center gap-2 text-sm text-foreground/70">
            <MapPin className="w-4 h-4 shrink-0" />
            {c.km > 0 ? `Circa ${c.km} km dalla nostra sede di Desenzano del Garda.` : "Sede: Via Generale Bernasconi 8A, Desenzano del Garda (BS)."}
          </p>
        </div>
      </section>

      <section className="relative z-10 bg-background pb-16 md:pb-24">
        <div className="container-custom max-w-4xl">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-8">Perché sceglierlo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p.benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{b}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-muted-foreground"><strong className="text-foreground">Ideale per:</strong> {p.ideal}</p>
          <p className="mt-3 text-muted-foreground"><strong className="text-foreground">Zone servite:</strong> {c.areas.join(", ")} e dintorni.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/it/preventivo-online"><Button size="lg" className="gap-2">Calcola il preventivo <ArrowRight className="w-4 h-4" /></Button></Link>
            <a href="tel:+393520351738"><Button size="lg" variant="outline" className="gap-2"><Phone className="w-4 h-4" /> +39 352 035 1738</Button></a>
            <Link to={p.link}><Button size="lg" variant="ghost" className="gap-2">{p.linkLabel} <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-background pb-16 md:pb-24">
        <div className="container-custom max-w-3xl">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-8">Domande frequenti</h2>
          <div className="space-y-4">
            {p.faq.map((f) => (
              <div key={f.q} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-background pb-20 md:pb-28">
        <div className="container-custom max-w-4xl grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Altri pavimenti {where}</h2>
            <ul className="space-y-2">
              {otherProducts.map((o) => (
                <li key={o.slug}><Link to={`/it/zone/${localSlug(o, c)}`} className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">{o.keyword} {where}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-4">{p.keyword} in altre zone</h2>
            <ul className="space-y-2">
              {otherCities.map((o) => (
                <li key={o.slug}><Link to={`/it/zone/${localSlug(p, o)}`} className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">{p.keyword} {o.slug === "lago-di-garda" ? "sul Lago di Garda" : `a ${o.name}`}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocalLanding;
