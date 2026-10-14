import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Item = { title: string; detail?: string; link?: string; area: "kalea" | "geopietra" | "admin" };
type Section = { key: string; label: string; emoji: string; tone: "red" | "orange" | "yellow" | "blue" | "green" | "gray"; items: Item[] };

const daysAgo = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
const fmtDay = (d: string) => new Date(d).toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "Europe/Rome" });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
const eur = (n: number) => `€ ${Math.round(n).toLocaleString("it-IT")}`;

async function build(sb: any) {
  const now = new Date();
  const romeToday = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  const todayStr = `${romeToday.getFullYear()}-${String(romeToday.getMonth() + 1).padStart(2, "0")}-${String(romeToday.getDate()).padStart(2, "0")}`;
  const in7 = new Date(now.getTime() + 7 * 86400000).toISOString();
  const startToday = new Date(`${todayStr}T00:00:00+02:00`).toISOString();
  const endToday = new Date(`${todayStr}T23:59:59+02:00`).toISOString();

  const [apts, leads, quotes, reminders, schedules, supInv, sites, fixed] = await Promise.all([
    sb.from("appointments").select("id,title,appointment_date,location,status").gte("appointment_date", startToday).lte("appointment_date", in7).neq("status", "annullato").order("appointment_date"),
    sb.from("leads").select("id,name,company_name,status,pipeline_stage,created_at,last_interaction_at,project_type").is("deleted_at", null).is("archived_at", null).limit(500),
    sb.from("quotes").select("id,quote_number,client_name,status,total_amount,sent_date,created_at,lead_id").in("status", ["draft", "sent"]).limit(500),
    sb.from("customer_reminders").select("id,title,reminder_date,is_completed").eq("is_completed", false).lte("reminder_date", todayStr).limit(200),
    sb.from("payment_schedules").select("id,amount,due_date,is_paid,payment_type,sales(customer_name)").eq("is_paid", false).lte("due_date", new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10)).limit(200),
    sb.from("supplier_invoices").select("id,invoice_number,total,paid_amount,due_date,status").neq("status", "pagata").lte("due_date", new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10)).limit(200),
    sb.from("construction_sites").select("id,title,city,status,planned_end_date").in("status", ["attivo", "in_corso", "active", "in_lavorazione"]).limit(200),
    sb.from("fixed_costs").select("id,description,amount,next_due_date,is_paid").eq("is_paid", false).lte("next_due_date", new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10)).limit(200),
  ]);

  const L = (leads.data || []) as any[];
  const Q = (quotes.data || []) as any[];
  const leadsWithQuote = new Set(Q.map((q) => q.lead_id).filter(Boolean));
  const newStatuses = ["nuovo", "new", "da_contattare"];
  const closed = ["vinto", "perso", "won", "lost", "chiuso", "convertito"];

  const urgent: Item[] = [];
  const todo: Item[] = [];

  // Lead nuovi non contattati da > 1 giorno → urgente
  for (const l of L) {
    const who = l.company_name || l.name || "Lead";
    if (newStatuses.includes(l.status) && !l.last_interaction_at) {
      const d = daysAgo(l.created_at);
      (d >= 2 ? urgent : todo).push({ title: `Contattare ${who}`, detail: `Richiesta ricevuta ${d === 0 ? "oggi" : d + " giorni fa"}${l.project_type ? " · " + l.project_type : ""}`, link: `/admin/leads?id=${l.id}`, area: "kalea" });
    }
  }
  // Lead attivi senza preventivo
  const toQuote: Item[] = L.filter((l) => !newStatuses.includes(l.status) && !closed.includes(l.status) && !closed.includes(l.pipeline_stage) && !leadsWithQuote.has(l.id) && ["sopralluogo", "qualificato", "contattato", "in_trattativa"].some((s) => (l.status + " " + (l.pipeline_stage || "")).includes(s)))
    .map((l) => ({ title: `Preparare preventivo – ${l.company_name || l.name}`, detail: `In attesa da ${daysAgo(l.last_interaction_at || l.created_at)} giorni`, link: `/admin/preventivi/nuovo`, area: "kalea" as const }));
  // Bozze
  for (const q of Q.filter((q) => q.status === "draft")) toQuote.push({ title: `Completare bozza ${q.quote_number || ""} – ${q.client_name || ""}`.trim(), detail: `Creata ${daysAgo(q.created_at)} giorni fa · ${eur(q.total_amount || 0)}`, link: `/admin/preventivi`, area: "kalea" });
  // Follow-up preventivi inviati
  const follow: Item[] = Q.filter((q) => q.status === "sent" && q.sent_date && daysAgo(q.sent_date) >= 5).map((q) => {
    const d = daysAgo(q.sent_date);
    const it = { title: `Sentire ${q.client_name || "cliente"} – preventivo ${q.quote_number || ""}`, detail: `Inviato ${d} giorni fa · ${eur(q.total_amount || 0)} · nessun riscontro`, link: `/admin/preventivi`, area: "kalea" as const };
    if (d >= 10) urgent.push(it);
    return it;
  });
  for (const r of reminders.data || []) todo.push({ title: r.title, detail: `Promemoria del ${fmtDay(r.reminder_date)}`, link: "/admin/clienti", area: "kalea" });

  const A = (apts.data || []) as any[];
  const today = A.filter((a) => a.appointment_date <= endToday).map((a) => ({ title: `${fmtTime(a.appointment_date)} – ${a.title}`, detail: a.location || undefined, link: "/admin/appuntamenti", area: "kalea" as const }));
  const week = A.filter((a) => a.appointment_date > endToday).map((a) => ({ title: `${fmtDay(a.appointment_date)} ${fmtTime(a.appointment_date)} – ${a.title}`, detail: a.location || undefined, link: "/admin/appuntamenti", area: "kalea" as const }));

  const money: Item[] = [];
  for (const p of schedules.data || []) {
    const late = p.due_date < todayStr;
    const who = (p as any).sales?.customer_name;
    const it = { title: `${late ? "Incasso scaduto" : "Incasso in arrivo"} ${eur(p.amount || 0)}${who ? " – " + who : ""}`, detail: `Scadenza ${fmtDay(p.due_date)}${p.payment_type ? " · " + p.payment_type : ""}`, link: "/admin/pagamenti", area: "kalea" as const };
    money.push(it); if (late) urgent.push(it);
  }
  for (const s of supInv.data || []) money.push({ title: `Pagare fornitore – fatt. ${s.invoice_number || ""} ${eur((s.total || 0) - (s.paid_amount || 0))}`, detail: `Scadenza ${s.due_date ? fmtDay(s.due_date) : "—"}`, link: "/admin/fornitori", area: "admin" });
  const admin: Item[] = (fixed.data || []).map((f: any) => ({ title: `${f.description} ${eur(f.amount || 0)}`, detail: `Scadenza ${fmtDay(f.next_due_date)}`, link: "/admin/costi", area: "admin" as const }));
  const siteItems: Item[] = (sites.data || []).map((s: any) => ({ title: s.title + (s.city ? ` – ${s.city}` : ""), detail: s.planned_end_date ? `Fine prevista ${fmtDay(s.planned_end_date)}` : "Controllare avanzamento", link: `/admin/cantieri`, area: "kalea" as const }));

  const sections: Section[] = [
    { key: "urgent", label: "Urgente", emoji: "🔴", tone: "red", items: urgent },
    { key: "today_apts", label: "Appuntamenti di oggi", emoji: "🟢", tone: "green", items: today },
    { key: "todo", label: "Da fare oggi", emoji: "🟠", tone: "orange", items: todo },
    { key: "quote", label: "Preventivi da preparare", emoji: "🟡", tone: "yellow", items: toQuote },
    { key: "follow", label: "Preventivi da seguire", emoji: "🔵", tone: "blue", items: follow },
    { key: "money", label: "Incassi e pagamenti", emoji: "💰", tone: "gray", items: money },
    { key: "sites", label: "Cantieri attivi", emoji: "🏗️", tone: "gray", items: siteItems },
    { key: "admin", label: "Amministrazione e scadenze", emoji: "📑", tone: "gray", items: admin },
    { key: "week", label: "Prossimi 7 giorni", emoji: "📅", tone: "gray", items: week },
  ];
  const dateLabel = romeToday.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
  return { date: dateLabel, sections };
}

function toTelegram(r: { date: string; sections: Section[] }) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let t = `<b>BUONGIORNO GABRIEL – ${esc(r.date)}</b>\n`;
  for (const s of r.sections) {
    if (!s.items.length) continue;
    t += `\n${s.emoji} <b>${esc(s.label.toUpperCase())}</b>\n`;
    for (const i of s.items.slice(0, 8)) t += `- ${esc(i.title)}${i.detail ? ` <i>(${esc(i.detail)})</i>` : ""}\n`;
    if (s.items.length > 8) t += `…e altri ${s.items.length - 8}\n`;
  }
  if (r.sections.every((s) => !s.items.length)) t += "\nNiente in sospeso. Buona giornata! ☀️";
  return t.slice(0, 4000);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const sb = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = req.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const internal = auth === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!internal) {
      const { data: u } = await sb.auth.getUser(auth);
      if (!u?.user) return json({ error: "Non autorizzato" }, 401);
      const { data: isAdmin } = await sb.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      if (!isAdmin) return json({ error: "Solo amministratori" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const report = await build(sb);
    if (internal) return json({ telegram_text: toTelegram(report) });
    if (body?.send_telegram) {
      const token = Deno.env.get("TELEGRAM_BOT_TOKEN") || Deno.env.get("TELEGRAM_API_KEY") || "";
      const chat = Deno.env.get("TELEGRAM_NOTIFY_CHAT_ID") || "733155347";
      if (!token) return json({ ...report, telegram: "missing_token" });
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: toTelegram(report), parse_mode: "HTML" }),
      });
      const tj = await r.json().catch(() => ({}));
      return json({ ...report, telegram: tj?.ok ? "sent" : `error: ${tj?.description || r.status}` });
    }
    return json(report);
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
