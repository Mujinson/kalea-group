// Calcola km, tempo e pedaggi (sola andata) tra la sede di partenza e il cantiere. Solo admin.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_maps';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) return json({ error: 'Calcolo percorso non configurato.' }, 500);

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Sessione scaduta: rientra nel CRM.' }, 401);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: 'Sessione scaduta: rientra nel CRM.' }, 401);
    const { data: isAdmin } = await sb.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return json({ error: 'Solo gli admin possono calcolare il percorso.' }, 403);

    let body: any;
    try { body = await req.json(); } catch { return json({ error: 'Richiesta non valida.' }, 400); }
    const origin = String(body?.origin || '').trim().slice(0, 200);
    const destination = String(body?.destination || '').trim().slice(0, 300);
    if (!origin || destination.length < 3) return json({ error: 'Inserisci l’indirizzo del cantiere.' }, 400);

    const r = await fetch(`${GATEWAY_URL}/routes/directions/v2:computeRoutes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_MAPS_API_KEY,
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.travelAdvisory.tollInfo',
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: destination },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_UNAWARE',
        extraComputations: ['TOLLS'],
        routeModifiers: { vehicleInfo: { emissionType: 'DIESEL' } },
        languageCode: 'it-IT',
        regionCode: 'IT',
      }),
    });
    const text = await r.text();
    if (!r.ok) {
      console.error(`Routes failed [${r.status}]: ${text}`);
      return json({ error: 'Percorso non calcolabile, controlla l’indirizzo.', status: r.status, details: text }, r.status === 403 ? 403 : 502);
    }
    const route = JSON.parse(text)?.routes?.[0];
    if (!route || route.distanceMeters == null) return json({ error: 'Nessun percorso trovato per questo indirizzo.' }, 404);
    const prices = route.travelAdvisory?.tollInfo?.estimatedPrice || [];
    const eur = prices.find((p: any) => p.currencyCode === 'EUR') || prices[0];
    const toll = eur ? Number(eur.units || 0) + Number(eur.nanos || 0) / 1e9 : 0;
    return json({
      kmOneWay: Math.round((route.distanceMeters / 1000) * 10) / 10,
      minutesOneWay: Math.round(parseFloat(String(route.duration || '0').replace('s', '')) / 60),
      tollOneWay: Math.round(toll * 100) / 100,
      tollKnown: !!eur,
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'Errore nel calcolo del percorso.' }, 500);
  }
});
