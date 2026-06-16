import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Plus, TrendingUp, FileText, CheckCircle2, Target } from 'lucide-react';

const eur = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

const CommercialeHome = () => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ inviati: 0, accettati: 0, valore: 0, target: 0 });
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: sp } = await supabase
        .from('salespeople')
        .select('first_name')
        .eq('user_id', user.id)
        .maybeSingle();
      const meta: any = (user as any).user_metadata || {};
      const fromMeta = (meta.first_name as string) ||
        ((meta.full_name as string) || (meta.name as string) || '').split(' ')[0];
      const fromEmail = (user.email || '').split('@')[0].split('.')[0];
      const n = (sp?.first_name || fromMeta || fromEmail || '').trim();
      if (n) setFirstName(n.charAt(0).toUpperCase() + n.slice(1));
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: quotes } = await supabase
        .from('quotes')
        .select('id,status,total_amount,created_at')
        .eq('created_by', user.id)
        .gte('created_at', monthStart);

      const inviati = quotes?.filter((q: any) =>
        ['sent', 'inviato', 'accepted', 'accettato', 'rejected', 'rifiutato'].includes((q.status || '').toLowerCase())
      ).length || 0;
      const acc = quotes?.filter((q: any) =>
        ['accepted', 'accettato'].includes((q.status || '').toLowerCase())
      ) || [];
      const valore = acc.reduce((s: number, q: any) => s + Number(q.total_amount || 0), 0);

      const { data: t } = await supabase
        .from('monthly_targets')
        .select('target_eur')
        .eq('user_id', user.id)
        .eq('year', now.getFullYear())
        .eq('month', now.getMonth() + 1)
        .maybeSingle();

      setStats({ inviati, accettati: acc.length, valore, target: Number(t?.target_eur || 0) });
      setLoading(false);
    })();
  }, [user]);

  const pct = stats.target > 0 ? Math.min(100, Math.round((stats.valore / stats.target) * 100)) : 0;
  const barColor = pct >= 80 ? '#16A34A' : pct >= 50 ? '#EAB308' : '#DC2626';

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-[13px] text-[#8C7B6B] uppercase tracking-wider">Questo mese</p>
        <h1 className="text-[26px] font-semibold text-[#1E1B4B] mt-1">Ciao{firstName ? ` ${firstName}` : ''} 👋</h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <KPI icon={<FileText className="w-5 h-5" />} label="Inviati" value={stats.inviati} />
        <KPI icon={<CheckCircle2 className="w-5 h-5" />} label="Accettati" value={stats.accettati} />
        <KPI icon={<TrendingUp className="w-5 h-5" />} label="Valore" value={eur(stats.valore)} />
        <KPI icon={<Target className="w-5 h-5" />} label="Conversione" value={
          stats.inviati > 0 ? `${Math.round((stats.accettati / stats.inviati) * 100)}%` : '—'
        } />
      </div>

      {/* Target bar */}
      <div className="bg-white rounded-xl border border-[#E5E2DD] p-5">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-[13px] font-medium text-[#1E1B4B]">Obiettivo mensile</span>
          <span className="text-[13px] text-[#6B6258]">
            {stats.target > 0 ? `${eur(stats.valore)} / ${eur(stats.target)}` : 'Nessun target'}
          </span>
        </div>
        <div className="h-3 rounded-full bg-[#F0EDE7] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <div className="text-[12px] text-[#8C7B6B] mt-2">{pct}% completato</div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/app/commerciale/lead')}
          className="h-[56px] rounded-xl bg-[#1E1B4B] text-white font-medium text-[15px] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nuovo Lead
        </button>
        <button
          onClick={() => navigate('/admin/strumenti/crea-preventivo')}
          className="h-[56px] rounded-xl bg-[#8B6F4E] text-white font-medium text-[15px] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Preventivo
        </button>
      </div>

      {loading && <div className="text-center text-[12px] text-[#8C7B6B]">Caricamento…</div>}
    </div>
  );
};

const KPI = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-[#E5E2DD] p-4">
    <div className="flex items-center gap-2 text-[#8C7B6B] mb-2">
      {icon}
      <span className="text-[12px] uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-[22px] font-semibold text-[#1E1B4B] leading-tight">{value}</div>
  </div>
);

export default CommercialeHome;
