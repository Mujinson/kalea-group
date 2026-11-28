// Legge gli eventi del Calendario Kalēa da Google Calendar tramite Connector Gateway. Solo admin.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_calendar/calendar/v3';
const CALENDAR_ID =
  '135b1a2f990dd0c5081b9ac59698f6c310f5d5bf93ac607c75d13922ba84eac6@group.calendar.google.com';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_CALENDAR_API_KEY = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    if (!LOVABLE_API_KEY || !GOOGLE_CALENDAR_API_KEY) {
      return json({ error: 'Google Calendar non configurato.' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Sessione scaduta: rientra nel CRM.' }, 401);
    }

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: 'Sessione scaduta: rientra nel CRM.' }, 401);

    const { data: isAdmin } = await sb.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return json({ error: 'Solo gli admin possono leggere il calendario.' }, 403);

    let body: { timeMin?: string; timeMax?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const now = new Date();
    const defaultMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const defaultMax = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59).toISOString();
    const timeMin = typeof body.timeMin === 'string' && !Number.isNaN(Date.parse(body.timeMin)) ? body.timeMin : defaultMin;
    const timeMax = typeof body.timeMax === 'string' && !Number.isNaN(Date.parse(body.timeMax)) ? body.timeMax : defaultMax;

    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
      timeMin,
      timeMax,
    });

    const url = `${GATEWAY_URL}/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_CALENDAR_API_KEY,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Google Calendar request failed [${res.status}]: ${errorBody}`);
      if (res.status === 404) {
        return json(
          {
            error:
              'Il calendario Kalēa non è condiviso con l’account Google collegato (kalea.pavimenti@gmail.com). Condividi il calendario con kalea.pavimenti@gmail.com da Google Calendar oppure collega l’account Google che lo possiede.',
            code: 'CALENDAR_NOT_SHARED',
            status: 404,
            details: errorBody,
          },
          404,
        );
      }
      return json(
        { error: 'Impossibile leggere gli eventi da Google Calendar.', status: res.status, details: errorBody },
        res.status,
      );
    }

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const events = items
      .filter((e: any) => e && e.status !== 'cancelled')
      .map((e: any) => {
        const allDay = Boolean(e.start?.date && !e.start?.dateTime);
        return {
          id: String(e.id || ''),
          summary: String(e.summary || '(Senza titolo)'),
          description: typeof e.description === 'string' ? e.description : '',
          location: typeof e.location === 'string' ? e.location : '',
          htmlLink: typeof e.htmlLink === 'string' ? e.htmlLink : '',
          allDay,
          startDate: allDay ? String(e.start.date) : null,
          endDate: allDay ? String(e.end?.date || e.start.date) : null,
          startDateTime: !allDay ? String(e.start?.dateTime || '') : null,
          endDateTime: !allDay ? String(e.end?.dateTime || '') : null,
        };
      });

    return json({ calendarSummary: data.summary || 'Calendario Kalēa', events });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('google-calendar-events unexpected error:', msg);
    return json({ error: 'Errore interno nella lettura del calendario.', details: msg }, 500);
  }
});