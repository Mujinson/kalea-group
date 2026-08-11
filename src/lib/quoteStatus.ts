/**
 * Stati preventivo — sorgente unica per tutto il CRM.
 * Nel DB convivono valori inglesi e italiani: qui normalizziamo una volta sola.
 */

export type QuoteStatusKey =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'converted'
  | 'invoiced'
  | 'rejected'
  | 'expired';

const ALIASES: Record<string, QuoteStatusKey> = {
  draft: 'draft',
  bozza: 'draft',
  nuova: 'draft',
  nuovo: 'draft',
  new: 'draft',

  sent: 'sent',
  inviato: 'sent',
  inviata: 'sent',
  in_attesa: 'sent',
  'in attesa': 'sent',
  pending: 'sent',

  accepted: 'accepted',
  accettato: 'accepted',
  accettata: 'accepted',
  approved: 'accepted',
  approvato: 'accepted',
  approvata: 'accepted',

  converted: 'converted',
  convertito: 'converted',
  convertita: 'converted',
  vinta: 'converted',
  vinto: 'converted',
  won: 'converted',

  invoiced: 'invoiced',
  fatturato: 'invoiced',
  fatturata: 'invoiced',

  rejected: 'rejected',
  rifiutato: 'rejected',
  rifiutata: 'rejected',
  perso: 'rejected',
  persa: 'rejected',
  lost: 'rejected',

  expired: 'expired',
  scaduto: 'expired',
  scaduta: 'expired',
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatusKey, string> = {
  draft: 'Bozza',
  sent: 'Inviato',
  accepted: 'Accettato',
  converted: 'Vinto / Convertito',
  invoiced: 'Fatturato',
  rejected: 'Rifiutato',
  expired: 'Scaduto',
};

export function normalizeQuoteStatus(status?: string | null): QuoteStatusKey {
  const raw = (status || '').toString().trim().toLowerCase();
  return ALIASES[raw] || 'draft';
}

/** Preventivo "vinto": accettato, convertito in vendita o già fatturato. */
export function isQuoteWon(status?: string | null): boolean {
  const k = normalizeQuoteStatus(status);
  return k === 'accepted' || k === 'converted' || k === 'invoiced';
}

export function isQuoteLost(status?: string | null): boolean {
  const k = normalizeQuoteStatus(status);
  return k === 'rejected' || k === 'expired';
}

export function isQuotePending(status?: string | null): boolean {
  return normalizeQuoteStatus(status) === 'sent';
}

/** Tutti i valori DB che contano come "vinto" — per query .in('status', WON_QUOTE_STATUSES) */
export const WON_QUOTE_STATUSES = Object.keys(ALIASES).filter((k) =>
  ['accepted', 'converted', 'invoiced'].includes(ALIASES[k])
);

export function quoteStatusLabel(status?: string | null): string {
  return QUOTE_STATUS_LABELS[normalizeQuoteStatus(status)];
}
