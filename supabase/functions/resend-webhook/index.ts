import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "npm:svix@1.24.0";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!secret) return new Response("webhook secret not configured", { status: 503 });
  const raw = await req.text();
  let evt: { type: string; data: { email_id?: string; to?: string[] } };
  try {
    evt = new Webhook(secret).verify(raw, {
      "svix-id": req.headers.get("svix-id") || "",
      "svix-timestamp": req.headers.get("svix-timestamp") || "",
      "svix-signature": req.headers.get("svix-signature") || "",
    }) as typeof evt;
  } catch {
    return new Response("invalid signature", { status: 401 });
  }
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const msgId = evt.data?.email_id || null;
  const { data: r } = msgId
    ? await sb.from("email_campaign_recipients").select("id, email, lead_id")
        .or(`resend_message_id.eq.${msgId},follow_up_message_id.eq.${msgId}`).maybeSingle()
    : { data: null };
  await sb.from("email_events").insert({ recipient_id: r?.id ?? null, type: evt.type, resend_message_id: msgId, payload: evt });

  if (r && (evt.type === "email.bounced" || evt.type === "email.complained")) {
    const complained = evt.type === "email.complained";
    await sb.from("email_campaign_recipients").update({ status: complained ? "unsubscribed" : "bounced", error: evt.type }).eq("id", r.id);
    await sb.from("email_suppressions").upsert({ email: r.email, reason: complained ? "complained" : "bounced", lead_id: r.lead_id });
    if (r.lead_id) {
      await sb.from("leads").update(complained ? { do_not_contact: true, email_opt_out_at: new Date().toISOString() } : { email_invalid: true }).eq("id", r.lead_id);
      await sb.from("lead_activities").insert({ lead_id: r.lead_id, type: "email", title: complained ? "Email segnalata come spam" : "Email non consegnata (indirizzo non valido)", metadata: { recipient_id: r.id } });
    }
  }
  return new Response("ok");
});
