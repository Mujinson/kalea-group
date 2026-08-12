// AI Assistant edge function — Lovable AI (Gemini) + tool calling.
// Tutte le query girano con il token dell'utente => RLS applicata.
// Risposta: SSE (event "delta" col testo progressivo, event "done" col JSON finale).

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const AI_MODEL = 'google/gemini-3-flash-preview';
const MAX_TOOL_ITERATIONS = 6;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ---------------- date helpers ----------------
const TZ = 'Europe/Rome';
function today(): Date {
  const s = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return new Date(s + 'T00:00:00Z');
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
function addDays(d: Date, n: number) { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; }

/** Risolve un periodo testuale in { start, end, prevStart, prevEnd } (YYYY-MM-DD). */
function resolvePeriod(period?: string, start?: string, end?: string) {
  if (start && end) {
    const s = new Date(start + 'T00:00:00Z'), e = new Date(end + 'T00:00:00Z');
    const days = Math.max(1, Math.round((+e - +s) / 86400000) + 1);
    return { start, end, prevStart: iso(addDays(s, -days)), prevEnd: iso(addDays(s, -1)), label: `${start} → ${end}` };
  }
  const t = today();
  const p = (period || 'questo mese').toLowerCase();
  if (p.includes('oggi')) {
    return { start: iso(t), end: iso(t), prevStart: iso(addDays(t, -1)), prevEnd: iso(addDays(t, -1)), label: 'oggi' };
  }
  if (p.includes('ieri')) {
    const y = addDays(t, -1);
    return { start: iso(y), end: iso(y), prevStart: iso(addDays(t, -2)), prevEnd: iso(addDays(t, -2)), label: 'ieri' };
  }
  if (p.includes('settimana')) {
    const dow = (t.getUTCDay() + 6) % 7; // lunedì = 0
    const thisMon = addDays(t, -dow);
    if (p.includes('scorsa') || p.includes('passata')) {
      const s = addDays(thisMon, -7);
      return { start: iso(s), end: iso(addDays(s, 6)), prevStart: iso(addDays(s, -7)), prevEnd: iso(addDays(s, -1)), label: 'settimana scorsa' };
    }
    return { start: iso(thisMon), end: iso(t), prevStart: iso(addDays(thisMon, -7)), prevEnd: iso(addDays(thisMon, -1)), label: 'questa settimana' };
  }
  if (p.includes('anno')) {
    const y = t.getUTCFullYear() - (p.includes('scorso') || p.includes('passato') ? 1 : 0);
    return { start: `${y}-01-01`, end: p.includes('scorso') ? `${y}-12-31` : iso(t), prevStart: `${y - 1}-01-01`, prevEnd: `${y - 1}-12-31`, label: `anno ${y}` };
  }
  // mese
  const back = p.includes('scorso') || p.includes('passato') ? 1 : 0;
  const y = t.getUTCFullYear(), m = t.getUTCMonth() - back;
  const s = new Date(Date.UTC(y, m, 1));
  const e = back ? new Date(Date.UTC(y, m + 1, 0)) : t;
  const ps = new Date(Date.UTC(y, m - 1, 1));
  const pe = new Date(Date.UTC(y, m, 0));
  return { start: iso(s), end: iso(e), prevStart: iso(ps), prevEnd: iso(pe), label: back ? 'mese scorso' : 'questo mese' };
}

const num = (v: unknown) => Number(v ?? 0) || 0;
const like = (s: string) => `%${s.replace(/[%,]/g, ' ').trim()}%`;

type Ref = { etichetta: string; percorso: string };

// ---------------- tool schemas ----------------
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'cerca_preventivo',
      description: 'Cerca preventivi (tabella quotes) per nome cliente parziale o numero preventivo. Ritorna numero, cliente, importo, stato, data e cantiere collegato.',
      parameters: {
        type: 'object',
        properties: {
          cliente_o_numero: { type: 'string', description: 'Nome cliente (anche parziale) o numero preventivo' },
          stato: { type: 'string', description: 'Filtro stato opzionale (draft, sent, accepted, rejected, ...)' },
        },
        required: ['cliente_o_numero'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'incassi_periodo',
      description: 'Somma degli incassi realmente ricevuti (customer_payments) nel periodo, con numero di operazioni e importo medio. Se indichi un cantiere, filtra passando dalle fatture (customer_payments.invoice_id -> customer_invoices.site_id).',
      parameters: {
        type: 'object',
        properties: {
          data_inizio: { type: 'string', description: 'YYYY-MM-DD' },
          data_fine: { type: 'string', description: 'YYYY-MM-DD' },
          periodo: { type: 'string', description: 'In alternativa alle date: "oggi", "questa settimana", "questo mese", "mese scorso", "anno"' },
          cantiere: { type: 'string', description: 'Opzionale: nome, città, indirizzo o UUID del cantiere di cui calcolare gli incassi' },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'andamento_periodo',
      description: 'Confronta un periodo con il precedente equivalente su incassi, preventivi emessi e preventivi accettati.',
      parameters: {
        type: 'object',
        properties: { periodo: { type: 'string', description: '"questo mese", "mese scorso", "questa settimana", "oggi", "anno"' } },
        required: ['periodo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'ore_dipendente',
      description: 'Totale ore lavorate da un dipendente in un periodo, da rapportini (site_work_logs) e timbrature (worker_time_entries), suddivise per cantiere.',
      parameters: {
        type: 'object',
        properties: {
          nome_dipendente: { type: 'string', description: 'Nome o cognome, anche parziale' },
          periodo: { type: 'string', description: '"oggi", "questa settimana", "questo mese", "mese scorso"' },
          data_inizio: { type: 'string' },
          data_fine: { type: 'string' },
        },
        required: ['nome_dipendente'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'attrezzature_cantiere',
      description: 'Elenco attrezzature (site_equipment), materiali (site_materials) e accessori (site_accessories) di un cantiere, evidenziando cosa manca o non è ancora consegnato.',
      parameters: {
        type: 'object',
        properties: { nome_o_id_cantiere: { type: 'string', description: 'Nome, città, indirizzo o UUID del cantiere' } },
        required: ['nome_o_id_cantiere'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cerca_cliente',
      description: 'Cerca un cliente (customers) e restituisce riepilogo: preventivi, cantieri, fatture, ultimo contatto.',
      parameters: {
        type: 'object',
        properties: { nome: { type: 'string', description: 'Nome, cognome, ragione sociale o email, anche parziale' } },
        required: ['nome'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cerca_cantiere',
      description: 'Cerca un cantiere (construction_sites) per nome, progetto, città o indirizzo e ne restituisce stato, date e budget.',
      parameters: {
        type: 'object',
        properties: { nome_o_indirizzo: { type: 'string' } },
        required: ['nome_o_indirizzo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fatture_da_incassare',
      description: 'Elenco fatture (customer_invoices) non ancora saldate, con residuo e giorni di scaduto.',
      parameters: {
        type: 'object',
        properties: {
          solo_scadute: { type: 'boolean', description: 'Se true mostra solo quelle oltre la scadenza' },
          cliente: { type: 'string', description: 'Filtro opzionale sul nome cliente' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cantieri_attivi',
      description: 'Elenco dei cantieri per stato (default: quelli non completati), utile per "cosa abbiamo aperto".',
      parameters: {
        type: 'object',
        properties: { stato: { type: 'string', description: 'Filtro stato opzionale' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'chi_lavora_oggi',
      description: 'Chi ha timbrato oggi (worker_time_entries), su quale cantiere e a che ora.',
      parameters: { type: 'object', properties: { data: { type: 'string', description: 'YYYY-MM-DD, default oggi' } } },
    },
  },
];

// ---------------- tool implementations ----------------
async function fullName(sb: SupabaseClient, table: string, ids: string[]) {
  const map: Record<string, string> = {};
  if (!ids.length) return map;
  const { data } = await sb.from(table).select('id, first_name, last_name, company_name').in('id', ids);
  for (const r of (data || []) as any[]) {
    map[r.id] = r.company_name || [r.first_name, r.last_name].filter(Boolean).join(' ') || '—';
  }
  return map;
}

async function cercaPreventivo(sb: SupabaseClient, a: any, refs: Ref[]) {
  const term = String(a.cliente_o_numero || '').trim();
  if (!term) return { errore: 'Serve un nome cliente o un numero preventivo.' };
  let q = sb.from('quotes')
    .select('id, quote_number, client_name, customer_id, total_amount, vat_amount, status, created_at, accepted_date, project_name, site_id')
    .or(`quote_number.ilike.${like(term)},client_name.ilike.${like(term)},project_name.ilike.${like(term)},subject.ilike.${like(term)}`)
    .order('created_at', { ascending: false })
    .limit(15);
  if (a.stato) q = q.eq('status', a.stato);
  const { data, error } = await q;
  if (error) return { errore: error.message };
  if (!data?.length) return { trovati: 0, messaggio: `Nessun preventivo per "${term}".` };
  const siteIds = data.map((r: any) => r.site_id).filter(Boolean);
  const sites: Record<string, string> = {};
  if (siteIds.length) {
    const { data: s } = await sb.from('construction_sites').select('id, title, city').in('id', siteIds);
    for (const r of (s || []) as any[]) sites[r.id] = [r.title, r.city].filter(Boolean).join(' — ');
  }
  for (const r of data as any[]) refs.push({ etichetta: `Preventivo ${r.quote_number || ''} ${r.client_name || ''}`.trim(), percorso: `/admin/preventivi?id=${r.id}` });
  return {
    trovati: data.length,
    ambiguo: data.length > 1,
    preventivi: (data as any[]).map((r) => ({
      id: r.id, numero: r.quote_number, cliente: r.client_name, importo: num(r.total_amount),
      stato: r.status, data: r.created_at?.slice(0, 10), accettato_il: r.accepted_date?.slice(0, 10) || null,
      progetto: r.project_name, cantiere: r.site_id ? sites[r.site_id] || r.site_id : null,
    })),
  };
}

async function incassiPeriodo(sb: SupabaseClient, a: any, refs: Ref[]) {
  const p = resolvePeriod(a.periodo, a.data_inizio, a.data_fine);
  const cantiere = String(a.cantiere || '').trim();
  let siteInfo: any = null;
  let invoiceIds: string[] | null = null;

  if (cantiere) {
    const { data: sites, error: sErr } = await resolveSite(sb, cantiere);
    if (sErr) return { errore: sErr.message };
    if (!sites?.length) return { trovati: 0, messaggio: `Nessun cantiere trovato per "${cantiere}".` };
    if (sites.length > 1) {
      return { ambiguo: true, candidati: (sites as any[]).map((s) => ({ id: s.id, nome: s.title, citta: s.city })), messaggio: 'Più cantieri corrispondono, chiedi di specificare.' };
    }
    siteInfo = sites[0];
    refs.push({ etichetta: `Cantiere ${siteInfo.title || siteInfo.city}`, percorso: `/admin/cantieri/${siteInfo.id}` });
    // customer_payments non ha site_id: si passa da invoice_id -> customer_invoices.site_id
    const { data: inv, error: iErr } = await sb.from('customer_invoices')
      .select('id, invoice_number').eq('site_id', siteInfo.id).limit(500);
    if (iErr) return { errore: iErr.message };
    invoiceIds = (inv || []).map((r: any) => r.id);
    if (!invoiceIds.length) {
      return {
        periodo: p.label, dal: p.start, al: p.end,
        cantiere: siteInfo.title || siteInfo.project_name,
        incassato: 0, operazioni: 0, importo_medio: 0,
        nota: 'Nessuna fattura collegata a questo cantiere, quindi nessun incasso attribuibile (gli incassi sono legati al cantiere solo tramite le fatture).',
      };
    }
  }

  let q = sb.from('customer_payments')
    .select('amount, payment_date, method, invoice_id').gte('payment_date', p.start).lte('payment_date', p.end).limit(2000);
  if (invoiceIds) q = q.in('invoice_id', invoiceIds);
  const { data, error } = await q;
  if (error) return { errore: error.message };
  const tot = (data || []).reduce((s: number, r: any) => s + num(r.amount), 0);
  return {
    periodo: p.label, dal: p.start, al: p.end,
    cantiere: siteInfo ? (siteInfo.title || siteInfo.project_name) : null,
    fonte: siteInfo ? 'customer_payments filtrati sulle fatture del cantiere (invoice_id -> customer_invoices.site_id)' : 'customer_payments (tutti i clienti)',
    incassato: Math.round(tot * 100) / 100,
    operazioni: data?.length || 0,
    importo_medio: data?.length ? Math.round((tot / data.length) * 100) / 100 : 0,
  };
}


async function andamentoPeriodo(sb: SupabaseClient, a: any) {
  const p = resolvePeriod(a.periodo);
  const block = async (start: string, end: string) => {
    const [pay, quotes] = await Promise.all([
      sb.from('customer_payments').select('amount').gte('payment_date', start).lte('payment_date', end).limit(2000),
      sb.from('quotes').select('total_amount, status, created_at, accepted_date').gte('created_at', start).lte('created_at', end + 'T23:59:59').limit(2000),
    ]);
    const incassi = (pay.data || []).reduce((s: number, r: any) => s + num(r.amount), 0);
    const emessi = quotes.data?.length || 0;
    const acc = (quotes.data || []).filter((r: any) => ['accepted', 'accettato', 'converted'].includes(String(r.status)));
    return {
      incassi: Math.round(incassi * 100) / 100,
      preventivi_emessi: emessi,
      valore_preventivi: Math.round((quotes.data || []).reduce((s: number, r: any) => s + num(r.total_amount), 0) * 100) / 100,
      preventivi_accettati: acc.length,
      valore_accettati: Math.round(acc.reduce((s: number, r: any) => s + num(r.total_amount), 0) * 100) / 100,
      errore: pay.error?.message || quotes.error?.message || null,
    };
  };
  const [corrente, precedente] = await Promise.all([block(p.start, p.end), block(p.prevStart, p.prevEnd)]);
  const delta = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 1000) / 10);
  return {
    periodo: p.label, dal: p.start, al: p.end, confronto_dal: p.prevStart, confronto_al: p.prevEnd,
    corrente, precedente,
    variazioni_pct: {
      incassi: delta(corrente.incassi, precedente.incassi),
      preventivi_emessi: delta(corrente.preventivi_emessi, precedente.preventivi_emessi),
      preventivi_accettati: delta(corrente.preventivi_accettati, precedente.preventivi_accettati),
    },
  };
}

async function oreDipendente(sb: SupabaseClient, a: any, refs: Ref[]) {
  const nome = String(a.nome_dipendente || '').trim();
  const p = resolvePeriod(a.periodo, a.data_inizio, a.data_fine);
  const { data: workers, error: wErr } = await sb.from('workers')
    .select('id, first_name, last_name, user_id, hourly_cost, status')
    .or(`first_name.ilike.${like(nome)},last_name.ilike.${like(nome)},email.ilike.${like(nome)}`)
    .is('deleted_at', null).limit(10);
  if (wErr) return { errore: wErr.message };
  if (!workers?.length) return { trovati: 0, messaggio: `Nessun dipendente trovato con "${nome}".` };
  if (workers.length > 1) {
    return { ambiguo: true, candidati: workers.map((w: any) => `${w.first_name} ${w.last_name}`), messaggio: 'Più dipendenti corrispondono, chiedi di specificare.' };
  }
  const w: any = workers[0];
  refs.push({ etichetta: `${w.first_name} ${w.last_name}`, percorso: `/admin/cantieri-operai/${w.id}` });

  const { data: logs } = await sb.from('site_work_logs')
    .select('site_id, work_date, hours_worked').eq('worker_id', w.id)
    .gte('work_date', p.start).lte('work_date', p.end).limit(1000);

  let entries: any[] = [];
  if (w.user_id) {
    const { data: te } = await sb.from('worker_time_entries')
      .select('event_type, event_at, event_date, site_id').eq('user_id', w.user_id)
      .gte('event_date', p.start).lte('event_date', p.end).order('event_at').limit(2000);
    entries = te || [];
  }

  // ore da timbrature: arrive_site -> leave_site meno pausa
  const byDay: Record<string, any[]> = {};
  for (const e of entries) (byDay[e.event_date] ||= []).push(e);
  let oreTimbrature = 0;
  const perGiorno: any[] = [];
  for (const [day, evs] of Object.entries(byDay)) {
    const at = (t: string) => evs.find((e: any) => e.event_type === t)?.event_at;
    const s = at('arrive_site'), e2 = at('leave_site') || at('arrive_home');
    const bs = at('break_start'), be = at('break_end');
    if (s && e2) {
      let h = (+new Date(e2) - +new Date(s)) / 3600000;
      if (bs && be) h -= (+new Date(be) - +new Date(bs)) / 3600000;
      h = Math.max(0, Math.round(h * 100) / 100);
      oreTimbrature += h;
      perGiorno.push({ data: day, ore: h, cantiere_id: evs.find((x: any) => x.site_id)?.site_id || null });
    }
  }

  const perCantiere: Record<string, number> = {};
  for (const l of (logs || []) as any[]) perCantiere[l.site_id] = (perCantiere[l.site_id] || 0) + num(l.hours_worked);
  for (const g of perGiorno) if (g.cantiere_id) perCantiere[g.cantiere_id] = (perCantiere[g.cantiere_id] || 0) + g.ore;
  const siteIds = Object.keys(perCantiere);
  const names: Record<string, string> = {};
  if (siteIds.length) {
    const { data: s } = await sb.from('construction_sites').select('id, title, city').in('id', siteIds);
    for (const r of (s || []) as any[]) names[r.id] = [r.title, r.city].filter(Boolean).join(' — ');
  }
  const oreRapportini = (logs || []).reduce((s: number, r: any) => s + num(r.hours_worked), 0);
  return {
    dipendente: `${w.first_name} ${w.last_name}`, periodo: p.label, dal: p.start, al: p.end,
    ore_da_rapportini: Math.round(oreRapportini * 100) / 100,
    ore_da_timbrature: Math.round(oreTimbrature * 100) / 100,
    ore_totali: Math.round((oreRapportini + oreTimbrature) * 100) / 100,
    giorni_timbrati: perGiorno.length,
    per_cantiere: siteIds.map((id) => ({ cantiere: names[id] || id, ore: Math.round(perCantiere[id] * 100) / 100 })),
    dettaglio_giornaliero: perGiorno,
  };
}

async function resolveSite(sb: SupabaseClient, term: string) {
  const isUuid = /^[0-9a-f-]{36}$/i.test(term);
  let q = sb.from('construction_sites')
    .select('id, title, project_name, status, city, address, province, planned_start_date, planned_end_date, budget_amount, customer_id, priority')
    .limit(10);
  q = isUuid ? q.eq('id', term) : q.or(`title.ilike.${like(term)},project_name.ilike.${like(term)},city.ilike.${like(term)},address.ilike.${like(term)}`);
  return await q;
}

async function cercaCantiere(sb: SupabaseClient, a: any, refs: Ref[]) {
  const term = String(a.nome_o_indirizzo || '').trim();
  const { data, error } = await resolveSite(sb, term);
  if (error) return { errore: error.message };
  if (!data?.length) return { trovati: 0, messaggio: `Nessun cantiere trovato per "${term}".` };
  for (const s of data as any[]) refs.push({ etichetta: `Cantiere ${s.title || s.project_name || s.city}`, percorso: `/admin/cantieri/${s.id}` });
  return { trovati: data.length, ambiguo: data.length > 1, cantieri: data };
}

async function attrezzatureCantiere(sb: SupabaseClient, a: any, refs: Ref[]) {
  const term = String(a.nome_o_id_cantiere || '').trim();
  const { data: sites, error } = await resolveSite(sb, term);
  if (error) return { errore: error.message };
  if (!sites?.length) return { trovati: 0, messaggio: `Nessun cantiere trovato per "${term}".` };
  if (sites.length > 1) {
    return { ambiguo: true, candidati: (sites as any[]).map((s) => ({ id: s.id, nome: s.title, citta: s.city })), messaggio: 'Più cantieri corrispondono, chiedi di specificare.' };
  }
  const site: any = sites[0];
  refs.push({ etichetta: `Cantiere ${site.title || site.city}`, percorso: `/admin/cantieri/${site.id}` });
  const [eq, mat, acc] = await Promise.all([
    sb.from('site_equipment').select('type, notes, quantity_needed, quantity_on_site, status, expected_date, returned_date').eq('site_id', site.id).limit(200),
    sb.from('site_materials').select('material_name, quantity, unit, unit_cost, total_cost, is_delivered, delivered_at, usage_date').eq('site_id', site.id).limit(200),
    sb.from('site_accessories').select('type, product_name, quantity, unit').eq('site_id', site.id).limit(200),
  ]);
  const attrezzature = (eq.data || []) as any[];
  return {
    cantiere: { id: site.id, nome: site.title || site.project_name, citta: site.city, stato: site.status },
    attrezzature,
    attrezzature_mancanti: attrezzature.filter((e) => ['da_portare', 'mancante'].includes(e.status) || (e.quantity_needed != null && num(e.quantity_on_site) < num(e.quantity_needed))),
    attrezzature_da_ritirare: attrezzature.filter((e) => e.status === 'da_ritirare'),
    materiali: mat.data || [],
    materiali_non_consegnati: ((mat.data || []) as any[]).filter((m) => !m.is_delivered),
    accessori: acc.data || [],
    errori: [eq.error?.message, mat.error?.message, acc.error?.message].filter(Boolean),
  };
}

async function cercaCliente(sb: SupabaseClient, a: any, refs: Ref[]) {
  const term = String(a.nome || '').trim();
  const { data, error } = await sb.from('customers')
    .select('id, first_name, last_name, company_name, email, phone, city, province, status, customer_type, total_value, total_margin, created_at')
    .or(`company_name.ilike.${like(term)},first_name.ilike.${like(term)},last_name.ilike.${like(term)},email.ilike.${like(term)}`)
    .limit(10);
  if (error) return { errore: error.message };
  if (!data?.length) return { trovati: 0, messaggio: `Nessun cliente trovato per "${term}".` };
  if (data.length > 1) {
    return {
      ambiguo: true,
      candidati: (data as any[]).map((c) => ({ id: c.id, nome: c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim(), citta: c.city })),
      messaggio: 'Più clienti corrispondono, chiedi di specificare quale.',
    };
  }
  const c: any = data[0];
  const nome = c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
  refs.push({ etichetta: `Cliente ${nome}`, percorso: `/admin/clienti?id=${c.id}` });
  const [quotes, sites, invoices, visits] = await Promise.all([
    sb.from('quotes').select('id, quote_number, total_amount, status, created_at').eq('customer_id', c.id).order('created_at', { ascending: false }).limit(20),
    sb.from('construction_sites').select('id, title, status, city, planned_end_date').eq('customer_id', c.id).limit(20),
    sb.from('customer_invoices').select('invoice_number, total, paid_amount, status, invoice_date, due_date').eq('customer_id', c.id).order('invoice_date', { ascending: false }).limit(20),
    sb.from('customer_visits').select('visit_date, notes').eq('customer_id', c.id).order('visit_date', { ascending: false }).limit(1),
  ]);
  const inv = (invoices.data || []) as any[];
  return {
    cliente: { ...c, nome },
    preventivi: quotes.data || [],
    cantieri: sites.data || [],
    fatture: inv,
    totale_fatturato: Math.round(inv.reduce((s, r) => s + num(r.total), 0) * 100) / 100,
    totale_incassato: Math.round(inv.reduce((s, r) => s + num(r.paid_amount), 0) * 100) / 100,
    ultimo_contatto: (visits.data || [])[0]?.visit_date || null,
  };
}

async function fattureDaIncassare(sb: SupabaseClient, a: any) {
  let q = sb.from('customer_invoices')
    .select('id, invoice_number, invoice_date, due_date, total, paid_amount, status, customer_id')
    .neq('status', 'pagata').order('due_date', { ascending: true }).limit(100);
  if (a.solo_scadute) q = q.lt('due_date', iso(today()));
  const { data, error } = await q;
  if (error) return { errore: error.message };
  const names = await fullName(sb, 'customers', [...new Set((data || []).map((r: any) => r.customer_id).filter(Boolean))] as string[]);
  let rows = (data || []).map((r: any) => ({
    numero: r.invoice_number, cliente: names[r.customer_id] || '—', totale: num(r.total),
    incassato: num(r.paid_amount), residuo: Math.round((num(r.total) - num(r.paid_amount)) * 100) / 100,
    scadenza: r.due_date, stato: r.status,
    giorni_scaduto: r.due_date ? Math.max(0, Math.round((+today() - +new Date(r.due_date + 'T00:00:00Z')) / 86400000)) : 0,
  }));
  if (a.cliente) rows = rows.filter((r) => r.cliente.toLowerCase().includes(String(a.cliente).toLowerCase()));
  return { fatture: rows, totale_residuo: Math.round(rows.reduce((s, r) => s + r.residuo, 0) * 100) / 100, conteggio: rows.length };
}

async function cantieriAttivi(sb: SupabaseClient, a: any, refs: Ref[]) {
  let q = sb.from('construction_sites')
    .select('id, title, project_name, status, city, planned_start_date, planned_end_date, budget_amount, priority')
    .order('planned_start_date', { ascending: true }).limit(100);
  if (a.stato) q = q.eq('status', a.stato);
  const { data, error } = await q;
  if (error) return { errore: error.message };
  const rows = a.stato ? (data || []) : (data || []).filter((s: any) => !['completato', 'chiuso', 'annullato'].includes(String(s.status)));
  for (const s of rows.slice(0, 5) as any[]) refs.push({ etichetta: `Cantiere ${s.title || s.city}`, percorso: `/admin/cantieri/${s.id}` });
  return { conteggio: rows.length, cantieri: rows };
}

async function chiLavoraOggi(sb: SupabaseClient, a: any) {
  const day = a.data || iso(today());
  const { data, error } = await sb.from('worker_time_entries')
    .select('user_id, worker_id, event_type, event_at, site_id').eq('event_date', day).order('event_at').limit(500);
  if (error) return { errore: error.message };
  if (!data?.length) return { data: day, conteggio: 0, messaggio: 'Nessuna timbratura registrata.' };
  const workerIds = [...new Set(data.map((r: any) => r.worker_id).filter(Boolean))] as string[];
  const names = await fullName(sb, 'workers', workerIds);
  const siteIds = [...new Set(data.map((r: any) => r.site_id).filter(Boolean))] as string[];
  const sites: Record<string, string> = {};
  if (siteIds.length) {
    const { data: s } = await sb.from('construction_sites').select('id, title, city').in('id', siteIds);
    for (const r of (s || []) as any[]) sites[r.id] = [r.title, r.city].filter(Boolean).join(' — ');
  }
  const byWorker: Record<string, any> = {};
  for (const e of data as any[]) {
    const k = e.worker_id || e.user_id;
    byWorker[k] ||= { dipendente: names[e.worker_id] || 'Sconosciuto', cantiere: null, eventi: [] };
    if (e.site_id) byWorker[k].cantiere = sites[e.site_id] || e.site_id;
    byWorker[k].eventi.push({ tipo: e.event_type, ora: new Date(e.event_at).toLocaleTimeString('it-IT', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) });
  }
  const list = Object.values(byWorker);
  return { data: day, conteggio: list.length, dipendenti: list };
}

// ---------------- handler ----------------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) return json({ error: 'LOVABLE_API_KEY non configurata' }, 500);

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Non autenticato' }, 401);

    // client con il token dell'utente => RLS applicata a ogni query
    const sb = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await sb.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'Non autenticato' }, 401);

    let body: any;
    try { body = await req.json(); } catch { return json({ error: 'JSON non valido' }, 400); }
    const message = String(body?.message ?? '').trim();
    if (!message) return json({ error: 'message obbligatorio' }, 400);
    if (message.length > 4000) return json({ error: 'message troppo lungo' }, 400);
    const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];
    const stream = body?.stream !== false;

    const { data: roleRows } = await sb.from('user_roles').select('role').eq('user_id', userData.user.id);
    const roles = (roleRows || []).map((r: any) => r.role);

    const t = today();
    const dataOggi = new Intl.DateTimeFormat('it-IT', { dateStyle: 'full', timeZone: TZ }).format(new Date());

    const systemPrompt = `Sei l'assistente AI del CRM di Kalēa Group. Rispondi SEMPRE in italiano, come un collega diretto: dai subito il numero o l'informazione, senza giri di parole e senza preamboli.

Oggi è ${dataOggi} (${iso(t)}). Usa sempre questa data per interpretare periodi relativi.
Ruoli dell'utente: ${roles.join(', ') || 'nessuno'}. Vedi solo i dati che il tuo profilo può vedere.

Regole:
- Non inventare MAI dati. Per ogni domanda su preventivi, clienti, cantieri, incassi, ore o attrezzature chiama la function giusta.
- Se una function torna 0 risultati, dillo chiaramente ("non ho trovato nulla per X"), non proporre alternative inventate.
- Se una function torna ambiguo=true o più candidati, NON scegliere a caso: elenca i candidati e chiedi quale intende.
- Se una function torna un campo "errore", spiega che c'è stato un problema tecnico nel recupero del dato.
- Importi in euro con separatore italiano, ore con una cifra decimale.
- Risposta breve: 1-4 frasi, o un elenco puntato se ci sono più righe.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 2000) })),
      { role: 'user', content: message },
    ];

    const refs: Ref[] = [];
    const toolLog: any[] = [];

    const runTool = async (name: string, args: any) => {
      switch (name) {
        case 'cerca_preventivo': return await cercaPreventivo(sb, args, refs);
        case 'incassi_periodo': return await incassiPeriodo(sb, args);
        case 'andamento_periodo': return await andamentoPeriodo(sb, args);
        case 'ore_dipendente': return await oreDipendente(sb, args, refs);
        case 'attrezzature_cantiere': return await attrezzatureCantiere(sb, args, refs);
        case 'cerca_cliente': return await cercaCliente(sb, args, refs);
        case 'cerca_cantiere': return await cercaCantiere(sb, args, refs);
        case 'fatture_da_incassare': return await fattureDaIncassare(sb, args);
        case 'cantieri_attivi': return await cantieriAttivi(sb, args, refs);
        case 'chi_lavora_oggi': return await chiLavoraOggi(sb, args);
        default: return { errore: `Tool sconosciuto: ${name}` };
      }
    };

    // ---- fase 1: loop di tool calling (non in streaming) ----
    let finalText = '';
    let needsStream = true;
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const resp = await fetch(AI_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lovableApiKey}` },
        body: JSON.stringify({ model: AI_MODEL, messages, tools: TOOLS, tool_choice: 'auto' }),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        console.error('AI gateway error', resp.status, txt);
        if (resp.status === 429) return json({ error: 'Troppe richieste, riprova tra poco.' }, 429);
        if (resp.status === 402) return json({ error: 'Crediti AI esauriti.' }, 402);
        return json({ error: 'Errore AI gateway', details: txt }, 500);
      }
      const data = await resp.json();
      const msg = data?.choices?.[0]?.message ?? {};
      const calls = msg.tool_calls as any[] | undefined;
      if (!calls?.length) {
        finalText = String(msg.content || '').trim();
        needsStream = false;
        break;
      }
      messages.push({ role: 'assistant', content: msg.content ?? '', tool_calls: calls });
      for (const tc of calls) {
        let args: any = {};
        try { args = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {}; } catch { args = {}; }
        let result: any;
        try { result = await runTool(tc.function?.name, args); }
        catch (e) { result = { errore: (e as Error).message }; }
        toolLog.push({ tool: tc.function?.name, args });
        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result).slice(0, 60000) });
      }
    }

    const uniqueRefs = refs.filter((r, i) => refs.findIndex((x) => x.percorso === r.percorso) === i).slice(0, 6);

    if (!stream) {
      if (needsStream && !finalText) {
        // chiudi con una chiamata finale senza tool
        const resp = await fetch(AI_GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lovableApiKey}` },
          body: JSON.stringify({ model: AI_MODEL, messages }),
        });
        const d = await resp.json();
        finalText = String(d?.choices?.[0]?.message?.content || '').trim();
      }
      return json({ risposta: finalText || 'Non sono riuscito a formulare una risposta.', riferimenti: uniqueRefs, tool_usati: toolLog });
    }

    // ---- fase 2: streaming SSE della risposta finale ----
    const encoder = new TextEncoder();
    const body2 = new ReadableStream({
      async start(controller) {
        const send = (event: string, payload: unknown) =>
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`));
        let text = finalText;
        try {
          if (needsStream) {
            const resp = await fetch(AI_GATEWAY_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lovableApiKey}` },
              body: JSON.stringify({ model: AI_MODEL, messages, stream: true }),
            });
            if (!resp.ok || !resp.body) throw new Error(`AI gateway ${resp.status}`);
            const reader = resp.body.getReader();
            const dec = new TextDecoder();
            let buf = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });
              const lines = buf.split('\n');
              buf = lines.pop() || '';
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const payload = line.slice(6).trim();
                if (payload === '[DONE]') continue;
                try {
                  const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
                  if (delta) { text += delta; send('delta', { testo: delta }); }
                } catch { /* chunk parziale */ }
              }
            }
          } else if (text) {
            send('delta', { testo: text });
          }
          send('done', { risposta: text || 'Non sono riuscito a formulare una risposta.', riferimenti: uniqueRefs, tool_usati: toolLog });
        } catch (e) {
          console.error('stream error', e);
          send('error', { errore: (e as Error).message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body2, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    });
  } catch (e) {
    console.error('ai-assistant error', e);
    return json({ error: (e as Error).message }, 500);
  }
});
