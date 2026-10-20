import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { localCities, localProducts, localSlug } from "@/data/localPages";

const LocalZones = () => (
  <div className="bg-background pt-32 pb-24">
    <SEOHead
      title="Zone servite — Pavimenti a Desenzano, Lago di Garda, Brescia e Verona | Kalēa®"
      description="Fornitura e posa di pavimenti SPC, parquet, laminati, MgO ed esterni a Desenzano del Garda, Sirmione, Lonato, Peschiera, Salò, Brescia, Verona e Mantova."
      canonicalPath="/it/zone"
      italianOnly
    />
    <div className="container-custom max-w-5xl">
      <h1 className="font-heading text-3xl md:text-5xl font-semibold text-foreground mb-4">Zone servite</h1>
      <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
        Dalla sede di Desenzano del Garda seguiamo fornitura e posa su tutto il Lago di Garda, Brescia, Verona, Mantova e dintorni.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localCities.map((c) => (
          <div key={c.slug} className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">{c.name}</h2>
            <ul className="space-y-1.5">
              {localProducts.map((p) => (
                <li key={p.slug}>
                  <Link to={`/it/zone/${localSlug(p, c)}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
                    {p.keyword}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LocalZones;
