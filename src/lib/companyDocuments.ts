export const DOC_CATEGORIES = [
  { key: 'societari', label: 'Societari', types: ['Visura camerale', 'Statuto', 'Atto costitutivo', 'Certificato attribuzione P.IVA', 'Bilancio'] },
  { key: 'regolarita', label: 'Regolarità e abilitazioni', types: ['DURC', 'Patente a crediti', 'Iscrizione White List', 'Certificato antimafia', 'Regolarità fiscale'] },
  { key: 'sicurezza', label: 'Sicurezza', types: ['DVR', 'POS', 'DUVRI', 'Nomina RSPP', 'Nomina RLS', 'Nomina medico competente', 'Piano emergenza'] },
  { key: 'formazione', label: 'Formazione e corsi', types: ['Formazione generale', 'Formazione specifica', 'Preposto', 'Primo soccorso', 'Antincendio', 'Lavori in quota', 'PLE', 'Carrello elevatore'] },
  { key: 'sanitari', label: 'Visite mediche', types: ['Idoneità sanitaria', 'Visita periodica'] },
  { key: 'certificazioni', label: 'Certificazioni', types: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'SOA', 'Certificazione posatore'] },
  { key: 'assicurazioni', label: 'Assicurazioni', types: ['RC Terzi / RCO', 'Polizza fideiussoria', 'Polizza mezzi'] },
  { key: 'mezzi', label: 'Mezzi e attrezzature', types: ['Libretto', 'Revisione', 'Manutenzione', 'Dichiarazione conformità'] },
  { key: 'altro', label: 'Altro', types: [] as string[] },
] as const;

export type ExpiryStatus = 'none' | 'valid' | 'expiring' | 'expired';

/** Days before expiry when a document is flagged as "in scadenza". */
export const EXPIRING_DAYS = 30;

export function expiryStatus(expiry: string | null | undefined, today: Date = new Date()): ExpiryStatus {
  if (!expiry) return 'none';
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const [y, m, d] = expiry.slice(0, 10).split('-').map(Number);
  const days = Math.round((new Date(y, m - 1, d).getTime() - t) / 86400000);
  if (days < 0) return 'expired';
  if (days <= EXPIRING_DAYS) return 'expiring';
  return 'valid';
}
