import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BellRing, Phone, Mail, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { quotesNeedingFollowUp } from '@/lib/quoteCrm';

interface Props {
  quotes: any[];
  /** Giorni senza risposta oltre i quali serve un sollecito */
  afterDays?: number;
  getClientName: (q: any) => string;
  onUpdated?: () => void;
}

const euro = (n: number) => `€${(Number(n) || 0).toLocaleString('it-IT', { maximumFractionDigits: 0 })}`;

export const QuoteFollowUpPanel = ({ quotes, afterDays = 5, getClientName, onUpdated }: Props) => {
  const [open, setOpen] = useState(true);
  const pending = useMemo(() => quotesNeedingFollowUp(quotes, afterDays), [quotes, afterDays]);
  if (!pending.length) return null;

  const markContacted = async (q: any) => {
    const { error } = await supabase.from('quotes')
      .update({ sent_date: new Date().toISOString(), status: 'in_trattativa' })
      .eq('id', q.id);
    if (error) { toast.error(error.message); return; }
    if (q.lead_id) {
      await supabase.from('leads').update({ last_interaction_at: new Date().toISOString() }).eq('id', q.lead_id);
    }
    toast.success('Contatto registrato');
    onUpdated?.();
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-2 text-left">
        <BellRing className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-900">
          Da ricontattare — {pending.length} preventiv{pending.length === 1 ? 'o' : 'i'} senza risposta
        </span>
        <span className="ml-auto text-amber-700">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {pending.slice(0, 8).map(q => {
            const phone = (q as any).client_phone || (q as any).quote_data?.cliente?.telefono || '';
            const email = (q as any).quote_data?.cliente?.email || '';
            return (
              <div key={q.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/80 px-3 py-2">
                <span className="text-sm font-medium text-slate-800">{getClientName(q)}</span>
                <span className="text-xs text-slate-500">{q.quote_number || '—'}</span>
                <span className="text-xs text-slate-600">{euro(q.total_amount || 0)}</span>
                <Badge variant="outline" className="border-amber-300 text-amber-700">{q.days} giorni</Badge>
                <div className="ml-auto flex gap-1">
                  {phone && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${phone}`}><Phone className="h-3.5 w-3.5" /></a>
                    </Button>
                  )}
                  {email && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${email}`}><Mail className="h-3.5 w-3.5" /></a>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => markContacted(q)}>
                    <Check className="mr-1 h-3.5 w-3.5" />Ricontattato
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
