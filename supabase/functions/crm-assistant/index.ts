// CRM Assistant edge function — Lovable AI Gateway + tool calling.
// Authenticates the user, resolves role + pricing rules, runs an AI loop
// with function calling against Supabase, saves the exchange.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const AI_MODEL = 'google/gemini-3-flash-preview';
const MAX_TOOL_ITERATIONS = 5;

type Role = 'admin' | 'ibrido' | 'commerciale' | 'operaio';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ---------- Tool schemas exposed to the model ----------
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_leads',
      description:
        'Cerca lead nel CRM filtrando per stato, provenienza e periodo (giorni indietro). Ritorna una lista sintetica e il conteggio totale. Per i commerciali filtra automaticamente solo i lead a loro assegnati.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Stato del lead (es. nuovo, contattato, qualificato, perso, chiuso)' },
          source: { type: 'string', description: 'Provenienza (es. website, instagram, whatsapp, referral)' },
          days: { type: 'number', description: 'Numero di giorni da oggi indietro per filtrare per created_at' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_quote_detail',
      description:
        'Restituisce i dettagli di un preventivo (importo totale, stato, sconto applicato se presente, margine stimato) dato il suo id.',
      parameters: {
        type: 'object',
        properties: {
          quote_id: { type: 'string', description: 'UUID del preventivo' },
        },
        required: ['quote_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_discount_allowed',
      description:
        "Verifica se una percentuale di sconto richiesta è ammessa per l'utente corrente, in base alle sue pricing_rules.",
      parameters: {
        type: 'object',
        properties: {
          requested_pct: { type: 'number', description: 'Percentuale di sconto richiesta (0-100)' },
        },
        required: ['requested_pct'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_site_status',
      description:
        'Restituisce info sui cantieri: se site_id è passato, dettagli di quel cantiere; altrimenti (o se only_delayed=true) elenco dei cantieri in ritardo (planned_end_date passata e status non completato/chiuso). Per non-admin filtra automaticamente i cantieri del commerciale.',
      parameters: {
        type: 'object',
        properties: {
          site_id: { type: 'string', description: 'UUID del cantiere (opzionale)' },
          only_delayed: { type: 'boolean', description: 'Se true, restituisce solo i cantieri in ritardo' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_crew_availability',
      description:
        "Verifica la disponibilità delle squadre in un intervallo di date. Restituisce per ogni squadra se è libera o occupata (con id cantiere e date). Se crew_id è passato, limita alla singola squadra.",
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string', description: 'Data inizio periodo (YYYY-MM-DD)' },
          end_date: { type: 'string', description: 'Data fine periodo (YYYY-MM-DD)' },
          crew_id: { type: 'string', description: 'UUID squadra (opzionale)' },
        },
        required: ['start_date', 'end_date'],
      },
    },
  },
];


// ---------- Tool implementations ----------
async function toolSearchLeads(
  admin: ReturnType<typeof createClient>,
  args: { status?: string; source?: string; days?: number },
  ctx: { role: Role; salespersonId: string | null },
) {
  let q = admin
    .from('leads')
    .select('id, code, name, company_name, city, status, source, assigned_salesperson_id, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(20);

  if (args.status) q = q.eq('status', args.status);
  if (args.source) q = q.eq('source', args.source);
  if (typeof args.days === 'number' && args.days > 0) {
    const since = new Date(Date.now() - args.days * 86400_000).toISOString();
    q = q.gte('created_at', since);
  }
  // Non-admin sees only own leads (same logic as AdminLeads.tsx: !isAdmin && salespersonId)
  if (ctx.role !== 'admin') {
    if (ctx.salespersonId) {
      q = q.eq('assigned_salesperson_id', ctx.salespersonId);
    } else {
      return { total: 0, leads: [], note: 'Nessun profilo commerciale collegato all\'utente.' };
    }
  }

  const { data, count, error } = await q;
  if (error) return { error: error.message };
  return {
    total: count ?? data?.length ?? 0,
    returned: data?.length ?? 0,
    leads: data ?? [],
  };
}

async function toolGetQuoteDetail(
  admin: ReturnType<typeof createClient>,
  args: { quote_id: string },
  ctx: { role: Role; salespersonId: string | null; userId: string },
) {
  const { data: quote, error } = await admin
    .from('quotes')
    .select('id, quote_number, status, total_amount, vat_amount, vat_rate, project_name, customer_id, lead_id, items, additional_costs, created_at, created_by, assigned_to')
    .eq('id', args.quote_id)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!quote) return { error: 'Preventivo non trovato' };

  // Visibility rule: non-admin (commerciale/ibrido) only sees quotes tied to own leads/customers.
  if (ctx.role !== 'admin' && ctx.role !== 'operaio' && ctx.salespersonId) {
    let allowed = false;
    if (quote.lead_id) {
      const { data: lead } = await admin
        .from('leads')
        .select('assigned_salesperson_id')
        .eq('id', quote.lead_id)
        .maybeSingle();
      if (lead?.assigned_salesperson_id === ctx.salespersonId) allowed = true;
    }
    if (!allowed && quote.customer_id) {
      const { data: cust } = await admin
        .from('customers')
        .select('assigned_salesperson_id')
        .eq('id', quote.customer_id)
        .maybeSingle();
      if (cust?.assigned_salesperson_id === ctx.salespersonId) allowed = true;
    }
    if (!allowed) return { error: 'Non hai accesso a questo preventivo.' };
  }
  if (ctx.role === 'operaio') return { error: 'Ruolo non autorizzato a vedere i dettagli dei preventivi.' };

  // Compute discount + margin from items when possible.
  const items: any[] = Array.isArray(quote.items) ? quote.items : [];
  let listSum = 0;
  let costSum = 0;
  let netSum = 0;
  for (const it of items) {
    const qty = Number(it?.quantity ?? it?.qty ?? 1);
    const list = Number(it?.list_price ?? it?.unit_price ?? 0);
    const net = Number(it?.total ?? it?.totale ?? qty * (Number(it?.unit_price ?? 0)));
    const cost = Number(it?.cost ?? it?.unit_cost ?? 0);
    listSum += list * qty;
    netSum += net;
    costSum += cost * qty;
  }
  const discountPct = listSum > 0 ? Math.max(0, Math.round((1 - netSum / listSum) * 10000) / 100) : null;
  const marginPct = netSum > 0 && costSum > 0 ? Math.round(((netSum - costSum) / netSum) * 10000) / 100 : null;

  return {
    id: quote.id,
    quote_number: quote.quote_number,
    status: quote.status,
    project_name: quote.project_name,
    total_amount: Number(quote.total_amount ?? 0),
    vat_rate: quote.vat_rate,
    discount_pct_estimated: discountPct,
    margin_pct_estimated: marginPct,
    line_items_count: items.length,
    created_at: quote.created_at,
  };
}

function toolCheckDiscount(
  args: { requested_pct: number },
  ctx: { role: Role; maxDiscount: number | null },
) {
  const max = ctx.maxDiscount ?? 0;
  const requested = Number(args.requested_pct);
  if (Number.isNaN(requested)) {
    return { allowed: false, max_allowed: max, message: 'Percentuale non valida.' };
  }
  if (max <= 0) {
    return { allowed: false, max_allowed: 0, message: `Nessuna regola di sconto configurata per il ruolo ${ctx.role}.` };
  }
  if (requested <= max) {
    return { allowed: true, max_allowed: max, message: `Sconto del ${requested}% consentito (limite ${max}%).` };
  }
  return {
    allowed: false,
    max_allowed: max,
    message: `Sconto del ${requested}% NON consentito: supera il massimo del ${max}% previsto per il ruolo ${ctx.role}. Serve approvazione.`,
  };
}

const COMPLETED_SITE_STATUSES = ['completato', 'completed', 'chiuso', 'closed', 'archiviato', 'annullato'];

async function toolGetSiteStatus(
  admin: ReturnType<typeof createClient>,
  args: { site_id?: string; only_delayed?: boolean },
  ctx: { role: Role; salespersonId: string | null },
) {
  if (args.site_id) {
    let q = admin
      .from('construction_sites')
      .select('id, title, status, city, province, planned_start_date, planned_end_date, start_date, end_date, floor_sqm, priority, salesperson_id')
      .eq('id', args.site_id);
    if (ctx.role !== 'admin') {
      if (!ctx.salespersonId) return { error: 'Nessun profilo commerciale collegato all\'utente.' };
      q = q.eq('salesperson_id', ctx.salespersonId);
    }
    const { data, error } = await q.maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: 'Cantiere non trovato o non accessibile.' };
    return data;
  }

  // List: default = delayed
  const today = new Date().toISOString().slice(0, 10);
  let q = admin
    .from('construction_sites')
    .select('id, title, status, city, province, planned_start_date, planned_end_date, priority, salesperson_id', { count: 'exact' })
    .lt('planned_end_date', today)
    .not('status', 'in', `(${COMPLETED_SITE_STATUSES.map((s) => `"${s}"`).join(',')})`)
    .order('planned_end_date', { ascending: true })
    .limit(30);
  if (ctx.role !== 'admin') {
    if (!ctx.salespersonId) return { total: 0, sites: [], note: 'Nessun profilo commerciale collegato all\'utente.' };
    q = q.eq('salesperson_id', ctx.salespersonId);
  }
  const { data, count, error } = await q;
  if (error) return { error: error.message };
  return {
    total: count ?? data?.length ?? 0,
    returned: data?.length ?? 0,
    delayed_sites: data ?? [],
  };
}

async function toolCheckCrewAvailability(
  admin: ReturnType<typeof createClient>,
  args: { start_date: string; end_date: string; crew_id?: string },
) {
  if (!args.start_date || !args.end_date) {
    return { error: 'start_date e end_date sono obbligatorie (YYYY-MM-DD).' };
  }

  // Crews list (optionally filtered)
  let crewsQ = admin.from('crews').select('id, name, max_workers, active');
  if (args.crew_id) crewsQ = crewsQ.eq('id', args.crew_id);
  const { data: crews, error: crewsErr } = await crewsQ;
  if (crewsErr) return { error: crewsErr.message };
  if (!crews || crews.length === 0) return { crews: [], note: 'Nessuna squadra trovata.' };

  // Overlapping assignments: start_date <= end_date_req AND end_date >= start_date_req
  let assignQ = admin
    .from('crew_assignments')
    .select('id, crew_id, site_id, start_date, end_date, hours_per_day')
    .lte('start_date', args.end_date)
    .gte('end_date', args.start_date);
  if (args.crew_id) assignQ = assignQ.eq('crew_id', args.crew_id);
  const { data: assignments, error: aErr } = await assignQ;
  if (aErr) return { error: aErr.message };

  const byCrew = new Map<string, any[]>();
  for (const a of assignments ?? []) {
    const list = byCrew.get(a.crew_id) ?? [];
    list.push({ site_id: a.site_id, start_date: a.start_date, end_date: a.end_date, hours_per_day: a.hours_per_day });
    byCrew.set(a.crew_id, list);
  }

  return {
    period: { start_date: args.start_date, end_date: args.end_date },
    crews: crews.map((c: any) => {
      const busy = byCrew.get(c.id) ?? [];
      return {
        crew_id: c.id,
        crew_name: c.name,
        max_workers: c.max_workers,
        active: c.active,
        available: busy.length === 0 && c.active !== false,
        assignments: busy,
      };
    }),
  };
}



Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) return json({ error: 'LOVABLE_API_KEY not configured' }, 500);

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: cErr } = await caller.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: 'Unauthorized' }, 401);
    const userId = claims.claims.sub as string;

    let body: { message?: string; conversation_id?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }
    const message = (body?.message ?? '').toString().trim();
    if (!message) return json({ error: 'message is required' }, 400);
    if (message.length > 4000) return json({ error: 'message too long' }, 400);

    const admin = createClient(supabaseUrl, serviceKey);

    // Resolve role
    const { data: rolesRows } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const roleList = (rolesRows || []).map((r: any) => r.role as string);
    let role: Role | null = null;
    if (roleList.includes('admin')) role = 'admin';
    else if (roleList.includes('ibrido')) role = 'ibrido';
    else if (roleList.includes('commerciale')) role = 'commerciale';
    else if (roleList.includes('operaio')) role = 'operaio';
    if (!role) return json({ error: 'No role assigned to user' }, 403);

    // Salesperson id (for commerciale filtering)
    let salespersonId: string | null = null;
    if (role === 'commerciale' || role === 'ibrido') {
      const { data: sp } = await admin
        .from('salespeople')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      salespersonId = sp?.id ?? null;
    }

    // Pricing rules
    const { data: rule } = await admin
      .from('pricing_rules')
      .select('max_discount_pct, min_margin_pct, requires_approval_above_discount')
      .eq('role', role)
      .maybeSingle();
    const maxDiscount = rule?.max_discount_pct != null ? Number(rule.max_discount_pct) : null;
    const minMargin = rule?.min_margin_pct != null ? Number(rule.min_margin_pct) : null;

    // Conversation
    let conversationId = body.conversation_id;
    if (conversationId) {
      const { data: conv, error: convErr } = await admin
        .from('crm_assistant_conversations')
        .select('id, user_id')
        .eq('id', conversationId)
        .maybeSingle();
      if (convErr || !conv) return json({ error: 'Conversation not found' }, 404);
      if (conv.user_id !== userId && role !== 'admin') return json({ error: 'Forbidden' }, 403);
      await admin
        .from('crm_assistant_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } else {
      const { data: created, error: createErr } = await admin
        .from('crm_assistant_conversations')
        .insert({ user_id: userId, title: message.slice(0, 60) })
        .select('id')
        .single();
      if (createErr || !created) return json({ error: 'Create conversation failed' }, 500);
      conversationId = created.id;
    }

    // Save user message
    const { error: userMsgErr } = await admin.from('crm_assistant_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    });
    if (userMsgErr) return json({ error: 'Save user message failed: ' + userMsgErr.message }, 500);

    // Load prior history for context (last 20 messages)
    const { data: history } = await admin
      .from('crm_assistant_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    // System prompt
    const systemPrompt = `Sei l'assistente CRM di Kalēa. Rispondi SEMPRE in italiano, in modo conciso e concreto (max 4-5 frasi salvo elenchi).

Contesto utente corrente:
- Ruolo: ${role}
- Sconto massimo consentito: ${maxDiscount != null ? maxDiscount + '%' : 'non configurato'}
- Margine minimo richiesto: ${minMargin != null ? minMargin + '%' : 'non configurato'}

Regole assolute:
- Non inventare MAI numeri, importi, sconti, margini, quantità di lead o dettagli di preventivi. Se non hai il dato, chiama una function per ottenerlo.
- Usa search_leads per ogni domanda su lead / pipeline / provenienze / periodi.
- Usa get_quote_detail quando l'utente chiede info su uno specifico preventivo (deve fornire l'id o va chiesto).
- Usa check_discount_allowed ogni volta che l'utente ti chiede se può applicare uno sconto X%.
- Se una function ritorna un errore o "non trovato", dillo chiaramente, non fabbricare dati.
- Basa la risposta finale SOLO sui dati restituiti dalle function.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(history ?? []).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    // Tool loop
    const toolCallsLog: any[] = [];
    let finalReply = '';
    let iterations = 0;

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;
      const aiResp = await fetch(AI_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages,
          tools: TOOLS,
          tool_choice: 'auto',
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error('AI gateway error', aiResp.status, errText);
        if (aiResp.status === 429) {
          return json({ error: 'Troppe richieste, riprova tra poco.' }, 429);
        }
        if (aiResp.status === 402) {
          return json({ error: 'Crediti AI esauriti. Ricarica il workspace.' }, 402);
        }
        return json({ error: 'AI gateway error', details: errText }, 500);
      }

      const aiData = await aiResp.json();
      const choice = aiData?.choices?.[0];
      const assistantMsg = choice?.message ?? {};
      const toolCalls = assistantMsg.tool_calls as any[] | undefined;

      if (!toolCalls || toolCalls.length === 0) {
        finalReply = (assistantMsg.content ?? '').toString().trim() || 'Non ho ricevuto una risposta dal modello.';
        break;
      }

      // Push assistant message with tool_calls into history
      messages.push({
        role: 'assistant',
        content: assistantMsg.content ?? '',
        tool_calls: toolCalls,
      });

      for (const tc of toolCalls) {
        const name = tc?.function?.name;
        let args: any = {};
        try {
          args = tc?.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          args = {};
        }

        let result: any;
        try {
          if (name === 'search_leads') {
            result = await toolSearchLeads(admin, args, { role, salespersonId });
          } else if (name === 'get_quote_detail') {
            result = await toolGetQuoteDetail(admin, args, { role, salespersonId, userId });
          } else if (name === 'check_discount_allowed') {
            result = toolCheckDiscount(args, { role, maxDiscount });
          } else {
            result = { error: `Unknown tool: ${name}` };
          }
        } catch (e) {
          result = { error: (e as Error).message };
        }

        toolCallsLog.push({ name, arguments: args, result });

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }
    }

    if (!finalReply) {
      finalReply = 'Ho raccolto i dati necessari ma non sono riuscito a formulare una risposta. Riprova con una domanda più specifica.';
    }

    // Save assistant message
    const { error: asstErr } = await admin.from('crm_assistant_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: finalReply,
      tool_calls: toolCallsLog.length > 0 ? toolCallsLog : null,
    });
    if (asstErr) return json({ error: 'Save assistant message failed: ' + asstErr.message }, 500);

    return json({
      ok: true,
      conversation_id: conversationId,
      role,
      pricing_rule: rule ?? null,
      reply: finalReply,
      tool_calls: toolCallsLog,
    });
  } catch (e) {
    console.error('crm-assistant error', e);
    return json({ error: (e as Error).message }, 500);
  }
});
