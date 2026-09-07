import { supabase } from '@/integrations/supabase/client';

export interface QuoteClientData {
  nome?: string;
  email?: string;
  telefono?: string;
  citta?: string;
  indirizzo?: string;
  partitaIva?: string;
  referente?: string;
  ruoloReferente?: string;
  tipo?: string;
  tipoAltro?: string;
}

const clean = (v?: string | null) => (v || '').trim();

/** Mappa la tipologia del preventivo sull'enum customer_type del CRM. */
export const mapCustomerType = (tipo?: string): string => {
  switch ((tipo || '').toLowerCase()) {
    case 'architetto': return 'architetto';
    case 'impresa_edile': return 'costruttore';
    case 'cliente_privato': return 'cliente_privato';
    case 'geometra': return 'studio_design';
    default: return 'cliente_privato';
  }
};

/**
 * Registra (o ritrova) un lead a partire dai dati cliente digitati nel preventivo,
 * così alla prossima offerta i dati sono già in anagrafica.
 */
export const ensureLeadForQuote = async (
  cliente: QuoteClientData,
  projectName?: string,
): Promise<{ id: string; created: boolean } | null> => {
  const name = clean(cliente.nome);
  if (!name) return null;
  const email = clean(cliente.email).toLowerCase();
  const phone = clean(cliente.telefono);

  // 1. cliente già esistente? non creare doppioni
  const filters: string[] = [];
  if (email) filters.push(`email.ilike.${email}`);
  if (phone) filters.push(`phone.eq.${phone}`);
  if (filters.length) {
    const { data: existingLead } = await supabase
      .from('leads').select('id').or(filters.join(',')).limit(1).maybeSingle();
    if (existingLead) return { id: existingLead.id, created: false };
  }
  const { data: byName } = await supabase
    .from('leads').select('id').ilike('name', name).limit(1).maybeSingle();
  if (byName) return { id: byName.id, created: false };

  const { data, error } = await supabase.from('leads').insert({
    name,
    email: email || null,
    phone: phone || null,
    city: clean(cliente.citta) || null,
    address: clean(cliente.indirizzo) || null,
    contact_person_name: clean(cliente.referente) || null,
    contact_person_role: clean(cliente.ruoloReferente) || null,
    project_type: clean(projectName) || null,
    source: 'preventivo',
    status: 'nuovo',
    pipeline_stage: 'warm',
    notes: 'Creato automaticamente dal modulo preventivi',
  }).select('id').single();
  if (error) { console.error('ensureLeadForQuote', error); return null; }
  return { id: data.id, created: true };
};

/**
 * Un lead che ha accettato il preventivo diventa cliente in anagrafica.
 * Ritorna l'id del cliente (esistente o appena creato).
 */
export const promoteLeadToCustomer = async (leadId: string): Promise<string | null> => {
  const { data: lead } = await supabase
    .from('leads')
    .select('id, name, email, phone, city, address, province, postal_code, country, company_name, contact_person_name, assigned_salesperson_id')
    .eq('id', leadId).maybeSingle();
  if (!lead) return null;

  const email = clean(lead.email).toLowerCase();
  if (email) {
    const { data: existing } = await supabase
      .from('customers').select('id').ilike('email', email).limit(1).maybeSingle();
    if (existing) return existing.id;
  }
  const { data: byName } = await supabase
    .from('customers').select('id').ilike('company_name', clean(lead.name)).limit(1).maybeSingle();
  if (byName) return byName.id;

  const { data, error } = await supabase.from('customers').insert({
    company_name: clean(lead.company_name) || clean(lead.name),
    first_name: clean(lead.contact_person_name) || null,
    email: lead.email || null,
    phone: lead.phone || null,
    address: lead.address || null,
    city: lead.city || null,
    province: lead.province || null,
    postal_code: lead.postal_code || null,
    country: lead.country || 'Italia',
    customer_type: 'cliente_privato' as any,
    status: 'signed' as any,
    assigned_salesperson_id: lead.assigned_salesperson_id || null,
    notes: 'Convertito da lead a seguito di preventivo accettato',
  }).select('id').single();
  if (error) { console.error('promoteLeadToCustomer', error); return null; }

  await supabase.from('leads').update({ status: 'convertito', pipeline_stage: 'hot' }).eq('id', leadId);
  return data.id;
};

export interface FollowUpQuote {
  id: string;
  quote_number: string | null;
  client_name?: string | null;
  status: string;
  total_amount: number | null;
  sent_date?: string | null;
  created_at: string;
  days: number;
}

/** Preventivi inviati/in trattativa senza risposta da più di `afterDays` giorni. */
export const quotesNeedingFollowUp = (quotes: any[], afterDays = 5): FollowUpQuote[] => {
  const now = Date.now();
  return quotes
    .filter(q => ['sent', 'in_trattativa'].includes(q.status))
    .map(q => {
      const ref = new Date(q.sent_date || q.created_at).getTime();
      return { ...q, days: Math.floor((now - ref) / 86400000) };
    })
    .filter(q => q.days >= afterDays)
    .sort((a, b) => b.days - a.days);
};
