import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { Loader2, X, CalendarOff } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; onCreated?: () => void; }

const KINDS = [
  { value: 'ferie', label: 'Ferie' },
  { value: 'malattia', label: 'Malattia' },
  { value: 'permesso', label: 'Permesso' },
  { value: 'indisponibile', label: 'Indisponibile' },
];

const TimeOffSheet = ({ open, onClose, onCreated }: Props) => {
  const { user } = useAdminAuth();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [kind, setKind] = useState('ferie');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase
        .from('time_off_requests')
        .select('id,start_date,end_date,kind,status,decision_note,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setHistory(data || []);
    })();
  }, [open, user]);

  if (!open) return null;

  const submit = async () => {
    if (!user || !start || !end) { toast.error('Date richieste'); return; }
    if (end < start) { toast.error('La data di fine deve essere ≥ inizio'); return; }
    setSaving(true);
    const { error } = await supabase.from('time_off_requests').insert({
      user_id: user.id,
      start_date: start,
      end_date: end,
      kind,
      note: note || null,
      status: 'pending',
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Richiesta inviata');
    setStart(''); setEnd(''); setNote(''); setKind('ferie');
    onCreated?.();
    onClose();
  };

  const statusColor = (s: string) =>
    s === 'approved' ? '#16A34A' : s === 'rejected' ? '#DC2626' : '#EAB308';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1E1B4B]">
            <CalendarOff className="w-5 h-5" />
            <h2 className="text-[17px] font-semibold">Ferie / Indisponibilità</h2>
          </div>
          <button onClick={onClose} className="p-1 -mr-1 text-[#8C7B6B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[12px] text-[#8C7B6B] uppercase tracking-wider">Tipologia</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {KINDS.map((k) => (
                <button
                  key={k.value}
                  onClick={() => setKind(k.value)}
                  className={`h-[44px] rounded-lg border text-[14px] font-medium ${
                    kind === k.value
                      ? 'bg-[#1E1B4B] text-white border-[#1E1B4B]'
                      : 'bg-white text-[#1E1B4B] border-[#E5E2DD]'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-[#8C7B6B] uppercase tracking-wider">Dal</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full h-[44px] rounded-lg border border-[#E5E2DD] px-3 text-[14px] text-[#1E1B4B]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#8C7B6B] uppercase tracking-wider">Al</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full h-[44px] rounded-lg border border-[#E5E2DD] px-3 text-[14px] text-[#1E1B4B]"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] text-[#8C7B6B] uppercase tracking-wider">Note (opzionale)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[#E5E2DD] p-3 text-[14px] text-[#1E1B4B] resize-none"
              placeholder="Motivo o dettagli…"
            />
          </div>

          <button
            onClick={submit}
            disabled={saving}
            className="w-full h-[52px] rounded-lg bg-[#1E1B4B] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Invia richiesta'}
          </button>
        </div>

        {history.length > 0 && (
          <div className="pt-2">
            <p className="text-[12px] text-[#8C7B6B] uppercase tracking-wider mb-2">Storico</p>
            <ul className="divide-y divide-[#F1EEE9] border border-[#E5E2DD] rounded-lg">
              {history.map((h) => (
                <li key={h.id} className="px-3 py-2 flex items-center justify-between">
                  <div className="text-[13px] text-[#1E1B4B]">
                    <span className="capitalize">{h.kind}</span>{' '}
                    <span className="text-[#6B6258]">
                      {new Date(h.start_date).toLocaleDateString('it-IT')} → {new Date(h.end_date).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ background: statusColor(h.status) }}
                  >
                    {h.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeOffSheet;
