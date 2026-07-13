// CRM Assistant edge function — placeholder responder.
// Authenticates the user, resolves role + pricing rules, saves the exchange.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Role = 'admin' | 'ibrido' | 'commerciale' | 'operaio';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: cErr } = await caller.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: 'Unauthorized' }, 401);
    const userId = claims.claims.sub as string;

    // Parse body
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

    // Resolve role (priority: admin > ibrido > commerciale > operaio)
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

    // Pricing rules for role
    const { data: rule } = await admin
      .from('pricing_rules')
      .select('max_discount_pct, min_margin_pct, requires_approval_above_discount')
      .eq('role', role)
      .maybeSingle();

    // Get or create conversation
    let conversationId = body.conversation_id;
    if (conversationId) {
      const { data: conv, error: convErr } = await admin
        .from('crm_assistant_conversations')
        .select('id, user_id')
        .eq('id', conversationId)
        .maybeSingle();
      if (convErr || !conv) return json({ error: 'Conversation not found' }, 404);
      if (conv.user_id !== userId && role !== 'admin') {
        return json({ error: 'Forbidden' }, 403);
      }
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

    // Build placeholder reply
    const maxDiscount = rule?.max_discount_pct ?? null;
    const reply = maxDiscount != null
      ? `Ricevuto. Il tuo ruolo è ${role}, il tuo sconto massimo è ${maxDiscount}%.`
      : `Ricevuto. Il tuo ruolo è ${role}, nessuna regola di prezzo configurata.`;

    const { error: asstErr } = await admin.from('crm_assistant_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: reply,
    });
    if (asstErr) return json({ error: 'Save assistant message failed: ' + asstErr.message }, 500);

    return json({
      ok: true,
      conversation_id: conversationId,
      role,
      pricing_rule: rule ?? null,
      reply,
    });
  } catch (e) {
    console.error('crm-assistant error', e);
    return json({ error: (e as Error).message }, 500);
  }
});
