/**
 * Stati cantiere — sorgente unica per tutto il CRM.
 * Il DB accetta testo libero: qui normalizziamo e diamo etichette/colori coerenti.
 */

export type SiteStatusKey =
  | 'pianificato'
  | 'in_corso'
  | 'meta_lavori'
  | 'sospeso'
  | 'completato'
  | 'annullato';

export const SITE_STATUSES: { value: SiteStatusKey; label: string }[] = [
  { value: 'pianificato', label: 'Pianificato' },
  { value: 'in_corso', label: 'Iniziato / In corso' },
  { value: 'meta_lavori', label: 'A metà lavori' },
  { value: 'sospeso', label: 'Sospeso / In pausa' },
  { value: 'completato', label: 'Completato' },
  { value: 'annullato', label: 'Annullato' },
];

const ALIASES: Record<string, SiteStatusKey> = {
  attivo: 'in_corso',
  active: 'in_corso',
  in_progress: 'in_corso',
  'in corso': 'in_corso',
  iniziato: 'in_corso',
  avviato: 'in_corso',
  da_iniziare: 'pianificato',
  planned: 'pianificato',
  programmato: 'pianificato',
  'meta lavori': 'meta_lavori',
  'a_meta_lavori': 'meta_lavori',
  pausa: 'sospeso',
  in_pausa: 'sospeso',
  paused: 'sospeso',
  completed: 'completato',
  chiuso: 'completato',
  finito: 'completato',
  terminato: 'completato',
  cancelled: 'annullato',
  annullata: 'annullato',
};

/** Restituisce la chiave canonica, oppure la stringa originale se è uno stato libero. */
export const normalizeSiteStatus = (s?: string | null): string => {
  const raw = (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!raw) return 'pianificato';
  if (SITE_STATUSES.some((x) => x.value === raw)) return raw;
  return ALIASES[raw] || ALIASES[raw.replace(/ /g, '_')] || raw;
};

export const siteStatusLabel = (s?: string | null): string => {
  const k = normalizeSiteStatus(s);
  return SITE_STATUSES.find((x) => x.value === k)?.label || (s || '—');
};

/** Stati considerati "cantiere attivo" nelle dashboard e nei KPI. */
export const ACTIVE_SITE_STATUSES: string[] = ['in_corso', 'meta_lavori'];
export const DONE_SITE_STATUSES: string[] = ['completato', 'annullato'];

export const isSiteActive = (s?: string | null) =>
  ACTIVE_SITE_STATUSES.includes(normalizeSiteStatus(s));
export const isSiteDone = (s?: string | null) =>
  DONE_SITE_STATUSES.includes(normalizeSiteStatus(s));
export const isSitePlanned = (s?: string | null) =>
  normalizeSiteStatus(s) === 'pianificato';
export const isSitePaused = (s?: string | null) =>
  normalizeSiteStatus(s) === 'sospeso';

/** Varianti DB (incluse legacy) per query .in('status', ...) */
export const DB_ACTIVE_STATUSES = ['in_corso', 'meta_lavori', 'attivo', 'in_progress', 'iniziato'];
export const DB_DONE_STATUSES = ['completato', 'completed', 'chiuso', 'annullato'];

export const siteStatusColor = (s?: string | null): string => {
  switch (normalizeSiteStatus(s)) {
    case 'in_corso': return '#16A34A';
    case 'meta_lavori': return '#0EA5E9';
    case 'completato': return '#2563EB';
    case 'sospeso': return '#F59E0B';
    case 'annullato': return '#EF4444';
    case 'pianificato': return '#8B5CF6';
    default: return '#9CA3AF';
  }
};

export const siteStatusClasses = (s?: string | null): string => {
  switch (normalizeSiteStatus(s)) {
    case 'in_corso': return 'bg-green-100 text-green-800 border-green-200';
    case 'meta_lavori': return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'completato': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'sospeso': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'annullato': return 'bg-red-100 text-red-700 border-red-200';
    case 'pianificato': return 'bg-violet-100 text-violet-800 border-violet-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
