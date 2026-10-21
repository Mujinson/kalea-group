import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const UUID = /^[0-9a-f-]{36}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  let token = url.searchParams.get("t") || "";
  if (!token && req.headers.get("content-type")?.includes("json")) {
    token = (await req.json().catch(() => ({}))).token || "";
  }
  const reply = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!UUID.test(token)) return reply({ error: "Link non valido" }, 400);
  if (req.method === "GET") return reply({ error: "Usa POST" }, 405);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: r } = await sb.from("email_campaign_recipients").select("id, email, lead_id, status").eq("unsubscribe_token", token).maybeSingle();
  if (!r) return reply({ error: "Link non valido" }, 404);
  if (r.status !== "unsubscribed") {
    const now = new Date().toISOString();
    await sb.from("email_campaign_recipients").update({ status: "unsubscribed" }).eq("email", r.email).in("status", ["queued", "sent", "follow_up_sent"]);
    await sb.from("email_campaign_recipients").update({ status: "unsubscribed" }).eq("id", r.id);
    await sb.from("email_suppressions").upsert({ email: r.email, reason: "unsubscribed", lead_id: r.lead_id });
    if (r.lead_id) {
      await sb.from("leads").update({ do_not_contact: true, email_opt_out_at: now }).eq("id", r.lead_id);
      await sb.from("lead_activities").insert({ lead_id: r.lead_id, type: "email", title: "Disiscritto dalle email Kalēa", metadata: { recipient_id: r.id } });
    }
  }
  return reply({ ok: true });
});
