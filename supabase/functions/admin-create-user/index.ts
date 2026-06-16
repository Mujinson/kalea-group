// Admin-only edge function to create a new user (commerciale/operaio/ibrido/admin)
// in a single transaction: auth user + role + salespeople/workers row.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Role = 'admin' | 'commerciale' | 'operaio' | 'ibrido';

interface Body {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: Role;
  is_commission_earner?: boolean;
  commission_rate?: number;
  hourly_cost?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate caller is admin
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: cErr } = await caller.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: 'Unauthorized' }, 401);

    const callerId = claims.claims.sub as string;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: isAdminRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'admin')
      .maybeSingle();
    if (!isAdminRow) return json({ error: 'Forbidden — admin only' }, 403);

    const body = (await req.json()) as Body;
    if (!body?.email || !body?.password || !body?.role || !body?.first_name) {
      return json({ error: 'Missing required fields' }, 400);
    }

    // 1. Create auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { first_name: body.first_name, last_name: body.last_name },
    });
    if (createErr || !created.user) {
      return json({ error: createErr?.message || 'Create user failed' }, 400);
    }

    const newUserId = created.user.id;

    // 2. Assign role
    const dbRole = body.role; // admin/commerciale/operaio/ibrido already valid enum
    const { error: roleErr } = await admin.from('user_roles').insert({
      user_id: newUserId,
      role: dbRole,
    });
    if (roleErr) {
      await admin.auth.admin.deleteUser(newUserId).catch(() => {});
      return json({ error: 'Role insert failed: ' + roleErr.message }, 500);
    }

    // 3. Create salespeople row for commerciale / ibrido
    if (body.role === 'commerciale' || body.role === 'ibrido') {
      const { error: spErr } = await admin.from('salespeople').insert({
        user_id: newUserId,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone || null,
        commission_rate: body.commission_rate ?? 0,
        is_commission_earner: body.is_commission_earner ?? (body.role === 'ibrido'),
        is_active: true,
      });
      if (spErr) console.error('salespeople insert failed', spErr);
    }

    // 4. Create workers row for operaio / ibrido
    if (body.role === 'operaio' || body.role === 'ibrido') {
      const { error: wErr } = await admin.from('workers').insert({
        user_id: newUserId,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone || null,
        hourly_cost: body.hourly_cost ?? 0,
        role: body.role === 'ibrido' ? 'ibrido' : 'operaio',
        status: 'attivo',
      });
      if (wErr) console.error('workers insert failed', wErr);
    }

    return json({ ok: true, user_id: newUserId }, 200);
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
