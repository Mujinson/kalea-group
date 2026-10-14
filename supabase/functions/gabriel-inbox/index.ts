import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { ImapFlow } from "npm:imapflow@1.0.164";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Mail = { account: string; area: "kalea" | "geopietra"; from: string; subject: string; date: string; snippet?: string; link?: string };
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
        out.push({ account: user, area: "kalea", from: f?.name || addr, subject: m.envelope?.subject || "(senza oggetto)", date: (m.envelope?.date || new Date()).toISOString() });
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
    const tr = await fetch(`${G}/users/me/threads/${t.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, { headers: h });
    if (!tr.ok) continue;
    const msgs = (await tr.json()).messages || [];
    const lastMsg = msgs[msgs.length - 1];
    if (!lastMsg || (lastMsg.labelIds || []).includes("SENT")) continue; // già risposto
    const hd = (n: string) => lastMsg.payload?.headers?.find((x: any) => x.name === n)?.value || "";
    const from = hd("From").replace(/<.*>/, "").replace(/"/g, "").trim();
    if (/noreply|no-reply/i.test(hd("From"))) continue;
    out.push({ account: "gabriel.geopietra@gmail.com", area: "geopietra", from, subject: hd("Subject") || "(senza oggetto)", date: new Date(Number(lastMsg.internalDate)).toISOString(), snippet: lastMsg.snippet, link: `https://mail.google.com/mail/u/0/#inbox/${t.id}` });
  }
  return out;
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

    const errors: string[] = [];
    const jobs: Promise<Mail[]>[] = [
      imapUnanswered("info@kalea.space", Deno.env.get("HOSTINGER_INFO_PASSWORD") || "").catch((e) => { errors.push(`info@kalea.space: ${e.message}`); return []; }),
      imapUnanswered("gabriel@kalea.space", Deno.env.get("HOSTINGER_GABRIEL_PASSWORD") || "").catch((e) => { errors.push(`gabriel@kalea.space: ${e.message}`); return []; }),
      gmailUnanswered().catch((e) => { errors.push(`gabriel.geopietra@gmail.com: ${e.message}`); return []; }),
    ];
    const own = /gabriel@kalea\.space|info@kalea\.space|gabriel\.geopietra|^bo@geopietra|notifichedigitali/i;
    const mails = (await Promise.all(jobs)).flat().filter((m) => !own.test(m.from) && !/notifichedigitali|Valore Spedito|Ordini in corso/i.test(m.subject)).sort((a, b) => b.date.localeCompare(a.date));
    return json({ mails, errors });
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
