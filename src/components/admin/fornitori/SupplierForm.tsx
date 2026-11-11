import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { parseSupplierText, formatIban, type BankAccount } from "@/lib/supplierParse";

export const SUPPLIER_FIELDS = ["name", "vat_number", "fiscal_code", "sdi_code", "contact_person", "phone", "email", "pec", "website", "address", "postal_code", "city", "province", "country", "payment_terms", "notes"] as const;

export function supplierPayload(f: any) {
  const p: any = {};
  for (const k of SUPPLIER_FIELDS) p[k] = (f[k] ?? "").toString().trim() || null;
  p.name = p.name || "";
  p.bank_accounts = (f.bank_accounts || []).filter((b: BankAccount) => b.iban?.trim()).map((b: BankAccount) => ({ bank: b.bank?.trim() || null, iban: b.iban.replace(/\s+/g, "").toUpperCase() }));
  return p;
}

const LABELS: Record<string, string> = {
  name: "Ragione sociale", vat_number: "P.IVA", fiscal_code: "Codice fiscale", sdi_code: "Codice SDI",
  contact_person: "Referente", phone: "Telefono", email: "Email", pec: "PEC", website: "Sito web",
  address: "Indirizzo", postal_code: "CAP", city: "Città", province: "Provincia", country: "Nazione",
  payment_terms: "Condizioni di pagamento abituali",
};

export function SupplierForm({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const [paste, setPaste] = useState("");
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const banks: BankAccount[] = form.bank_accounts || [];
  const setBank = (i: number, patch: Partial<BankAccount>) => set("bank_accounts", banks.map((b, k) => (k === i ? { ...b, ...patch } : b)));

  const autofill = () => {
    const r = parseSupplierText(paste);
    const next = { ...form };
    for (const [k, v] of Object.entries(r)) if (v && (Array.isArray(v) ? v.length : true)) next[k] = v;
    setForm(next);
    setPaste("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
        <Label>Compila automaticamente</Label>
        <Textarea rows={3} value={paste} onChange={(e) => setPaste(e.target.value)}
          placeholder="Incolla qui l'intestazione di un documento o la firma email del fornitore (ragione sociale, indirizzo, P.IVA, telefono, IBAN…)" />
        <Button type="button" size="sm" variant="outline" disabled={!paste.trim()} onClick={autofill}><Wand2 className="w-4 h-4 mr-1" />Compila campi</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUPPLIER_FIELDS.filter((k) => k !== "notes").map((k) => (
          <div key={k} className={k === "name" || k === "address" || k === "payment_terms" ? "sm:col-span-2" : ""}>
            <Label>{LABELS[k]}</Label>
            <Input value={form[k] || ""} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><Label>Coordinate bancarie</Label>
          <Button type="button" size="sm" variant="ghost" onClick={() => set("bank_accounts", [...banks, { bank: "", iban: "" }])}><Plus className="w-4 h-4 mr-1" />Aggiungi IBAN</Button></div>
        {banks.length === 0 && <p className="text-xs text-muted-foreground">Nessun conto inserito.</p>}
        {banks.map((b, i) => (
          <div key={i} className="grid grid-cols-[1fr_1.3fr_auto] gap-2">
            <Input placeholder="Banca" value={b.bank || ""} onChange={(e) => setBank(i, { bank: e.target.value })} />
            <Input placeholder="IBAN" className="font-mono" value={formatIban(b.iban || "")} onChange={(e) => setBank(i, { iban: e.target.value })} />
            <Button type="button" size="icon" variant="ghost" onClick={() => set("bank_accounts", banks.filter((_, k) => k !== i))}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
      <div><Label>Note</Label><Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
    </div>
  );
}
