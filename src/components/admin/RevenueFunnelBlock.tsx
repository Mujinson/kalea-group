import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CrmKpiTile, CrmKpiRow } from '@/components/admin/CrmShell';
import { fmtEur } from '@/lib/finance';
import { Wallet, Receipt, Hourglass, FileText, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

const WON = ['accepted', 'converted', 'invoiced'];

export default function RevenueFunnelBlock() {
  const [period, setPeriod] = useState<'year' | 'all'>('year');
  const { data } = useQuery({
    queryKey: ['revenue-funnel'],
    queryFn: async () => {
      const [ps, inv, q] = await Promise.all([
        supabase.from('payment_schedules').select('amount, is_paid, paid_date, due_date'),
        supabase.from('customer_invoices').select('total, invoice_date'),
        supabase.from('quotes').select('status, total_amount, created_at, updated_at'),
      ]);
      return { ps: ps.data || [], inv: inv.data || [], q: q.data || [] };
    },
  });

  const c = useMemo(() => {
    const y = new Date().getFullYear();
    const ok = (d?: string | null) => period === 'all' || (!!d && new Date(d).getFullYear() === y);
    const d = data || { ps: [], inv: [], q: [] };
    const n = (v: any) => Number(v || 0);
    const incassato = d.ps.filter((r: any) => r.is_paid && ok(r.paid_date || r.due_date)).reduce((a, r: any) => a + n(r.amount), 0);
    const daRicevere = d.ps.filter((r: any) => !r.is_paid).reduce((a, r: any) => a + n(r.amount), 0);
    const fatturato = d.inv.filter((r: any) => ok(r.invoice_date)).reduce((a, r: any) => a + n(r.total), 0);
    const qs = d.q.filter((r: any) => ok(r.created_at) && r.status !== 'draft');
    const preventivato = qs.reduce((a, r: any) => a + n(r.total_amount), 0);
    const won = qs.filter((r: any) => WON.includes(r.status));
    const lost = qs.filter((r: any) => r.status === 'rejected');
    const perso = lost.reduce((a, r: any) => a + n(r.total_amount), 0);
    const vinto = won.reduce((a, r: any) => a + n(r.total_amount), 0);
    const closed = won.length + lost.length;
    const pWon = closed ? (won.length / closed) * 100 : 0;
    const pVal = vinto + perso ? (vinto / (vinto + perso)) * 100 : 0;
    const open = qs.length - closed;
    return { incassato, daRicevere, fatturato, preventivato, perso, vinto, won: won.length, lost: lost.length, pWon, pVal, open, total: qs.length };
  }, [data, period]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Soldi e preventivi</h2>
        <div className="flex rounded-md border overflow-hidden text-[12px]">
          {(['year', 'all'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 ${period === p ? 'bg-crm-primary text-white' : 'bg-card'}`}>
              {p === 'year' ? `Anno ${new Date().getFullYear()}` : 'Sempre'}
            </button>
          ))}
        </div>
      </div>
      <CrmKpiRow cols={5}>
        <CrmKpiTile label="Incassato" value={fmtEur(c.incassato)} color="green" icon={<Wallet className="w-4 h-4" />} />
        <CrmKpiTile label="Fatturato" value={fmtEur(c.fatturato)} color="indigo" icon={<Receipt className="w-4 h-4" />} />
        <CrmKpiTile label="Ancora da ricevere" value={fmtEur(c.daRicevere)} color="amber" icon={<Hourglass className="w-4 h-4" />} hint="rate non ancora incassate" />
        <CrmKpiTile label="Preventivato" value={fmtEur(c.preventivato)} color="blue" icon={<FileText className="w-4 h-4" />} hint={`${c.total} preventivi · ${c.open} aperti`} />
        <CrmKpiTile label="Preventivato perso" value={fmtEur(c.perso)} color="red" icon={<XCircle className="w-4 h-4" />} hint={`${c.lost} preventivi`} />
      </CrmKpiRow>
      <CrmKpiRow cols={2}>
        <CrmKpiTile label="Chiusura positiva" value={`${c.pWon.toFixed(0)}%`} color="green" icon={<ThumbsUp className="w-4 h-4" />}
          hint={`${c.won} vinti su ${c.won + c.lost} chiusi · ${c.pVal.toFixed(0)}% del valore (${fmtEur(c.vinto)})`} />
        <CrmKpiTile label="Chiusura negativa" value={`${(c.won + c.lost ? 100 - c.pWon : 0).toFixed(0)}%`} color="red" icon={<ThumbsDown className="w-4 h-4" />}
          hint={`${c.lost} persi su ${c.won + c.lost} chiusi · ${(c.vinto + c.perso ? 100 - c.pVal : 0).toFixed(0)}% del valore`} />
      </CrmKpiRow>
    </div>
  );
}
