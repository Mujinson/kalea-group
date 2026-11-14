// Logica "Servizi B" = voci per APPALTI PUBBLICI.
// Lato admin la sezione si chiama "Servizi B", lato cliente si legge solo
// "Servizi": è lo stesso tipo di prestazione, cambia il regime contrattuale.
// Qui vive la parte decisionale (quali testi e quali rate usare), così è
// testabile senza aprire il generatore di preventivi.
import { PUBLIC_TENDER_TERMS, PUBLIC_TENDER_ACCEPTANCE } from "../data/quotePublicTenderTerms";

/** Voci "Servizi B" (appalti pubblici). */
export type ServiziBLines = readonly unknown[];

/** True se il preventivo contiene almeno una voce Servizi B. */
export const isPublicTenderQuote = (serviziB: ServiziBLines | undefined | null): boolean =>
  Array.isArray(serviziB) && serviziB.length > 0;

/** Rate precompilate per appalto pubblico: anticipazione + 3 SAL (30/25/25/20). */
export const publicTenderPagamenti = () => ([
  { label: "Anticipazione iniziale", pct: 30, data: "", note: "alla conferma dell'ordine, prima dell'avvio delle lavorazioni" },
  { label: "Primo SAL", pct: 25, data: "", note: "al 30% dell'avanzamento delle lavorazioni" },
  { label: "Secondo SAL", pct: 25, data: "", note: "al 60% dell'avanzamento delle lavorazioni" },
  { label: "SAL finale", pct: 20, data: "", note: "all'ultimazione e verifica delle lavorazioni" },
]);

/** Il piano rate standard di Kalēa (acconto / metà lavori / saldo). */
export const isStandardPagamenti = (pagamenti: readonly any[] | undefined | null): boolean => {
  const std = [
    { label: "Acconto", pct: 30 },
    { label: "A metà lavori", pct: 40 },
    { label: "Saldo finale", pct: 30 },
  ];
  if (!Array.isArray(pagamenti) || pagamenti.length !== std.length) return false;
  return std.every((s, i) => String(pagamenti[i]?.label ?? "").trim() === s.label && Number(pagamenti[i]?.pct) === s.pct);
};

/**
 * Le rate SAL si precompilano solo quando la prima voce Servizi B viene
 * aggiunta a un piano rate ancora standard: un preventivo già personalizzato
 * (o recuperato dal database) non viene mai sovrascritto.
 */
export const shouldPrefillSalPagamenti = (
  prevServiziB: ServiziBLines | undefined | null,
  nextServiziB: ServiziBLines | undefined | null,
  currentPagamenti: readonly any[] | undefined | null,
): boolean =>
  !isPublicTenderQuote(prevServiziB) &&
  isPublicTenderQuote(nextServiziB) &&
  isStandardPagamenti(currentPagamenti);

/**
 * Testo "Termini e condizioni" da stampare: con le voci Servizi B valgono le
 * condizioni generali per appalti pubblici, sempre modificabili a mano.
 */
export const resolveQuoteTerms = (opts: {
  serviziB: ServiziBLines | undefined | null;
  terminiCustom: string | null;
  standardTerms: string;
}): string => {
  if (isPublicTenderQuote(opts.serviziB)) return opts.terminiCustom ?? PUBLIC_TENDER_TERMS;
  return opts.terminiCustom ?? opts.standardTerms;
};

/** Riga di accettazione sopra le firme, coerente con il testo stampato. */
export const resolveQuoteAcceptance = (
  serviziB: ServiziBLines | undefined | null,
  standardAcceptance: string,
): string => (isPublicTenderQuote(serviziB) ? PUBLIC_TENDER_ACCEPTANCE : standardAcceptance);
