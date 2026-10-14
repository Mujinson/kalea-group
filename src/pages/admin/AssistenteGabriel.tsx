import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Brain, Send, Loader2, Mail, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Item = { title: string; detail?: string; link?: string; area: string };
type Section = { key: string; label: string; emoji: string; tone: string; items: Item[] };

const toneBorder: Record<string, string> = {
  red: 'border-l-destructive', orange: 'border-l-orange-500', yellow: 'border-l-yellow-500',
  blue: 'border-l-crm-primary', green: 'border-l-emerald-500', gray: 'border-l-crm-border-strong',
};

export default function AssistenteGabriel() {
  const [data, setData] = useState<{ date: string; sections: Section[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const run = async (send = false) => {
    send ? setSending(true) : setLoading(true);
    const { data: d, error } = await supabase.functions.invoke('gabriel-assistant', { body: { send_telegram: send } });
    send ? setSending(false) : setLoading(false);
    if (error || d?.error) return toast.error(d?.error || 'Errore nel caricamento');
    setData(d);
    if (send) d.telegram === 'sent' ? toast.success('Briefing inviato su Telegram') : toast.error(`Telegram: ${d.telegram}`);
  };

  const [mails, setMails] = useState<any[] | null>(null);
  const [mailErr, setMailErr] = useState<string[]>([]);
  const [mailLoading, setMailLoading] = useState(false);
  const loadMails = async () => {
    setMailLoading(true);
    const { data: d, error } = await supabase.functions.invoke('gabriel-inbox', { body: {} });
    setMailLoading(false);
    if (error || d?.error) return toast.error(d?.error || 'Errore lettura email');
    setMails(d.mails); setMailErr(d.errors || []);
  };

  const [openMail, setOpenMail] = useState<any | null>(null);
  const readMail = async (m: any) => {
    if (m.link) return window.open(m.link, '_blank');
    setOpenMail({ loading: true, subject: m.subject });
    const { data: d, error } = await supabase.functions.invoke('gabriel-inbox', { body: { read_uid: m.uid, account: m.account } });
    if (error || d?.error) { setOpenMail(null); return toast.error(d?.error || 'Impossibile aprire la email'); }
    setOpenMail(d);
  };

  const total = data?.sections.reduce((n, s) => n + s.items.length, 0) ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-crm-ink">Assistente di Gabriel</h1>
        <p className="text-sm text-crm-ink-muted mt-1">Il tuo braccio destro: tutto quello che devi fare, in ordine di priorità.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={() => run(false)} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
          Cosa devo fare oggi?
        </Button>
        <Button size="lg" variant="outline" onClick={() => run(true)} disabled={sending}>
          {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Mandami il briefing su Telegram
        </Button>
        <Button size="lg" variant="outline" onClick={loadMails} disabled={mailLoading}>
          {mailLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
          Controlla cosa ho lasciato indietro
        </Button>
      </div>

      {data && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-crm-ink-muted">{data.date} · {total} cose da guardare</div>
          {data.sections.filter((s) => s.items.length).map((s) => (
            <div key={s.key} className={`rounded-crm bg-crm-surface border border-crm-border border-l-4 ${toneBorder[s.tone]} p-4`}>
              <div className="font-semibold text-crm-ink mb-2">{s.emoji} {s.label} <span className="text-crm-ink-subtle font-normal">({s.items.length})</span></div>
              <ul className="divide-y divide-crm-border">
                {s.items.map((i, idx) => (
                  <li key={idx}>
                    <Link to={i.link || '#'} className="flex items-center gap-3 py-2 hover:bg-crm-bg-soft rounded px-2 -mx-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-crm-ink truncate">{i.title}</div>
                        {i.detail && <div className="text-xs text-crm-ink-muted truncate">{i.detail}</div>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-crm-ink-subtle shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {total === 0 && <div className="text-center text-crm-ink-muted py-10">Niente in sospeso. Buona giornata! ☀️</div>}
        </div>
      )}

      <Dialog open={!!openMail} onOpenChange={(o) => !o && setOpenMail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{openMail?.subject}</DialogTitle></DialogHeader>
          {openMail?.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : openMail && (
            <div className="space-y-3 text-sm">
              <div className="text-crm-ink-muted">Da: {openMail.from}<br />A: {openMail.to}<br />{openMail.date && new Date(openMail.date).toLocaleString('it-IT')}</div>
              {openMail.attachments?.length > 0 && <div className="text-crm-ink-muted">📎 {openMail.attachments.join(', ')}</div>}
              <div className="whitespace-pre-wrap break-words text-crm-ink">{openMail.text}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {mails && (
        <div className="grid md:grid-cols-2 gap-4">
          {[['kalea', '✉️ Email Kalēa® senza risposta'], ['geopietra', '🤝 Email Geopietra senza risposta']].map(([area, label]) => {
            const list = mails.filter((m) => m.area === area);
            return (
              <div key={area} className="rounded-crm bg-crm-surface border border-crm-border p-4">
                <div className="font-semibold text-crm-ink mb-2">{label} <span className="text-crm-ink-subtle font-normal">({list.length})</span></div>
                {list.length === 0 && <div className="text-sm text-crm-ink-muted">Tutto risposto 👍</div>}
                <ul className="divide-y divide-crm-border">
                  {list.map((m, i) => (
                    <li key={i} className="py-2">
                      <button type="button" onClick={() => readMail(m)} className="block w-full text-left hover:bg-crm-bg-soft rounded px-2 -mx-2">
                        <div className="text-sm text-crm-ink truncate"><b>{m.from}</b> – {m.subject}</div>
                        <div className="text-xs text-crm-ink-muted truncate">
                          {new Date(m.date).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · {m.account}{m.snippet ? ` · ${m.snippet}` : ''}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {mailErr.length > 0 && <div className="md:col-span-2 text-sm text-destructive">{mailErr.join(' · ')}</div>}
        </div>
      )}
    </div>
  );
}
