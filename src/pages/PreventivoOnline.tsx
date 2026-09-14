import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Info, Loader2, Mail } from "lucide-react";
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
import { useTranslation } from "@/i18n/useTranslation";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { trackGenerateLead } from "@/lib/analytics";

interface PriceItem {
  code: string;
  name: string;
  name_en: string | null;
  name_de: string | null;
  name_fr: string | null;
  description: string | null;
  category: string;
  unit: string;
  price_min: number;
  price_max: number;
  sort_order: number;
}

type Lang = "it" | "en" | "de" | "fr";

const COPY: Record<Lang, Record<string, string>> = {
  it: {
    seoTitle: "Preventivo online pavimenti | Stima immediata — Kalēa®",
    seoDesc:
      "Calcola in un minuto una stima indicativa per fornitura, posa, levigatura e finitura dei tuoi pavimenti. Ricevi la stima via email.",
    h1: "Calcola la tua stima online",
    intro:
      "Scegli le lavorazioni che ti servono, indica le quantità e ricevi subito una stima indicativa via email.",
    step1: "Lavorazioni",
    step2: "Quantità",
    step3: "Stima",
    step4: "I tuoi dati",
    chooseHint: "Puoi selezionare più lavorazioni, anche tutte insieme.",
    qtyHint: "Indica la quantità per ogni lavorazione scelta.",
    back: "Indietro",
    next: "Avanti",
    estimateTitle: "La tua stima indicativa",
    totalLabel: "Totale indicativo (IVA esclusa)",
    disclaimer:
      "Questa è una stima puramente indicativa e non vincolante. Il preventivo definitivo verrà emesso solo dopo il sopralluogo dei nostri tecnici.",
    name: "Nome e cognome",
    email: "Email",
    phone: "Telefono",
    city: "Città",
    province: "Provincia",
    type: "Sei un…",
    notes: "Note (facoltative)",
    privacy: "Ho letto e accetto l'informativa privacy",
    submit: "Ricevi la stima via email",
    sending: "Invio in corso…",
    doneTitle: "Stima inviata",
    doneText:
      "Ti abbiamo appena inviato la stima via email. Ti ricontattiamo entro un giorno lavorativo per fissare il sopralluogo.",
    newOne: "Fai un'altra stima",
    errSelect: "Seleziona almeno una lavorazione.",
    errQty: "Inserisci le quantità.",
    errFields: "Nome, email e telefono sono obbligatori.",
    errPrivacy: "Devi accettare l'informativa privacy.",
    errGeneric: "Qualcosa è andato storto. Riprova tra poco.",
    catFornitura: "Fornitura materiali",
    catPreparazione: "Preparazione",
    catPosa: "Posa",
    catTrattamento: "Trattamenti e finiture",
    catRimozione: "Rimozione",
  },
  en: {
    seoTitle: "Online flooring estimate | Instant quote — Kalēa®",
    seoDesc:
      "Get an indicative estimate for supply, installation, sanding and finishing of your floors in one minute. Delivered by email.",
    h1: "Build your online estimate",
    intro: "Pick the works you need, enter the quantities and get an indicative estimate by email.",
    step1: "Works",
    step2: "Quantities",
    step3: "Estimate",
    step4: "Your details",
    chooseHint: "You can select several works at once.",
    qtyHint: "Enter the quantity for each selected work.",
    back: "Back",
    next: "Next",
    estimateTitle: "Your indicative estimate",
    totalLabel: "Indicative total (VAT excluded)",
    disclaimer:
      "This is an indicative, non-binding estimate only. The final quotation will be issued after an on-site survey by our technicians.",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    city: "City",
    province: "Province / region",
    type: "You are a…",
    notes: "Notes (optional)",
    privacy: "I have read and accept the privacy policy",
    submit: "Get the estimate by email",
    sending: "Sending…",
    doneTitle: "Estimate sent",
    doneText:
      "We have just emailed your estimate. We will call you within one business day to arrange the survey.",
    newOne: "Make another estimate",
    errSelect: "Select at least one work.",
    errQty: "Please enter the quantities.",
    errFields: "Name, email and phone are required.",
    errPrivacy: "You must accept the privacy policy.",
    errGeneric: "Something went wrong. Please try again.",
    catFornitura: "Material supply",
    catPreparazione: "Preparation",
    catPosa: "Installation",
    catTrattamento: "Treatments and finishes",
    catRimozione: "Removal",
  },
  de: {
    seoTitle: "Online-Kostenschätzung Bodenbeläge | Kalēa®",
    seoDesc:
      "Berechnen Sie in einer Minute eine unverbindliche Schätzung für Lieferung, Verlegung, Schleifen und Finish. Per E-Mail erhalten.",
    h1: "Ihre Online-Schätzung",
    intro:
      "Wählen Sie die gewünschten Leistungen, geben Sie die Mengen an und erhalten Sie eine unverbindliche Schätzung per E-Mail.",
    step1: "Leistungen",
    step2: "Mengen",
    step3: "Schätzung",
    step4: "Ihre Daten",
    chooseHint: "Sie können mehrere Leistungen gleichzeitig auswählen.",
    qtyHint: "Geben Sie die Menge für jede Leistung an.",
    back: "Zurück",
    next: "Weiter",
    estimateTitle: "Ihre unverbindliche Schätzung",
    totalLabel: "Richtwert gesamt (ohne MwSt.)",
    disclaimer:
      "Dies ist eine unverbindliche Richtwert-Schätzung. Das endgültige Angebot wird erst nach der Besichtigung durch unsere Techniker erstellt.",
    name: "Vor- und Nachname",
    email: "E-Mail",
    phone: "Telefon",
    city: "Stadt",
    province: "Region",
    type: "Sie sind…",
    notes: "Anmerkungen (optional)",
    privacy: "Ich habe die Datenschutzerklärung gelesen und akzeptiere sie",
    submit: "Schätzung per E-Mail erhalten",
    sending: "Wird gesendet…",
    doneTitle: "Schätzung gesendet",
    doneText:
      "Wir haben Ihnen die Schätzung per E-Mail geschickt. Wir melden uns innerhalb eines Werktags für die Besichtigung.",
    newOne: "Neue Schätzung",
    errSelect: "Wählen Sie mindestens eine Leistung.",
    errQty: "Bitte Mengen eingeben.",
    errFields: "Name, E-Mail und Telefon sind erforderlich.",
    errPrivacy: "Sie müssen die Datenschutzerklärung akzeptieren.",
    errGeneric: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
    catFornitura: "Materiallieferung",
    catPreparazione: "Vorbereitung",
    catPosa: "Verlegung",
    catTrattamento: "Behandlungen und Finish",
    catRimozione: "Entfernung",
  },
  fr: {
    seoTitle: "Devis en ligne sols | Estimation immédiate — Kalēa®",
    seoDesc:
      "Obtenez en une minute une estimation indicative pour la fourniture, la pose, le ponçage et la finition de vos sols. Reçue par email.",
    h1: "Calculez votre estimation en ligne",
    intro:
      "Choisissez les prestations nécessaires, indiquez les quantités et recevez une estimation indicative par email.",
    step1: "Prestations",
    step2: "Quantités",
    step3: "Estimation",
    step4: "Vos coordonnées",
    chooseHint: "Vous pouvez sélectionner plusieurs prestations à la fois.",
    qtyHint: "Indiquez la quantité pour chaque prestation.",
    back: "Retour",
    next: "Suivant",
    estimateTitle: "Votre estimation indicative",
    totalLabel: "Total indicatif (hors TVA)",
    disclaimer:
      "Ceci est une estimation purement indicative et non contractuelle. Le devis définitif sera émis après la visite de nos techniciens.",
    name: "Nom et prénom",
    email: "Email",
    phone: "Téléphone",
    city: "Ville",
    province: "Région",
    type: "Vous êtes…",
    notes: "Notes (facultatif)",
    privacy: "J'ai lu et j'accepte la politique de confidentialité",
    submit: "Recevoir l'estimation par email",
    sending: "Envoi en cours…",
    doneTitle: "Estimation envoyée",
    doneText:
      "Nous venons de vous envoyer l'estimation par email. Nous vous rappelons sous un jour ouvré pour la visite technique.",
    newOne: "Faire une autre estimation",
    errSelect: "Sélectionnez au moins une prestation.",
    errQty: "Veuillez saisir les quantités.",
    errFields: "Nom, email et téléphone sont obligatoires.",
    errPrivacy: "Vous devez accepter la politique de confidentialité.",
    errGeneric: "Une erreur est survenue. Réessayez.",
    catFornitura: "Fourniture matériaux",
    catPreparazione: "Préparation",
    catPosa: "Pose",
    catTrattamento: "Traitements et finitions",
    catRimozione: "Dépose",
  },
};

const CATEGORY_ORDER = ["fornitura", "preparazione", "rimozione", "posa", "trattamento"];

const CUSTOMER_TYPES = [
  { value: "cliente_privato", label: { it: "Privato", en: "Private client", de: "Privatkunde", fr: "Particulier" } },
  { value: "architetto", label: { it: "Architetto / Designer", en: "Architect / Designer", de: "Architekt / Designer", fr: "Architecte / Designer" } },
  { value: "impresa_edile", label: { it: "Impresa edile", en: "Construction company", de: "Bauunternehmen", fr: "Entreprise de construction" } },
  { value: "rivenditore", label: { it: "Rivenditore", en: "Reseller", de: "Händler", fr: "Revendeur" } },
];

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const PreventivoOnline = () => {
  const { language } = useTranslation();
  const lang = (["it", "en", "de", "fr"].includes(String(language).toLowerCase())
    ? String(language).toLowerCase()
    : "it") as Lang;
  const c = COPY[lang];

  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [qty, setQty] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    province: "",
    customerType: "",
    notes: "",
    privacy: false,
    honeypot: "",
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("public_quote_items")
        .select("code, name, name_en, name_de, name_fr, description, category, unit, price_min, price_max, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) console.error(error);
      setItems((data as PriceItem[]) || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, done]);

  const label = (i: PriceItem) =>
    (lang === "en" && i.name_en) || (lang === "de" && i.name_de) || (lang === "fr" && i.name_fr) || i.name;

  const grouped = useMemo(() => {
    const map = new Map<string, PriceItem[]>();
    items.forEach((i) => {
      const list = map.get(i.category) || [];
      list.push(i);
      map.set(i.category, list);
    });
    return CATEGORY_ORDER.filter((k) => map.has(k)).map((k) => ({ category: k, list: map.get(k)! }));
  }, [items]);

  const catLabel = (cat: string) =>
    ({
      fornitura: c.catFornitura,
      preparazione: c.catPreparazione,
      posa: c.catPosa,
      trattamento: c.catTrattamento,
      rimozione: c.catRimozione,
    })[cat] || cat;

  const chosen = useMemo(
    () => items.filter((i) => selected.includes(i.code)),
    [items, selected],
  );

  const rows = useMemo(
    () =>
      chosen
        .map((i) => {
          const q = Number(String(qty[i.code] ?? "").replace(",", ".")) || 0;
          return { item: i, q, min: i.price_min * q, max: i.price_max * q };
        })
        .filter((r) => r.q > 0),
    [chosen, qty],
  );

  const totalMin = rows.reduce((s, r) => s + r.min, 0);
  const totalMax = rows.reduce((s, r) => s + r.max, 0);

  const toggle = (code: string) =>
    setSelected((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));

  const goNext = () => {
    if (step === 1) {
      if (selected.length === 0) return toast.error(c.errSelect);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (rows.length === 0) return toast.error(c.errQty);
      setStep(3);
      return;
    }
    if (step === 3) setStep(4);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return toast.error(c.errFields);
    if (!form.privacy) return toast.error(c.errPrivacy);

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-quote-estimate", {
        body: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          province: form.province,
          customerType: form.customerType,
          notes: form.notes,
          language: lang,
          privacyConsent: form.privacy,
          honeypot: form.honeypot,
          lines: rows.map((r) => ({ code: r.item.code, quantity: r.q })),
        },
      });
      if (error || (data as { error?: string })?.error) {
        console.error(error || data);
        toast.error(c.errGeneric);
        return;
      }
      trackGenerateLead({ source: "preventivatore_online", method: "estimate_wizard", has_company: false });
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error(c.errGeneric);
    } finally {
      setSending(false);
    }
  };

  const steps = [c.step1, c.step2, c.step3, c.step4];

  return (
    <>
      <SEOHead
        title={c.seoTitle}
        description={c.seoDesc}
        canonicalPath={`/${lang}/preventivo-online`}
      />
      <div ref={topRef} className="min-h-screen bg-background pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Kalēa<span className="whitespace-nowrap">®</span>
            </p>
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4">{c.h1}</h1>
            <p className="text-muted-foreground max-w-2xl">{c.intro}</p>
          </motion.div>

          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 border border-border rounded-2xl p-10 text-center bg-card"
            >
              <Mail className="w-10 h-10 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-light text-foreground mb-3">{c.doneTitle}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{c.doneText}</p>
              <Button
                variant="outline"
                className="mt-8"
                onClick={() => {
                  setDone(false);
                  setStep(1);
                  setSelected([]);
                  setQty({});
                }}
              >
                {c.newOne}
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Stepper */}
              <div className="mt-10 flex flex-wrap items-center gap-3">
                {steps.map((s, idx) => {
                  const n = idx + 1;
                  const active = n === step;
                  const passed = n < step;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full text-xs flex items-center justify-center border ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : passed
                              ? "bg-muted text-foreground border-border"
                              : "text-muted-foreground border-border"
                        }`}
                      >
                        {passed ? <Check className="w-3.5 h-3.5" /> : n}
                      </span>
                      <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                      {n < steps.length && <span className="w-6 h-px bg-border hidden sm:block" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 border border-border rounded-2xl bg-card p-6 md:p-8">
                {loading ? (
                  <div className="flex items-center gap-3 text-muted-foreground py-10 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" /> …
                  </div>
                ) : (
                  <>
                    {step === 1 && (
                      <div className="space-y-8">
                        <p className="text-sm text-muted-foreground">{c.chooseHint}</p>
                        {grouped.map((g) => (
                          <div key={g.category}>
                            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                              {catLabel(g.category)}
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {g.list.map((i) => {
                                const on = selected.includes(i.code);
                                return (
                                  <button
                                    key={i.code}
                                    type="button"
                                    onClick={() => toggle(i.code)}
                                    className={`text-left rounded-xl border p-4 transition-colors ${
                                      on ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                    }`}
                                  >
                                    <span className="flex items-start justify-between gap-3">
                                      <span className="text-foreground text-sm">{label(i)}</span>
                                      {on && <Check className="w-4 h-4 text-primary shrink-0" />}
                                    </span>
                                    <span className="block text-xs text-muted-foreground mt-2">
                                      {eur(i.price_min)} – {eur(i.price_max)} / {i.unit}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-5">
                        <p className="text-sm text-muted-foreground">{c.qtyHint}</p>
                        {chosen.map((i) => (
                          <div key={i.code} className="flex items-center justify-between gap-4 border-b border-border pb-4">
                            <div>
                              <p className="text-foreground text-sm">{label(i)}</p>
                              <p className="text-xs text-muted-foreground">
                                {eur(i.price_min)} – {eur(i.price_max)} / {i.unit}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Input
                                type="number"
                                min={0}
                                inputMode="decimal"
                                className="w-28 text-right"
                                value={qty[i.code] ?? ""}
                                onChange={(e) => setQty((p) => ({ ...p, [i.code]: e.target.value }))}
                              />
                              <span className="text-xs text-muted-foreground w-8">{i.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-light text-foreground">{c.estimateTitle}</h2>
                        <div className="divide-y divide-border">
                          {rows.map((r) => (
                            <div key={r.item.code} className="flex items-baseline justify-between gap-4 py-3">
                              <span className="text-sm text-foreground">{label(r.item)}</span>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {r.q} {r.item.unit}
                              </span>
                              <span className="text-sm text-foreground whitespace-nowrap">
                                {eur(r.min)} – {eur(r.max)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-baseline justify-between gap-4 pt-4 border-t border-border">
                          <span className="text-sm text-muted-foreground">{c.totalLabel}</span>
                          <span className="text-2xl font-light text-foreground whitespace-nowrap">
                            {eur(totalMin)} – {eur(totalMax)}
                          </span>
                        </div>
                        <p className="flex gap-3 text-sm text-muted-foreground bg-muted/50 border-l-2 border-primary p-4 rounded-r-lg">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          {c.disclaimer}
                        </p>
                      </div>
                    )}

                    {step === 4 && (
                      <form onSubmit={submit} className="space-y-5">
                        <input
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          className="hidden"
                          value={form.honeypot}
                          onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                        />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pq-name">{c.name} *</Label>
                            <Input
                              id="pq-name"
                              value={form.name}
                              maxLength={120}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pq-email">{c.email} *</Label>
                            <Input
                              id="pq-email"
                              type="email"
                              value={form.email}
                              maxLength={255}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pq-phone">{c.phone} *</Label>
                            <Input
                              id="pq-phone"
                              type="tel"
                              value={form.phone}
                              maxLength={50}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pq-city">{c.city}</Label>
                            <Input
                              id="pq-city"
                              value={form.city}
                              maxLength={120}
                              onChange={(e) => setForm({ ...form, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pq-province">{c.province}</Label>
                            <Input
                              id="pq-province"
                              value={form.province}
                              maxLength={60}
                              onChange={(e) => setForm({ ...form, province: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{c.type}</Label>
                            <Select
                              value={form.customerType}
                              onValueChange={(v) => setForm({ ...form, customerType: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="—" />
                              </SelectTrigger>
                              <SelectContent>
                                {CUSTOMER_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label[lang]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pq-notes">{c.notes}</Label>
                          <Textarea
                            id="pq-notes"
                            rows={3}
                            maxLength={2000}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          />
                        </div>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="pq-privacy"
                            checked={form.privacy}
                            onCheckedChange={(v) => setForm({ ...form, privacy: v === true })}
                          />
                          <Label htmlFor="pq-privacy" className="text-sm font-normal leading-relaxed">
                            {c.privacy} —{" "}
                            <a href={`/${lang}/privacy`} className="underline">
                              privacy
                            </a>
                          </Label>
                        </div>
                        <p className="flex gap-3 text-xs text-muted-foreground bg-muted/50 border-l-2 border-primary p-3 rounded-r-lg">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          {c.disclaimer}
                        </p>
                        <Button type="submit" className="w-full" disabled={sending}>
                          {sending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {c.sending}
                            </>
                          ) : (
                            c.submit
                          )}
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </div>

              {/* Nav */}
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> {c.back}
                </Button>
                {step < 4 && (
                  <Button onClick={goNext}>
                    {c.next} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              {step < 3 && rows.length > 0 && (
                <p className="mt-6 text-sm text-muted-foreground text-right">
                  {c.totalLabel}: <span className="text-foreground">{eur(totalMin)} – {eur(totalMax)}</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PreventivoOnline;
