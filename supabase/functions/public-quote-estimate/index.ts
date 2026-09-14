import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || Deno.env.get("TELEGRAM_API_KEY") || "";
const NOTIFY_CHAT_ID = Deno.env.get("TELEGRAM_NOTIFY_CHAT_ID") || "";

const rateLimit = new Map<string, { count: number; reset: number }>();
const MAX_PER_HOUR = 6;

const allowed = (ip: string) => {
  const now = Date.now();
  const rec = rateLimit.get(ip);
  if (!rec || now > rec.reset) {
    rateLimit.set(ip, { count: 1, reset: now + 3600_000 });
    return true;
  }
  if (rec.count >= MAX_PER_HOUR) return false;
  rec.count++;
  return true;
};

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const clean = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const DISCLAIMER: Record<string, string> = {
  it: "Questa è una stima puramente indicativa e non vincolante. Il preventivo definitivo verrà emesso solo dopo il sopralluogo dei tecnici Kalēa.",
  en: "This is an indicative, non-binding estimate only. The final quotation will be issued only after an on-site survey by Kalēa technicians.",
  de: "Dies ist eine unverbindliche Richtwert-Schätzung. Das endgültige Angebot wird erst nach der Besichtigung durch die Kalēa-Techniker erstellt.",
  fr: "Ceci est une estimation purement indicative et non contractuelle. Le devis définitif sera émis uniquement après la visite technique des techniciens Kalēa.",
};

const SUBJECT: Record<string, string> = {
  it: "La tua stima indicativa Kalēa",
  en: "Your indicative Kalēa estimate",
  de: "Ihre unverbindliche Kalēa-Schätzung",
  fr: "Votre estimation indicative Kalēa",
};

interface LineInput {
  code?: string;
  quantity?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    if (!allowed(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json();

    // Honeypot: silently accept
    if (clean(body.honeypot)) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 255).toLowerCase();
    const phone = clean(body.phone, 50);
    const city = clean(body.city, 120);
    const province = clean(body.province, 60);
    const customerType = clean(body.customerType, 60);
    const notes = clean(body.notes, 2000);
    const language = ["it", "en", "de", "fr"].includes(clean(body.language, 2))
      ? clean(body.language, 2)
      : "it";
    const consent = body.privacyConsent === true;
    const lines: LineInput[] = Array.isArray(body.lines) ? body.lines.slice(0, 30) : [];

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !emailRe.test(email) || !phone) {
      return new Response(JSON.stringify({ error: "Dati cliente mancanti o non validi" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!consent) {
      return new Response(JSON.stringify({ error: "Consenso privacy obbligatorio" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (lines.length === 0) {
      return new Response(JSON.stringify({ error: "Nessuna lavorazione selezionata" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Server-side recalculation from the real price list — never trust the browser.
    const codes = lines.map((l) => clean(l.code, 60)).filter(Boolean);
    const { data: items, error: itemsError } = await supabase
      .from("public_quote_items")
      .select("code, name, name_en, name_de, name_fr, unit, price_min, price_max")
      .eq("is_active", true)
      .in("code", codes);

    if (itemsError) {
      console.error("price list read failed:", itemsError.message);
      return new Response(JSON.stringify({ error: "Listino non disponibile" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const byCode = new Map((items ?? []).map((i) => [i.code, i]));
    const localName = (i: Record<string, unknown>) =>
      (language === "en" && i.name_en) ||
      (language === "de" && i.name_de) ||
      (language === "fr" && i.name_fr) ||
      i.name;

    const computed = lines
      .map((l) => {
        const item = byCode.get(clean(l.code, 60));
        if (!item) return null;
        const qty = Math.max(0, Math.min(100000, Number(l.quantity) || 0));
        if (qty <= 0) return null;
        return {
          code: item.code,
          name: String(localName(item as Record<string, unknown>)),
          unit: item.unit,
          quantity: qty,
          price_min: Number(item.price_min),
          price_max: Number(item.price_max),
          total_min: Number(item.price_min) * qty,
          total_max: Number(item.price_max) * qty,
        };
      })
      .filter(Boolean) as Array<Record<string, number | string>>;

    if (computed.length === 0) {
      return new Response(JSON.stringify({ error: "Nessuna lavorazione valida" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const totalMin = computed.reduce((s, r) => s + Number(r.total_min), 0);
    const totalMax = computed.reduce((s, r) => s + Number(r.total_max), 0);
    const VAT = 22;

    // Lead in CRM (reuses submit_public_lead so dedupe/codes stay consistent)
    let leadId: string | null = null;
    const { data: leadData, error: leadError } = await supabase.rpc("submit_public_lead", {
      _name: name,
      _email: email,
      _phone: phone,
      _message: `Stima online: ${eur(totalMin)} – ${eur(totalMax)} + IVA\n${computed
        .map((r) => `• ${r.name}: ${r.quantity} ${r.unit}`)
        .join("\n")}${notes ? `\n\nNote: ${notes}` : ""}`,
      _source: "preventivatore_online",
      _interest: computed.map((r) => r.name).join(", ").slice(0, 250),
      _city: city || null,
      _province: province || null,
    });
    if (leadError) console.error("lead creation failed:", leadError.message);
    else leadId = leadData as string;

    const { data: saved, error: saveError } = await supabase
      .from("public_quote_requests")
      .insert({
        customer_name: name,
        email,
        phone,
        city: city || null,
        province: province || null,
        customer_type: customerType || null,
        notes: notes || null,
        language,
        lines: computed,
        total_min: totalMin,
        total_max: totalMax,
        vat_rate: VAT,
        privacy_consent: true,
        lead_id: leadId,
        source_ip: ip,
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("request save failed:", saveError.message);
      return new Response(JSON.stringify({ error: "Impossibile salvare la richiesta" }), {
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
        title: "Richiamare per stima online",
        description: `Stima ${eur(totalMin)} – ${eur(totalMax)} + IVA. Richiamare il ${tomorrow.toLocaleDateString("it-IT")} per fissare il sopralluogo.`,
        occurred_at: tomorrow.toISOString(),
      });
      if (actError) console.error("reminder insert failed:", actError.message);
    }

    const rowsHtml = computed
      .map(
        (r) => `<tr>
          <td style="padding:8px 6px;border-bottom:1px solid #e6ddcd;">${esc(String(r.name))}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #e6ddcd;text-align:right;white-space:nowrap;">${r.quantity} ${esc(String(r.unit))}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #e6ddcd;text-align:right;white-space:nowrap;">${eur(Number(r.total_min))} – ${eur(Number(r.total_max))}</td>
        </tr>`,
      )
      .join("");

    const estimateHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#333;max-width:640px;">
        <h2 style="color:#4A2A13;margin:0 0 4px;">Kalēa®</h2>
        <p style="margin:0 0 18px;font-size:12px;color:#8C7B6B;">Kalea Group Srl — P.IVA 04797310986</p>
        <h3 style="color:#4A2A13;">${esc(SUBJECT[language])}</h3>
        <p>${esc(name)},</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:14px 0;">
          ${rowsHtml}
          <tr>
            <td colspan="2" style="padding:12px 6px;font-weight:bold;">Totale indicativo (IVA ${VAT}% esclusa)</td>
            <td style="padding:12px 6px;text-align:right;font-weight:bold;white-space:nowrap;">${eur(totalMin)} – ${eur(totalMax)}</td>
          </tr>
        </table>
        <p style="background:#F7F1E7;border-left:3px solid #8C7B6B;padding:12px;font-size:13px;color:#4A2A13;">
          ${esc(DISCLAIMER[language])}
        </p>
        <p style="font-size:13px;color:#666;">Kalēa — kalea.space — +39 352 035 1738</p>
      </div>`;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const resend = new Resend(resendKey);
      try {
        await resend.emails.send({
          from: "Kalēa <noreply@kalea.space>",
          to: [email],
          subject: SUBJECT[language],
          html: estimateHtml,
        });
        await resend.emails.send({
          from: "Kalea Website <noreply@kalea.space>",
          to: ["info@kalea.space"],
          subject: `Nuova stima online — ${name} (${eur(totalMin)}–${eur(totalMax)})`,
          html: `<p><strong>${esc(name)}</strong> — ${esc(email)} — ${esc(phone)}<br>
            ${esc(city)} ${esc(province)} — ${esc(customerType)}</p>
            ${notes ? `<p><strong>Note:</strong> ${esc(notes)}</p>` : ""}
            ${estimateHtml}`,
        });
      } catch (e) {
        console.error("email send failed:", e instanceof Error ? e.message : String(e));
      }
    } else {
      console.error("RESEND_API_KEY not configured");
    }

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
              `🧮 <b>Nuova stima online</b>\n` +
              `${esc(name)} — ${esc(phone)}\n${esc(email)}\n` +
              `${esc(city)}${province ? ` (${esc(province)})` : ""}\n\n` +
              computed.map((r) => `• ${esc(String(r.name))}: ${r.quantity} ${esc(String(r.unit))}`).join("\n") +
              `\n\n<b>${eur(totalMin)} – ${eur(totalMax)}</b> + IVA\n` +
              `👉 Richiamare domani per fissare il sopralluogo`,
          }),
        });
      } catch (e) {
        console.error("telegram notify failed:", e instanceof Error ? e.message : String(e));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        requestId: saved.id,
        lines: computed,
        totalMin,
        totalMax,
        vatRate: VAT,
        disclaimer: DISCLAIMER[language],
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (e) {
    console.error("public-quote-estimate error:", e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: "Errore interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
