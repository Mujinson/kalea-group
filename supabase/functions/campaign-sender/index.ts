import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { addWorkingDays, isWorkingDay, nowInTz, remainingSlots } from "../_shared/workdays.ts";
import { renderEmail, sendResend } from "../_shared/campaignEmail.ts";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    const body = await req.json().catch(() => ({}));

    // ---- Test mode: admin only ----
    if (body.mode === "test") {
      const auth = req.headers.get("Authorization")?.replace("Bearer ", "");
      const { data: u } = await sb.auth.getUser(auth || "");
      if (!u?.user) return json({ error: "unauthorized" }, 401);
      const { data: isAdmin } = await sb.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      if (!isAdmin) return json({ error: "forbidden" }, 403);
      const to = String(body.to || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return json({ error: "Indirizzo email non valido" }, 400);
      const { data: camp } = await sb.from("email_campaigns").select("*").eq("id", body.campaign_id).maybeSingle();
      if (!camp) return json({ error: "Campagna non trovata" }, 404);
      const { data: tpls } = await sb.from("email_templates").select("*");
      const results: unknown[] = [];
      for (const t of tpls || []) {
        const e = renderEmail({ subject: t.subject, html: t.html_body, name: "Mario", senderName: camp.sender_name, presentationUrl: camp.presentation_url, token: "00000000-0000-0000-0000-000000000000" });
        try {
          const r = await sendResend({ from: `${camp.sender_name} <${camp.sender_email}>`, to: [to], reply_to: camp.reply_to, subject: `[PROVA ${t.key}] ${e.subject}`, html: e.html, text: e.text });
          results.push({ key: t.key, ok: true, id: r.id });
        } catch (err) { results.push({ key: t.key, ok: false, error: String(err) }); }
        await sleep(600);
      }
      return json({ results });
    }

    // ---- Scheduled mode ----
    const { data: camps } = await sb.from("email_campaigns").select("*").eq("status", "active");
    const report: unknown[] = [];
    for (const c of camps || []) {
      const { date, time } = nowInTz(c.timezone || "Europe/Rome");
      if (c.last_run_date === date) { report.push({ id: c.id, skip: "already ran today" }); continue; }
      if (time < String(c.send_time).slice(0, 5)) { report.push({ id: c.id, skip: "before send time" }); continue; }
      if (!isWorkingDay(date, { weekdaysOnly: c.weekdays_only, skipHolidays: c.skip_it_holidays })) {
        await sb.from("email_campaigns").update({ last_run_date: date }).eq("id", c.id);
        report.push({ id: c.id, skip: "not a working day" }); continue;
      }
      // Lock the day first so parallel runs cannot double-send
      const { data: locked } = await sb.from("email_campaigns").update({ last_run_date: date })
        .eq("id", c.id).or(`last_run_date.is.null,last_run_date.neq.${date}`).select("id");
      if (!locked?.length) continue;

      const { data: tpls } = await sb.from("email_templates").select("*");
      const tpl = Object.fromEntries((tpls || []).map((t) => [t.key, t]));
      const { data: due } = await sb.from("email_campaign_recipients").select("*")
        .eq("campaign_id", c.id).eq("status", "sent").lte("follow_up_due_date", date)
        .order("follow_up_due_date").limit(c.daily_limit);
      const slots = remainingSlots(c.daily_limit, 0, due?.length || 0);
      const { data: queued } = slots.firstEmails > 0 ? await sb.from("email_campaign_recipients").select("*")
        .eq("campaign_id", c.id).eq("status", "queued")
        .or(`planned_send_date.is.null,planned_send_date.lte.${date}`)
        .order("planned_send_date", { ascending: true, nullsFirst: false }).order("created_at")
        .limit(slots.firstEmails) : { data: [] };

      const jobs = [
        ...(due || []).slice(0, slots.followUps).map((r) => ({ r, followUp: true })),
        ...(queued || []).map((r) => ({ r, followUp: false })),
      ];
      let sent = 0, skipped = 0, failed = 0;
      for (const { r, followUp } of jobs) {
        // Suppression / lead flags
        const { data: sup } = await sb.from("email_suppressions").select("email").eq("email", r.email).maybeSingle();
        let blocked = !!sup;
        if (!blocked && r.lead_id) {
          const { data: l } = await sb.from("leads").select("do_not_contact, email_invalid").eq("id", r.lead_id).maybeSingle();
          blocked = !!(l?.do_not_contact || l?.email_invalid);
        }
        if (blocked) {
          await sb.from("email_campaign_recipients").update({ status: "skipped", error: "Escluso: disiscritto o email non valida" }).eq("id", r.id);
          skipped++; continue;
        }
        const t = followUp ? tpl["richiamo"] : tpl[r.template_version];
        if (!t) { await sb.from("email_campaign_recipients").update({ error: `Template ${r.template_version} mancante` }).eq("id", r.id); failed++; continue; }
        const e = renderEmail({ subject: t.subject, html: t.html_body, name: r.greeting_name, senderName: c.sender_name, presentationUrl: c.presentation_url, token: r.unsubscribe_token });
        try {
          const res = await sendResend({
            from: `${c.sender_name} <${c.sender_email}>`, to: [r.email], reply_to: c.reply_to,
            subject: e.subject, html: e.html, text: e.text, headers: e.headers,
            tags: [{ name: "campaign", value: c.id }],
          });
          const now = new Date().toISOString();
          await sb.from("email_campaign_recipients").update(followUp
            ? { status: "follow_up_sent", follow_up_at: now, follow_up_message_id: res.id, error: null }
            : { status: "sent", sent_at: now, resend_message_id: res.id, follow_up_due_date: addWorkingDays(date, c.follow_up_after_days), error: null }
          ).eq("id", r.id);
          if (r.lead_id) await sb.from("lead_activities").insert({
            lead_id: r.lead_id, type: "email",
            title: followUp ? `Email di richiamo inviata: ${c.name}` : `Email campagna inviata: ${c.name} (${r.template_version})`,
            description: e.subject, metadata: { campaign_id: c.id, recipient_id: r.id, resend_id: res.id },
          });
          sent++;
        } catch (err) {
          const attempts = (r.attempts || 0) + 1;
          await sb.from("email_campaign_recipients").update({
            attempts, error: String(err).slice(0, 500), ...(attempts >= 3 ? { status: "skipped" } : {}),
          }).eq("id", r.id);
          failed++;
        }
        await sleep(600);
      }
      report.push({ id: c.id, sent, skipped, failed });
    }
    return json({ ok: true, report });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});
