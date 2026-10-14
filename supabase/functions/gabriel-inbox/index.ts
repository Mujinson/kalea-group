import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { ImapFlow } from "npm:imapflow@1.0.164";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Mail = { uid?: number; fromEmail?: string; messageId?: string; threadId?: string; gmailId?: string; account: string; area: "kalea" | "geopietra"; from: string; subject: string; date: string; snippet?: string; link?: string };
const DAYS = 7;

async function imapUnanswered(user: string, pass: string): Promise<Mail[]> {
  const client = new ImapFlow({ host: "imap.hostinger.com", port: 993, secure: true, auth: { user, pass }, logger: false });
  await client.connect();
  const out: Mail[] = [];
  const lock = await client.getMailboxLock("INBOX");
  try {
    const since = new Date(Date.now() - DAYS * 86400000);
    const uids = (await client.search({ since, answered: false }, { uid: true })) || [];
    const last = uids.slice(-40);
    if (last.length) {
      for await (const m of client.fetch(last, { envelope: true, flags: true }, { uid: true })) {
        const f = m.envelope?.from?.[0];
        const addr = (f?.address || "").toLowerCase();
        if (/noreply|no-reply|newsletter|mailer-daemon|notification/.test(addr)) continue;
        out.push({ uid: Number(m.uid), fromEmail: addr, messageId: m.envelope?.messageId, account: user, area: "kalea", from: f?.name || addr, subject: m.envelope?.subject || "(senza oggetto)", date: (m.envelope?.date || new Date()).toISOString() });
      }
    }
  } finally { lock.release(); await client.logout().catch(() => {}); }
  return out;
}

async function gmailUnanswered(): Promise<Mail[]> {
  const key = Deno.env.get("GOOGLE_MAIL_API_KEY"); const lk = Deno.env.get("LOVABLE_API_KEY");
  if (!key || !lk) return [];
  const G = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
  const h = { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": key };
  const q = encodeURIComponent(`in:inbox newer_than:${DAYS}d -category:promotions -category:social -category:updates -from:me`);
  const r = await fetch(`${G}/users/me/threads?maxResults=25&q=${q}`, { headers: h });
  if (!r.ok) throw new Error(`Gmail [${r.status}]: ${await r.text()}`);
  const threads = ((await r.json()).threads || []) as { id: string }[];
  const out: Mail[] = [];
  for (const t of threads) {
    const tr = await fetch(`${G}/users/me/threads/${t.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=Message-ID`, { headers: h });
    if (!tr.ok) continue;
    const msgs = (await tr.json()).messages || [];
    const lastMsg = msgs[msgs.length - 1];
    if (!lastMsg || (lastMsg.labelIds || []).includes("SENT")) continue; // già risposto
    const hd = (n: string) => lastMsg.payload?.headers?.find((x: any) => x.name === n)?.value || "";
    const from = hd("From").replace(/<.*>/, "").replace(/"/g, "").trim();
    if (/noreply|no-reply/i.test(hd("From"))) continue;
    out.push({ gmailId: lastMsg.id, threadId: t.id, fromEmail: (hd("From").match(/<(.+)>/)?.[1] || hd("From")).trim(), messageId: hd("Message-ID") || hd("Message-Id"), account: "gabriel.geopietra@gmail.com", area: "geopietra", from, subject: hd("Subject") || "(senza oggetto)", date: new Date(Number(lastMsg.internalDate)).toISOString(), snippet: lastMsg.snippet, link: `https://mail.google.com/mail/u/0/#inbox/${t.id}` });
  }
  return out;
}

const PW: Record<string, string | undefined> = { "info@kalea.space": Deno.env.get("HOSTINGER_INFO_PASSWORD"), "gabriel@kalea.space": Deno.env.get("HOSTINGER_GABRIEL_PASSWORD") };
const G = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const gh = () => ({ Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "X-Connection-Api-Key": Deno.env.get("GOOGLE_MAIL_API_KEY") || "" });

async function imapBodies(account: string, uids: number[]) {
  const out: Record<number, string> = {};
  if (!uids.length) return out;
  const c = new ImapFlow({ host: "imap.hostinger.com", port: 993, secure: true, auth: { user: account, pass: PW[account]! }, logger: false });
  await c.connect();
  const lock = await c.getMailboxLock("INBOX");
  try {
    const { simpleParser } = await import("npm:mailparser@3.7.1");
    for await (const m of c.fetch(uids, { source: true }, { uid: true })) {
      const p: any = await simpleParser(m.source);
      out[Number(m.uid)] = (p.text || "").slice(0, 3000);
    }
  } finally { lock.release(); await c.logout().catch(() => {}); }
  return out;
}
function b64decode(d: string) { try { return new TextDecoder().decode(Uint8Array.from(atob(d.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))); } catch { return ""; } }
function gmailText(part: any): string {
  if (!part) return "";
  if (part.mimeType === "text/plain" && part.body?.data) return b64decode(part.body.data);
  for (const p of part.parts || []) { const t = gmailText(p); if (t) return t; }
  if (part.mimeType === "text/html" && part.body?.data) return b64decode(part.body.data).replace(/<[^>]+>/g, " ");
  return "";
}
async function gmailBody(id: string) {
  const r = await fetch(`${G}/users/me/messages/${id}?format=full`, { headers: gh() });
  if (!r.ok) return "";
  return gmailText((await r.json()).payload).slice(0, 3000);
}

async function analyze(items: { key: string; from: string; subject: string; account: string; text: string }[]) {
  const schema = { type: "object", additionalProperties: false, required: ["emails"], properties: { emails: { type: "array", items: { type: "object", additionalProperties: false,
    required: ["key", "cliente", "azienda", "progetto", "richiesta", "azione", "priorita", "riassunto", "bozza_risposta", "da_ignorare"],
    properties: { key: { type: "string" }, cliente: { type: ["string", "null"] }, azienda: { type: ["string", "null"] }, progetto: { type: ["string", "null"] },
      richiesta: { type: "string" }, azione: { type: "string" }, priorita: { type: "string", enum: ["alta", "media", "bassa"] }, riassunto: { type: "string" },
      bozza_risposta: { type: ["string", "null"] }, da_ignorare: { type: "boolean" } } } } } };
  const instructions = `Sei l'assistente personale di Gabriel Vladu, titolare di Kalēa Group (pavimenti, parquet, SPC, ceramiche, fornitura e posa, Desenzano del Garda) e agente Geopietra (rivestimenti in pietra ricostruita). Per ogni email: estrai cliente, azienda, progetto; scrivi in italiano la richiesta in breve, l'azione concreta che Gabriel deve fare (es. "Fissare sopralluogo", "Preparare preventivo", "Pagare F24 entro 16/10"), la priorità (alta = cliente che aspetta risposta, scadenze entro 3 giorni, soldi; bassa = informative) e un riassunto di 1 frase. Se serve una risposta, scrivi una bozza cordiale e professionale in italiano (o nella lingua del mittente), firmata "Gabriel Vladu" e poi "Kalēa Group" o "Geopietra" in base alla casella; altrimenti null. da_ignorare=true per pubblicità, newsletter, notifiche automatiche senza azioni. Rispondi con un elemento per ogni key.`;
  const input = items.map((i) => `KEY: ${i.key}\nCASELLA: ${i.account}\nDA: ${i.from}\nOGGETTO: ${i.subject}\nTESTO:\n${i.text}`).join("\n\n-----\n\n");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY")!, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({ model: "openai/gpt-6-astra", instructions, input, stream: true, store: false,
      reasoning: { effort: "low", summary: "auto" }, include: ["reasoning.encrypted_content"],
      text: { format: { type: "json_schema", name: "email_tasks", strict: true, schema } } }),
  });
  if (!r.ok) { const t = await r.text(); const e: any = new Error(`AI [${r.status}]: ${t.slice(0, 300)}`); e.status = r.status; throw e; }
  const reader = r.body!.getReader(); const dec = new TextDecoder(); let buf = "", out = "";
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let i; while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      try { const ev = JSON.parse(line.slice(5)); if (ev.type === "response.output_text.delta") out += ev.delta; if (ev.type === "response.failed" || ev.type === "error") throw new Error("AI: " + JSON.stringify(ev).slice(0, 300)); } catch (e) { if (String(e).includes("AI:")) throw e; }
    }
  }
  return (JSON.parse(out).emails || []) as any[];
}

async function sendReply(task: any, text: string) {
  const subject = /^re:/i.test(task.subject || "") ? task.subject : `Re: ${task.subject || ""}`;
  if (task.account === "gabriel.geopietra@gmail.com") {
    const b64 = (s: string) => btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(""));
    const hdr = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);
    const raw = [`To: ${task.from_email}`, `Subject: ${hdr(subject)}`, ...(task.message_id ? [`In-Reply-To: ${task.message_id}`, `References: ${task.message_id}`] : []), "MIME-Version: 1.0", 'Content-Type: text/plain; charset="UTF-8"', "", text].join("\r\n");
    const r = await fetch(`${G}/users/me/messages/send`, { method: "POST", headers: { ...gh(), "Content-Type": "application/json" },
      body: JSON.stringify({ raw: b64(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), threadId: task.gmail_thread_id || undefined }) });
    if (!r.ok) throw new Error(`Gmail [${r.status}]: ${await r.text()}`);
    return;
  }
  const pass = PW[task.account]; if (!pass) throw new Error("Casella non valida");
  const nodemailer = (await import("npm:nodemailer@6.9.14")).default;
  const t = nodemailer.createTransport({ host: "smtp.hostinger.com", port: 465, secure: true, auth: { user: task.account, pass } });
  await t.sendMail({ from: `Gabriel Vladu – Kalēa Group <${task.account}>`, to: task.from_email, subject, text, inReplyTo: task.message_id || undefined, references: task.message_id || undefined });
  // segna come risposta nella casella
  if (task.mail_key.includes(":")) {
    const uid = Number(task.mail_key.split(":").pop());
    const c = new ImapFlow({ host: "imap.hostinger.com", port: 993, secure: true, auth: { user: task.account, pass }, logger: false });
    await c.connect(); const lock = await c.getMailboxLock("INBOX");
    try { await c.messageFlagsAdd(String(uid), ["\\Answered"], { uid: true }); } finally { lock.release(); await c.logout().catch(() => {}); }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const tok = req.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { data: u } = await sb.auth.getUser(tok);
    if (!u?.user) return json({ error: "Non autorizzato" }, 401);
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Solo amministratori" }, 403);

    const body = await req.json().catch(() => ({}));
    if (body?.read_uid && body?.account) {
      const pw = body.account === "info@kalea.space" ? Deno.env.get("HOSTINGER_INFO_PASSWORD") : body.account === "gabriel@kalea.space" ? Deno.env.get("HOSTINGER_GABRIEL_PASSWORD") : null;
      if (!pw) return json({ error: "Casella non valida" }, 400);
      const c = new ImapFlow({ host: "imap.hostinger.com", port: 993, secure: true, auth: { user: body.account, pass: pw }, logger: false });
      await c.connect();
      const lock = await c.getMailboxLock("INBOX");
      try {
        const m = await c.fetchOne(String(Number(body.read_uid)), { source: true, envelope: true }, { uid: true });
        const { simpleParser } = await import("npm:mailparser@3.7.1");
        const parsed: any = await simpleParser(m.source);
        return json({ from: parsed.from?.text, to: parsed.to?.text, subject: parsed.subject, date: parsed.date, text: parsed.text || "", html: parsed.html || null, attachments: (parsed.attachments || []).map((a: any) => a.filename) });
      } finally { lock.release(); await c.logout().catch(() => {}); }
    }
    if (body?.send_task_id) {
      const text = String(body.text || "").trim();
      if (!text || text.length > 20000) return json({ error: "Testo mancante" }, 400);
      const { data: task } = await sb.from("gabriel_email_tasks").select("*").eq("id", body.send_task_id).single();
      if (!task?.from_email) return json({ error: "Destinatario sconosciuto" }, 400);
      await sendReply(task, text);
      await sb.from("gabriel_email_tasks").update({ status: "inviata", bozza_risposta: text, updated_at: new Date().toISOString() }).eq("id", task.id);
      return json({ ok: true });
    }
    const errors: string[] = [];
    const jobs: Promise<Mail[]>[] = [
      imapUnanswered("info@kalea.space", Deno.env.get("HOSTINGER_INFO_PASSWORD") || "").catch((e) => { errors.push(`info@kalea.space: ${e.message}`); return []; }),
      imapUnanswered("gabriel@kalea.space", Deno.env.get("HOSTINGER_GABRIEL_PASSWORD") || "").catch((e) => { errors.push(`gabriel@kalea.space: ${e.message}`); return []; }),
      gmailUnanswered().catch((e) => { errors.push(`gabriel.geopietra@gmail.com: ${e.message}`); return []; }),
    ];
    const own = /gabriel@kalea\.space|info@kalea\.space|gabriel\.geopietra|^bo@geopietra/i;
    const mails = (await Promise.all(jobs)).flat().filter((m) => !own.test(m.from) && !/Valore Spedito|Ordini in corso/i.test(m.subject)).sort((a, b) => b.date.localeCompare(a.date));
    if (!body?.analyze) return json({ mails, errors });

    const keyOf = (m: Mail) => m.gmailId ? `gmail:${m.gmailId}` : `${m.account}:${m.uid}`;
    const { data: existing } = await sb.from("gabriel_email_tasks").select("mail_key").in("mail_key", mails.map(keyOf));
    const done = new Set((existing || []).map((e: any) => e.mail_key));
    const todo = mails.filter((m) => !done.has(keyOf(m))).slice(0, 15);
    if (todo.length) {
      const byAcc: Record<string, number[]> = {};
      todo.filter((m) => m.uid).forEach((m) => (byAcc[m.account] ||= []).push(m.uid!));
      const bodies: Record<string, string> = {};
      for (const [acc, uids] of Object.entries(byAcc)) { const b = await imapBodies(acc, uids).catch(() => ({} as Record<number, string>)); for (const [u, t] of Object.entries(b)) bodies[`${acc}:${u}`] = t; }
      for (const m of todo.filter((m) => m.gmailId)) bodies[keyOf(m)] = await gmailBody(m.gmailId!);
      const res = await analyze(todo.map((m) => ({ key: keyOf(m), from: `${m.from} <${m.fromEmail || ""}>`, subject: m.subject, account: m.account, text: bodies[keyOf(m)] || m.snippet || "" })));
      const rows = todo.map((m) => {
        const a = res.find((x) => x.key === keyOf(m)) || {};
        return { mail_key: keyOf(m), account: m.account, area: m.area, from_name: m.from, from_email: m.fromEmail, subject: m.subject, received_at: m.date,
          message_id: m.messageId || null, gmail_thread_id: m.threadId || null, cliente: a.cliente, azienda: a.azienda, progetto: a.progetto,
          richiesta: a.richiesta, azione: a.azione, priorita: a.priorita || "media", riassunto: a.riassunto, bozza_risposta: a.bozza_risposta,
          status: a.da_ignorare ? "ignorata" : "da_fare" };
      });
      const { error } = await sb.from("gabriel_email_tasks").upsert(rows, { onConflict: "mail_key" });
      if (error) throw error;
    }
    return json({ analyzed: todo.length, remaining: Math.max(0, mails.filter((m) => !done.has(keyOf(m))).length - todo.length), errors });
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
