import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ClipboardCheck, Hammer, MapPin, Phone, Ruler, ShieldCheck, Loader2 } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImg from "@/assets/bg-application-residential.jpg";

const BASE = "https://www.kalea.space";
const PATH = "/it/sopralluogo-gratuito";

const WORK_TYPES = [
  "Fornitura e posa pavimento",
  "Solo posa",
  "Levigatura e rigenerazione parquet",
  "Pavimento per esterni",
  "Rivestimento pareti",
  "Altro / non lo so ancora",
];

const STEPS = [
  {
    icon: Phone,
    title: "1. Ci lasci i tuoi dati",
    text: "Compila il modulo o chiamaci direttamente. Ti rispondiamo entro un giorno lavorativo.",
  },
  {
    icon: Ruler,
    title: "2. Sopralluogo gratuito",
    text: "Veniamo da te, prendiamo le misure e valutiamo insieme materiali e lavorazione. Senza impegno.",
  },
  {
    icon: ClipboardCheck,
    title: "3. Preventivo definitivo",
    text: "Ricevi un preventivo chiaro e dettagliato, voce per voce. Decidi tu con calma.",
  },
];

const PRODUCTS = [
  { name: "Pavimenti SPC Hypermatt", text: "Impermeabili, stabili, posa rapida anche sopra il pavimento esistente.", link: "/it/hypermatt" },
  { name: "Parquet", text: "Legno vero, prefinito o da levigare, per case che durano generazioni.", link: "/it/indoor" },
  { name: "Laminati", text: "Resistenti e versatili, ideali per famiglie e spazi molto vissuti.", link: "/it/indoor" },
  { name: "BIOMAG FLOOR® MgO", text: "Il pavimento minerale ignifugo e antimuffa, senza plastica.", link: "/it/biomag-floor" },
  { name: "Esterni Externo", text: "Decking e pavimenti da esterno che resistono a sole, pioggia e gelo.", link: "/it/externo" },
  { name: "Levigatura parquet", text: "Il tuo vecchio parquet torna come nuovo, senza cambiarlo.", link: "/it/servizi/levigatura-parquet" },
];

const WHY = [
  "Un unico referente per fornitura e posa: niente scaricabarile tra rivenditore e posatore",
  "Squadre di posa interne, formate sui nostri materiali",
  "Sopralluogo e misure sempre gratuiti, senza impegno",
  "Preventivo scritto e dettagliato, voce per voce",
  "Garanzia sui lavori eseguiti",
  "Sede a Desenzano del Garda, lavoriamo in tutta la Lombardia e in tutta Italia",
];

const FAQ = [
  {
    q: "Il sopralluogo è davvero gratuito?",
    a: "Sì. Veniamo a prendere le misure e a valutare il lavoro senza nessun costo e senza impegno da parte tua.",
  },
  {
    q: "Quanto tempo passa tra la richiesta e il preventivo?",
    a: "Ti ricontattiamo entro un giorno lavorativo per fissare il sopralluogo. Dopo il sopralluogo, il preventivo arriva in pochi giorni.",
  },
  {
    q: "Fate anche solo la posa, se ho già il materiale?",
    a: "Sì, valutiamo anche lavori di sola posa. Il sopralluogo serve proprio a capire cosa conviene nel tuo caso.",
  },
  {
    q: "In quali zone lavorate?",
    a: "La nostra sede è a Desenzano del Garda e lavoriamo soprattutto in Lombardia — Brescia, Verona, Bergamo, Milano, Como e tutto il Lago di Garda — ma valutiamo lavori in tutta Italia.",
  },
];

const LandingSopralluogo = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [workType, setWorkType] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Nome e telefono sono obbligatori.");
      return;
    }
    if (!privacy) {
      toast.error("Devi accettare l'informativa privacy.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("landing-lead", {
        body: { name, phone, email, city, workType, message, honeypot },
      });
      if (error) throw error;
      setDone(true);
    } catch {
      toast.error("Qualcosa è andato storto. Riprova o chiamaci direttamente.");
    } finally {
      setSending(false);
    }
  };

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Sopralluogo e preventivo gratuito pavimenti",
      serviceType: "Fornitura e posa pavimenti",
      description:
        "Sopralluogo gratuito e preventivo senza impegno per fornitura e posa di pavimenti SPC, parquet, laminati, MgO ed esterni. Sede a Desenzano del Garda, attivi in Lombardia e in tutta Italia.",
      url: `${BASE}${PATH}`,
      areaServed: ["Lombardia", "Italia"],
      provider: {
        "@type": "HomeAndConstructionBusiness",
        name: "Kalēa Group S.r.l.",
        telephone: "+39 352 035 1738",
        url: BASE,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Via Generale Bernasconi, 8A",
          postalCode: "25015",
          addressLocality: "Desenzano del Garda",
          addressRegion: "BS",
          addressCountry: "IT",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div>
      <SEOHead
        title="Sopralluogo e preventivo gratuito pavimenti | Kalēa®"
        description="Richiedi un sopralluogo gratuito per il tuo pavimento: SPC, parquet, laminato, MgO ed esterni. Fornitura e posa con squadre Kalēa®, preventivo chiaro e senza impegno."
        canonicalPath={PATH}
        italianOnly
        structuredData={structuredData}
      />

      <HeroSection
        title="Sopralluogo gratuito, preventivo senza impegno"
        subtitle="Fornitura e posa di pavimenti con un unico referente, dal sopralluogo alla consegna"
        backgroundImage={heroImg}
        ctaPrimary={{ text: "Calcola il preventivo online", link: "/it/preventivo-online" }}
        ctaSecondary={{ text: "Scrivici dal modulo", link: "#richiedi" }}
      />

      {/* Barra di fiducia */}
      <section className="relative z-10 bg-background py-10 border-b border-border">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: Ruler, label: "Sopralluogo gratuito" },
            { icon: Hammer, label: "Squadre di posa interne" },
            { icon: ShieldCheck, label: "Garanzia sui lavori" },
            { icon: MapPin, label: "Lombardia e tutta Italia" },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-2">
              <t.icon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Come funziona */}
      <section className="relative z-10 bg-background py-16 md:py-24">
        <div className="container-custom max-w-5xl">
          <h2 className="font-heading text-2xl md:text-4xl font-semibold text-foreground mb-10 text-center">
            Come funziona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-xl border border-border bg-card p-6">
                <s.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cosa facciamo */}
      <section className="relative z-10 bg-background pb-16 md:pb-24">
        <div className="container-custom max-w-5xl">
          <h2 className="font-heading text-2xl md:text-4xl font-semibold text-foreground mb-4 text-center">
            Cosa possiamo fare per te
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Dal pavimento del soggiorno al terrazzo, dal parquet da rigenerare al deck in giardino.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRODUCTS.map((p) => (
              <Link
                key={p.name}
                to={p.link}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <h3 className="font-heading text-base font-semibold text-foreground mb-1 whitespace-nowrap">
                  {p.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{p.text}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary">
                  Scopri <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Perché Kalēa */}
      <section className="relative z-10 bg-background pb-16 md:pb-24">
        <div className="container-custom max-w-3xl">
          <h2 className="font-heading text-2xl md:text-4xl font-semibold text-foreground mb-8 text-center">
            Perché Kalēa<span className="whitespace-nowrap">®</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WHY.map((w) => (
              <div key={w} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modulo richiesta */}
      <section id="richiedi" className="relative z-10 bg-background pb-16 md:pb-24 scroll-mt-24">
        <div className="container-custom max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-2 text-center">
              Richiedi il sopralluogo gratuito
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Ti ricontattiamo entro un giorno lavorativo. Oppure chiamaci subito:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <a href="tel:+393520351738">
                <Button size="lg" className="w-full sm:w-auto">
                  <Phone className="w-4 h-4 mr-2" /> +39 352 035 1738
                </Button>
              </a>
              <a href="tel:+393394730218">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Phone className="w-4 h-4 mr-2" /> +39 339 473 0218
                </Button>
              </a>
            </div>

            {done ? (
              <div className="text-center py-8">
                <Check className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Richiesta inviata</h3>
                <p className="text-muted-foreground">
                  Grazie {name.split(" ")[0]}. Ti ricontattiamo entro un giorno lavorativo per fissare il sopralluogo.
                  Se hai fretta, chiamaci: <a href="tel:+393520351738" className="text-primary underline">+39 352 035 1738</a>.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="lp-name">Nome e cognome *</Label>
                    <Input id="lp-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
                  </div>
                  <div>
                    <Label htmlFor="lp-phone">Telefono *</Label>
                    <Input id="lp-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={40} />
                  </div>
                  <div>
                    <Label htmlFor="lp-email">Email</Label>
                    <Input id="lp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
                  </div>
                  <div>
                    <Label htmlFor="lp-city">Città</Label>
                    <Input id="lp-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={120} placeholder="Es. Desenzano, Brescia, Milano…" />
                  </div>
                </div>
                <div>
                  <Label>Che lavoro ti serve?</Label>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Scegli il tipo di lavoro" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_TYPES.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lp-message">Raccontaci il lavoro (facoltativo)</Label>
                  <Textarea
                    id="lp-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={3000}
                    rows={4}
                    placeholder="Es. circa 60 mq di soggiorno e cucina, pavimento esistente in piastrelle…"
                  />
                </div>
                {/* Honeypot anti-bot, nascosto agli utenti */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <div className="flex items-start gap-3">
                  <Checkbox id="lp-privacy" checked={privacy} onCheckedChange={(v) => setPrivacy(v === true)} />
                  <Label htmlFor="lp-privacy" className="text-sm font-normal text-muted-foreground leading-snug">
                    Ho letto e accetto la <Link to="/it/privacy" className="text-primary underline">informativa privacy</Link> *
                  </Label>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Invio in corso…
                    </>
                  ) : (
                    "Richiedi il sopralluogo gratuito"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 bg-background pb-16 md:pb-24">
        <div className="container-custom max-w-3xl">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center">
            Domande frequenti
          </h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-foreground mb-1">{f.q}</h3>
                <p className="text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale compatta */}
      <section className="relative z-10 bg-background pb-16 md:pb-20">
        <div className="container-custom max-w-3xl text-center rounded-2xl border border-border bg-card p-8">
          <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-3">
            Preferisci parlarne a voce?
          </h2>
          <p className="text-muted-foreground mb-6">
            Lun–Ven 8:00–12:00 / 13:30–18:00, Sab 8:00–12:00
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+393520351738">
              <Button size="lg" className="w-full sm:w-auto">
                <Phone className="w-4 h-4 mr-2" /> Chiama ora
              </Button>
            </a>
            <Link to="/it/preventivo-online">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Calcola il preventivo online
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingSopralluogo;
