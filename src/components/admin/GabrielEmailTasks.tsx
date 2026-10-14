import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Send, Check, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type Task = {
  id: string; account: string; area: string; from_name: string | null; from_email: string | null; subject: string | null;
  received_at: string | null; cliente: string | null; azienda: string | null; progetto: string | null; richiesta: string | null;
  azione: string | null; priorita: string; riassunto: string | null; bozza_risposta: string | null; status: string;
};
const prioOrder: Record<string, number> = { alta: 0, media: 1, bassa: 2 };
const prioStyle: Record<string, string> = {
  alta: 'bg-destructive/10 text-destructive', media: 'bg-orange-500/10 text-orange-600', bassa: 'bg-crm-bg-soft text-crm-ink-muted',
};

export default function GabrielEmailTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('gabriel_email_tasks').select('*').eq('status', 'da_fare').order('received_at', { ascending: false });
    setTasks(((data as Task[]) || []).sort((a, b) => (prioOrder[a.priorita] ?? 1) - (prioOrder[b.priorita] ?? 1)));
  };
  useEffect(() => { load(); }, []);

  const analyze = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('gabriel-inbox', { body: { analyze: true } });
    setBusy(false);
    if (error || data?.error) return toast.error(data?.error || 'Analisi non riuscita');
    toast.success(data.analyzed ? `${data.analyzed} email nuove analizzate${data.remaining ? ` (altre ${data.remaining}: premi di nuovo)` : ''}` : 'Nessuna email nuova');
    if (data.errors?.length) toast.error(data.errors.join(' · '));
    load();
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from('gabriel_email_tasks').update({ status }).eq('id', id);
    setTasks((t) => t.filter((x) => x.id !== id));
  };

  const send = async (t: Task) => {
    if (!draft.trim()) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke('gabriel-inbox', { body: { send_task_id: t.id, text: draft } });
    setSending(false);
    if (error || data?.error) return toast.error(data?.error || 'Invio non riuscito');
    toast.success(`Risposta inviata a ${t.from_email}`);
    setOpen(null);
    setTasks((x) => x.filter((y) => y.id !== t.id));
  };

  const Group = ({ area, label }: { area: string; label: string }) => {
    const list = tasks.filter((t) => t.area === area);
    return (
      <div className="rounded-crm bg-crm-surface border border-crm-border p-4">
        <div className="font-semibold text-crm-ink mb-3">{label} <span className="text-crm-ink-subtle font-normal">({list.length})</span></div>
        {list.length === 0 && <div className="text-sm text-crm-ink-muted">Niente in sospeso 👍</div>}
        <div className="space-y-3">
          {list.map((t) => (
            <div key={t.id} className="border border-crm-border rounded-crm-sm p-3">
              <div className="flex items-start gap-2">
                <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${prioStyle[t.priorita] || prioStyle.media}`}>{t.priorita}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-crm-ink">{t.azione}</div>
                  <div className="text-xs text-crm-ink-muted mt-0.5">
                    {[t.cliente || t.from_name, t.azienda, t.progetto].filter(Boolean).join(' · ')} — {t.subject}
                  </div>
                  {t.riassunto && <div className="text-xs text-crm-ink-muted mt-1">{t.riassunto}</div>}
                  <div className="text-[11px] text-crm-ink-subtle mt-1">
                    {t.account}{t.received_at ? ` · ${new Date(t.received_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => { setOpen(open === t.id ? null : t.id); setDraft(t.bozza_risposta || ''); }}>
                  <Send className="w-3.5 h-3.5 mr-1" /> {t.bozza_risposta ? 'Vedi risposta pronta' : 'Rispondi'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(t.id, 'fatta')}><Check className="w-3.5 h-3.5 mr-1" /> Fatto</Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(t.id, 'ignorata')}><EyeOff className="w-3.5 h-3.5 mr-1" /> Ignora</Button>
              </div>
              {open === t.id && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-crm-ink-muted">A: {t.from_email} · da {t.account}</div>
                  <Textarea rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Scrivi la risposta…" />
                  <Button size="sm" onClick={() => send(t)} disabled={sending || !draft.trim()}>
                    {sending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />} Invia
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-crm-ink">Email da gestire</h2>
        <Button onClick={analyze} disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {busy ? 'Sto leggendo le email…' : 'Leggi le nuove email'}
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Group area="kalea" label="✉️ Kalēa®" />
        <Group area="geopietra" label="🤝 Geopietra" />
      </div>
    </div>
  );
}
