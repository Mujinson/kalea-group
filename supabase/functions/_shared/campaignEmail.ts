import { greeting } from "./workdays.ts";

export const SITE = "https://www.kalea.space";
export const FN_BASE = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;

export function renderEmail(opts: {
  subject: string; html: string; name?: string | null; senderName: string;
  presentationUrl: string; token: string;
}) {
  const unsubPage = `${SITE}/disiscrizione?t=${opts.token}`;
  const fill = (s: string) => s
    .replaceAll("{{saluto}}", greeting(opts.name))
    .replaceAll("{{presentazione_url}}", opts.presentationUrl)
    .replaceAll("{{unsubscribe_url}}", unsubPage)
    .replaceAll("{{mittente}}", opts.senderName.replace("–", "<br>"));
  const footer = `<hr style="border:none;border-top:1px solid #ddd;margin:24px 0 12px"><p style="font-size:11px;color:#888;line-height:1.5">Kalēa Group S.r.l. · Via Generale Bernasconi 8A, 25015 Desenzano del Garda (BS) · P.IVA 04797310986<br>Ricevi questa email perché sei entrato in contatto con Kalēa.<br><a href="${unsubPage}" style="color:#888">Non voglio più ricevere email da Kalēa</a></p>`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#222;max-width:600px">${fill(opts.html)}${footer}</div>`;
  const text = html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, "$2: $1").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return {
    subject: fill(opts.subject), html, text,
    headers: {
      "List-Unsubscribe": `<${FN_BASE}/campaign-unsubscribe?t=${opts.token}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    } as Record<string, string>,
  };
}

export async function sendResend(payload: Record<string, unknown>) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY not configured");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`[${r.status}] ${body}`);
  return JSON.parse(body) as { id: string };
}
