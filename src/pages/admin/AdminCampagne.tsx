import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Play, Pause, Send, Plus, Save } from 'lucide-react';

type Campaign = any;
const STATUS_LABEL: Record<string, string> = {
  queued: 'In coda', sent: 'Inviata', follow_up_sent: 'Richiamo inviato', replied: 'Ha risposto',
  unsubscribed: 'Disiscritto', bounced: 'Non consegnata', skipped: 'Esclusa',
};
const todayRome = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());

export default function AdminCampagne() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [camps, setCamps] = useState<Campaign[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [recs, setRecs] = useState<any[]>([]);
  const [tpls, setTpls] = useState<any[]>([]);
  const [newName, setNewName] = useState('');

  const loadCamps = async () => {
    const { data } = await supabase.from('email_campaigns').select('*').order('created_at', { ascending: false });
    setCamps(data || []);
    if (!selId && data?.length) setSelId(data[0].id);
  };
  const loadRecs = async (id: string) => {
    const all: any[] = [];
    for (let from = 0; ; from += 1000) {
      const { data } = await supabase.from('email_campaign_recipients').select('*').eq('campaign_id', id).order('created_at').range(from, from + 999);
      all.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    setRecs(all);
  };
  useEffect(() => { if (isAdmin) { loadCamps(); supabase.from('email_templates').select('*').order('key').then(({ data }) => setTpls(data || [])); } }, [isAdmin]);
  useEffect(() => { if (selId) loadRecs(selId); }, [selId]);

  const sel = camps.find((c) => c.id === selId);

  if (authLoading) return null;
  if (!isAdmin) return <div className="p-8 text-crm-ink-muted">Accesso riservato agli amministratori.</div>;

  const create = async () => {
    if (!newName.trim()) return;
    const { data, error } = await supabase.from('email_campaigns').insert({ name: newName.trim() }).select().single();
    if (error) return toast.error(error.message);
    setNewName(''); setSelId(data.id); loadCamps();
    toast.success(`Campagna creata (in pausa). ID: ${data.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-crm-ink">Campagne email</h1>
          <p className="text-sm text-crm-ink-muted">Invio automatico nei giorni lavorativi, con limite giornaliero.</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Nome nuova campagna" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-64 bg-white" />
          <Button onClick={create}><Plus className="w-4 h-4 mr-1" />Nuova</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {camps.map((c) => (
          <button key={c.id} onClick={() => setSelId(c.id)}
            className={`crm-card p-4 text-left ${c.id === selId ? 'ring-2 ring-crm-primary' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-crm-ink truncate">{c.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-crm-border text-crm-ink-muted">
                {c.status === 'active' ? 'Attiva' : c.status === 'paused' ? 'In pausa' : 'Bozza'}
              </span>
            </div>
            <div className="text-[12px] text-crm-ink-muted mt-1">{c.daily_limit}/giorno · ore {String(c.send_time).slice(0, 5)}</div>
          </button>
        ))}
        {!camps.length && <div className="text-sm text-crm-ink-muted">Nessuna campagna. Creane una per iniziare.</div>}
      </div>

      {sel && <CampaignDetail key={sel.id} c={sel} recs={recs} reload={() => { loadCamps(); loadRecs(sel.id); }} />}

      <TemplatesEditor tpls={tpls} setTpls={setTpls} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="crm-card p-3 min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-crm-ink-muted truncate">{label}</div>
      <div className="text-xl font-semibold text-crm-ink tabular-nums">{value}</div>
    </div>
  );
}

function CampaignDetail({ c, recs, reload }: { c: Campaign; recs: any[]; reload: () => void }) {
  const [form, setForm] = useState({ name: c.name, daily_limit: c.daily_limit, send_time: String(c.send_time).slice(0, 5), presentation_url: c.presentation_url, follow_up_after_days: c.follow_up_after_days });
  const [testTo, setTestTo] = useState('');
  const [sending, setSending] = useState(false);
  const [fStatus, setFStatus] = useState('all');
  const [fTpl, setFTpl] = useState('all');
  const [q, setQ] = useState('');

  const today = todayRome();
  const counts = useMemo(() => {
    const n = (s: string) => recs.filter((r) => r.status === s).length;
    return {
      queued: n('queued'),
      today: recs.filter((r) => r.sent_at?.startsWith(today) || r.follow_up_at?.startsWith(today)).length,
      total: recs.filter((r) => r.sent_at).length,
      followUps: recs.filter((r) => r.follow_up_at).length,
      replied: n('replied'), unsub: n('unsubscribed'), bounced: n('bounced'),
    };
  }, [recs, today]);

  const filtered = recs.filter((r) =>
    (fStatus === 'all' || r.status === fStatus) && (fTpl === 'all' || r.template_version === fTpl) &&
    (!q || r.email.includes(q.toLowerCase()) || (r.greeting_name || '').toLowerCase().includes(q.toLowerCase())));

  const setStatus = async (status: 'active' | 'paused') => {
    const { error } = await supabase.from('email_campaigns').update({ status, ...(status === 'active' && !c.started_at ? { started_at: new Date().toISOString() } : {}) }).eq('id', c.id);
    if (error) return toast.error(error.message);
    toast.success(status === 'active' ? 'Campagna avviata: partirà al prossimo orario di invio.' : 'Campagna in pausa.');
    reload();
  };
  const save = async () => {
    const { error } = await supabase.from('email_campaigns').update({ ...form, daily_limit: Number(form.daily_limit), follow_up_after_days: Number(form.follow_up_after_days) }).eq('id', c.id);
    if (error) return toast.error(error.message);
    toast.success('Impostazioni salvate'); reload();
  };
  const sendTest = async () => {
    setSending(true);
    const { data, error } = await supabase.functions.invoke('campaign-sender', { body: { mode: 'test', campaign_id: c.id, to: testTo } });
    setSending(false);
    if (error) {
      const d = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
      return toast.error(`Invio prova fallito: ${d}`);
    }
    const bad = (data.results || []).filter((r: any) => !r.ok);
    bad.length ? toast.error(`${bad.length} email di prova non partite: ${bad[0].error}`) : toast.success(`4 email di prova inviate a ${testTo}`);
  };
  const markReplied = async (r: any) => {
    await supabase.from('email_campaign_recipients').update({ status: 'replied', replied_at: new Date().toISOString() }).eq('id', r.id);
    if (r.lead_id) await supabase.from('lead_activities').insert({ lead_id: r.lead_id, type: 'email', title: `Ha risposto alla campagna ${c.name}` });
    reload();
  };
  const exclude = async (r: any) => {
    await supabase.from('email_campaign_recipients').update({ status: 'skipped', error: 'Escluso a mano' }).eq('id', r.id);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-crm-ink mr-auto">{c.name}</h2>
        {c.status === 'active'
          ? <Button variant="outline" onClick={() => setStatus('paused')}><Pause className="w-4 h-4 mr-1" />Pausa</Button>
          : <Button onClick={() => setStatus('active')}><Play className="w-4 h-4 mr-1" />Avvia</Button>}
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <Stat label="In coda" value={counts.queued} /><Stat label="Inviate oggi" value={counts.today} />
        <Stat label="Inviate totali" value={counts.total} /><Stat label="Richiami" value={counts.followUps} />
        <Stat label="Risposte" value={counts.replied} /><Stat label="Disiscritti" value={counts.unsub} />
        <Stat label="Non consegnate" value={counts.bounced} />
      </div>

      <Tabs defaultValue="recipients">
        <TabsList><TabsTrigger value="recipients">Destinatari</TabsTrigger><TabsTrigger value="settings">Impostazioni</TabsTrigger><TabsTrigger value="test">Invia prova</TabsTrigger></TabsList>

        <TabsContent value="recipients" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Cerca email o nome" value={q} onChange={(e) => setQ(e.target.value)} className="w-64 bg-white" />
            <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-48 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Tutti gli stati</SelectItem>{Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            <Select value={fTpl} onValueChange={setFTpl}><SelectTrigger className="w-40 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Tutti i testi</SelectItem>{['architetti', 'imprese', 'privati'].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select>
            <span className="text-sm text-crm-ink-muted self-center">{filtered.length} destinatari</span>
          </div>
          <div className="crm-card overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-crm-ink-muted border-b border-crm-border">
                <th className="p-2">Email</th><th className="p-2">Nome</th><th className="p-2">Testo</th><th className="p-2">Stato</th><th className="p-2">Inviata</th><th className="p-2">Richiamo</th><th className="p-2"></th></tr></thead>
              <tbody>
                {filtered.slice(0, 300).map((r) => (
                  <tr key={r.id} className="border-b border-crm-border last:border-0">
                    <td className="p-2 text-crm-ink">{r.email}{r.error && <div className="text-[11px] text-destructive truncate max-w-xs">{r.error}</div>}</td>
                    <td className="p-2">{r.greeting_name || '—'}</td>
                    <td className="p-2">{r.template_version}</td>
                    <td className="p-2">{STATUS_LABEL[r.status]}</td>
                    <td className="p-2">{r.sent_at ? new Date(r.sent_at).toLocaleDateString('it-IT') : r.planned_send_date || '—'}</td>
                    <td className="p-2">{r.follow_up_at ? new Date(r.follow_up_at).toLocaleDateString('it-IT') : r.follow_up_due_date || '—'}</td>
                    <td className="p-2 whitespace-nowrap text-right">
                      {['queued', 'sent', 'follow_up_sent'].includes(r.status) && <Button size="sm" variant="outline" onClick={() => markReplied(r)}>Ha risposto</Button>}
                      {r.status === 'queued' && <Button size="sm" variant="ghost" onClick={() => exclude(r)}>Escludi</Button>}
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={7} className="p-6 text-center text-crm-ink-muted">Nessun destinatario. Aggiungili alla tabella dei destinatari usando l'ID della campagna: {c.id}</td></tr>}
              </tbody>
            </table>
            {filtered.length > 300 && <div className="p-2 text-[12px] text-crm-ink-muted">Mostrati i primi 300: usa i filtri per restringere.</div>}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="crm-card p-4 grid gap-4 md:grid-cols-2">
            <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email al giorno</Label><Input type="number" min={1} max={500} value={form.daily_limit} onChange={(e) => setForm({ ...form, daily_limit: e.target.value as any })} /></div>
            <div><Label>Ora di invio (Italia)</Label><Input type="time" value={form.send_time} onChange={(e) => setForm({ ...form, send_time: e.target.value })} /></div>
            <div><Label>Richiamo dopo (giorni lavorativi)</Label><Input type="number" min={1} value={form.follow_up_after_days} onChange={(e) => setForm({ ...form, follow_up_after_days: e.target.value as any })} /></div>
            <div className="md:col-span-2"><Label>Link presentazione PDF</Label><Input value={form.presentation_url} onChange={(e) => setForm({ ...form, presentation_url: e.target.value })} /></div>
            <div className="md:col-span-2 text-[12px] text-crm-ink-muted">Mittente: {c.sender_name} &lt;{c.sender_email}&gt; · risposte a {c.reply_to} · solo giorni lavorativi, festivi italiani esclusi.<br />ID campagna: <span className="font-mono">{c.id}</span></div>
            <div><Button onClick={save}><Save className="w-4 h-4 mr-1" />Salva</Button></div>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <div className="crm-card p-4 flex flex-wrap gap-2 items-end">
            <div><Label>Indirizzo di prova</Label><Input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="w-72" placeholder="tuo@indirizzo.it" /></div>
            <Button onClick={sendTest} disabled={sending || !testTo}><Send className="w-4 h-4 mr-1" />{sending ? 'Invio…' : 'Invia prova (4 testi)'}</Button>
            <p className="w-full text-[12px] text-crm-ink-muted">Riceverai i 4 testi con "[PROVA]" nell'oggetto. Nessun contatore viene modificato.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TemplatesEditor({ tpls, setTpls }: { tpls: any[]; setTpls: (t: any[]) => void }) {
  const [key, setKey] = useState('architetti');
  const t = tpls.find((x) => x.key === key);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  useEffect(() => { if (t) { setSubject(t.subject); setHtml(t.html_body); } }, [key, t?.id]);
  if (!t) return null;
  const preview = html.replaceAll('{{saluto}}', 'Buongiorno Mario,').replaceAll('{{presentazione_url}}', '#').replaceAll('{{unsubscribe_url}}', '#').replaceAll('{{mittente}}', 'Andrea Facchinetti<br>Kalēa');
  const save = async () => {
    const { data, error } = await supabase.from('email_templates').update({ subject, html_body: html }).eq('id', t.id).select().single();
    if (error) return toast.error(error.message);
    setTpls(tpls.map((x) => (x.id === t.id ? data : x))); toast.success('Testo salvato');
  };
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-crm-ink">Testi delle email</h2>
      <Tabs value={key} onValueChange={setKey}>
        <TabsList>{['architetti', 'imprese', 'privati', 'richiamo'].map((k) => <TabsTrigger key={k} value={k}>{k}</TabsTrigger>)}</TabsList>
      </Tabs>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="crm-card p-4 space-y-3">
          <div><Label>Oggetto</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div><Label>Testo (HTML)</Label><Textarea rows={14} value={html} onChange={(e) => setHtml(e.target.value)} className="font-mono text-[12px]" /></div>
          <p className="text-[12px] text-crm-ink-muted">Segnaposto: {'{{saluto}}'}, {'{{presentazione_url}}'}, {'{{mittente}}'}. Il link per disiscriversi e i dati aziendali vengono aggiunti sempre in fondo.</p>
          <Button onClick={save}><Save className="w-4 h-4 mr-1" />Salva testo</Button>
        </div>
        <div className="crm-card p-4 bg-white">
          <div className="text-[12px] text-crm-ink-muted mb-2">Anteprima · {subject}</div>
          <div className="text-[14px] leading-relaxed text-crm-ink [&_a]:underline" dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
    </div>
  );
}
