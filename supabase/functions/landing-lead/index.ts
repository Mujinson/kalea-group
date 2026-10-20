import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || Deno.env.get("TELEGRAM_API_KEY") || "";
const NOTIFY_CHAT_ID = Deno.env.get("TELEGRAM_NOTIFY_CHAT_ID") || "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clean(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLength);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Troppe richieste. Riprova più tardi." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const raw = await req.json();

    // Honeypot: pretend success to bots
    if (clean(raw.honeypot, 200) !== "") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const name = clean(raw.name, 120);
    const phone = clean(raw.phone, 40);
    const email = clean(raw.email, 255);
    const city = clean(raw.city, 120);
    const workType = clean(raw.workType, 120);
    const message = clean(raw.message, 3000);

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: "Nome e telefono sono obbligatori." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Email non valida." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const summary =
      `Richiesta sopralluogo/preventivo da landing page\n` +
      `Lavoro: ${workType || "non specificato"}\n` +
      `Città: ${city || "non specificata"}` +
      (message ? `\n\nMessaggio: ${message}` : "");

    // Lead in CRM (upsert by phone, fallback email)
    let leadId: string | null = null;
    let existingLead: { id: string } | null = null;
    if (phone) {
      const { data } = await supabase.from("leads").select("id").eq("phone", phone).limit(1).maybeSingle();
      existingLead = data;
    }
    if (!existingLead && email) {
      const { data } = await supabase.from("leads").select("id").eq("email", email).limit(1).maybeSingle();
      existingLead = data;
    }

    if (existingLead?.id) {
      leadId = existingLead.id;
      await supabase
        .from("leads")
        .update({ last_interaction_at: new Date().toISOString(), notes: summary })
        .eq("id", leadId);
    } else {
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert({
          name,
          email: email || null,
          phone,
          city: city || null,
          source: "landing_sopralluogo",
          status: "nuovo",
          pipeline_stage: "cold",
          notes: summary,
          last_interaction_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (leadError) console.error("lead creation failed:", leadError.message);
      else leadId = leadData.id as string;
    }

    // Store the submission
    const { data: saved, error: saveError } = await supabase
      .from("landing_requests")
      .insert({
        name,
        phone,
        email: email || null,
        city: city || null,
        work_type: workType || null,
        message: message || null,
        privacy_consent: true,
        lead_id: leadId,
        source_ip: ip,
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("request save failed:", saveError.message);
      return new Response(JSON.stringify({ error: "Impossibile salvare la richiesta." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Follow-up reminder for tomorrow
    if (leadId) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const { error: actError } = await supabase.from("lead_activities").insert({
        lead_id: leadId,
        type: "task",
        title: "Richiamare per richiesta sopralluogo",
        description: `Richiesta da landing page (${workType || "lavoro non specificato"}${city ? `, ${city}` : ""}). Richiamare entro il ${tomorrow.toLocaleDateString("it-IT")}.`,
        occurred_at: tomorrow.toISOString(),
      });
      if (actError) console.error("reminder insert failed:", actError.message);
    }

    // Emails (owner + confirmation) if Resend is configured
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const resend = new Resend(resendKey);
      try {
        await resend.emails.send({
          from: "Kalea Website <noreply@kalea.space>",
          to: ["info@kalea.space"],
          subject: `Nuova richiesta sopralluogo — ${name}`,
          html: `
            <h2>Nuova richiesta da landing page</h2>
            <p><strong>Nome:</strong> ${esc(name)}<br>
            <strong>Telefono:</strong> ${esc(phone)}<br>
            <strong>Email:</strong> ${esc(email) || "—"}<br>
            <strong>Città:</strong> ${esc(city) || "—"}<br>
            <strong>Tipo di lavoro:</strong> ${esc(workType) || "—"}</p>
            ${message ? `<p><strong>Messaggio:</strong><br>${esc(message).replace(/\n/g, "<br>")}</p>` : ""}
            <hr><p style="color:#666;font-size:12px;">IP: ${esc(ip)}</p>
          `,
        });
        if (email) {
          await resend.emails.send({
            from: "Kalēa <noreply@kalea.space>",
            to: [email],
            subject: "Abbiamo ricevuto la tua richiesta — Kalēa",
            html: `
              <h2>Grazie, ${esc(name)}!</h2>
              <p>Abbiamo ricevuto la tua richiesta di sopralluogo. Ti ricontattiamo entro un giorno lavorativo per fissare data e ora.</p>
              <p>Se preferisci, chiamaci subito: <strong>+39 352 035 1738</strong></p>
              <br><p>Cordiali saluti,<br>Il Team Kalēa — kalea.space</p>
            `,
          });
        }
      } catch (e) {
        console.error("email send failed:", e instanceof Error ? e.message : String(e));
      }
    } else {
      console.error("RESEND_API_KEY not configured");
    }

    // Telegram notification
    if (BOT_TOKEN && NOTIFY_CHAT_ID) {
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: NOTIFY_CHAT_ID,
            parse_mode: "HTML",
            disable_web_page_preview: true,
            text:
              `📞 <b>Nuova richiesta sopralluogo</b>\n` +
              `${esc(name)} — ${esc(phone)}\n` +
              (email ? `${esc(email)}\n` : "") +
              (city ? `${esc(city)}\n` : "") +
              (workType ? `Lavoro: ${esc(workType)}\n` : "") +
              (message ? `\n"${esc(message)}"\n` : "") +
              `\n👉 Richiamare entro domani`,
          }),
        });
      } catch (e) {
        console.error("telegram notify failed:", e instanceof Error ? e.message : String(e));
      }
    }

    return new Response(JSON.stringify({ success: true, requestId: saved.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("landing-lead error:", e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: "Errore interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
