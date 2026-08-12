/**
 * Helper condivisi per il ciclo attivo/passivo (fatture, costi, scadenzario).
 * Importi sempre in euro con due decimali, date in formato italiano gg/mm/aaaa.
 */

export const fmtEur = (v: number | string | null | undefined) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(v) || 0);

export const fmtDateIt = (d?: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const daysUntil = (date?: string | null) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return Math.round((startOfDay(d).getTime() - startOfDay().getTime()) / 86400000);
};

export type DueTone = 'danger' | 'warning' | 'slate' | 'success';

/** Rosso se scaduta, arancione entro 7 giorni, grigio se futura, verde se pagata. */
export const dueTone = (dueDate?: string | null, paid = false): DueTone => {
  if (paid) return 'success';
  const d = daysUntil(dueDate);
  if (d === null) return 'slate';
  if (d < 0) return 'danger';
  if (d <= 7) return 'warning';
  return 'slate';
};

export const SUPPLIER_INVOICE_STATUS_LABEL: Record<string, string> = {
  da_pagare: 'Da pagare',
  pagata_parziale: 'Parziale',
  pagata: 'Pagata',
};

export const VAT_RATES = [0, 4, 10, 22];

export const PAYMENT_METHODS = ['bonifico', 'contanti', 'RiBa', 'carta', 'F24', 'addebito'];

export const COST_CATEGORIES = [
  { value: 'stipendi', label: 'Stipendi' },
  { value: 'affitto_magazzino', label: 'Affitto Magazzino' },
  { value: 'utenze', label: 'Utenze' },
  { value: 'software_saas', label: 'Software / SaaS' },
  { value: 'assicurazioni', label: 'Assicurazioni' },
  { value: 'spese_bancarie', label: 'Spese Bancarie' },
  { value: 'altri_costi_fissi', label: 'Altri Costi Fissi' },
  { value: 'consulenze', label: 'Consulenze' },
  { value: 'contributi_tasse', label: 'Contributi e Tasse' },
  { value: 'automezzi', label: 'Automezzi' },
  { value: 'trasporti', label: 'Trasporti' },
  { value: 'logistica', label: 'Logistica' },
  { value: 'campionature', label: 'Campionature' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'spese_commerciali', label: 'Spese Commerciali' },
  { value: 'materiali', label: 'Materiali' },
  { value: 'altri', label: 'Altri' },
];

export const categoryLabel = (v?: string | null) =>
  COST_CATEGORIES.find((c) => c.value === v)?.label || v || '—';

/** Costi generali (non imputabili a commessa) */
export const GENERAL_COST_CATEGORIES = ['stipendi', 'affitto_magazzino', 'utenze', 'software_saas', 'assicurazioni', 'spese_bancarie', 'altri_costi_fissi', 'consulenze', 'contributi_tasse', 'automezzi'];

/** Moltiplicatore annuo di una frequenza di costo fisso */
export const yearlyFactor = (frequency?: string | null) => {
  switch (frequency) {
    case 'mensile': return 12;
    case 'trimestrale': return 4;
    case 'semestrale': return 2;
    case 'annuale': return 1;
    default: return 0; // una_tantum
  }
};

export const addPeriod = (date: Date, frequency?: string | null) => {
  const d = new Date(date);
  const months = frequency === 'mensile' ? 1 : frequency === 'trimestrale' ? 3 : frequency === 'semestrale' ? 6 : frequency === 'annuale' ? 12 : 0;
  d.setMonth(d.getMonth() + months);
  return d;
};
