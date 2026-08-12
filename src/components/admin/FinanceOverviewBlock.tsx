import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CrmKpiTile, CrmKpiRow } from '@/components/admin/CrmShell';
import ScadenzarioTable from '@/components/admin/ScadenzarioTable';
import { fmtEur, categoryLabel } from '@/lib/finance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Euro, TrendingDown, TrendingUp, Percent } from 'lucide-react';

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const PIE_COLORS = ['#4F46E5', '#16A34A', '#EA580C', '#E44258', '#A25DDC', '#0891B2', '#D97706', '#475569', '#DB2777'];

const inMonth = (d: string | null | undefined, year: number, month: number) => {
  if (!d) return false;
  const dt = new Date(d);
  return dt.getFullYear() === year && dt.getMonth() === month;
};

export function FinanceOverviewBlock() {
  const { data } = useQuery({
    queryKey: ['finance-overview'],
    queryFn: async () => {
      const [supInv, custInv, fixed, variable, siteExp] = await Promise.all([
        supabase.from('supplier_invoices').select('invoice_date, due_date, subtotal, vat_amount, total, paid_amount, status, category, is_reverse_charge'),
        supabase.from('customer_invoices').select('invoice_date, due_date, subtotal, vat_amount, total, paid_amount, status'),
        supabase.from('fixed_costs').select('cost_date, amount, category'),
        supabase.from('variable_costs').select('cost_date, amount, category'),
        supabase.from('site_expenses').select('expense_date, amount, expense_type'),
      ]);
      if (supInv.error) throw supInv.error;
      return {
        supInv: supInv.data || [],
        custInv: custInv.data || [],
        fixed: fixed.data || [],
        variable: variable.data || [],
        siteExp: siteExp.data || [],
      };
    },
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const calc = useMemo(() => {
    const d = data || { supInv: [], custInv: [], fixed: [], variable: [], siteExp: [] };

    const costsInMonth = (y: number, m: number) =>
      d.supInv.filter((r: any) => inMonth(r.invoice_date, y, m)).reduce((s, r: any) => s + Number(r.total || 0), 0) +
      d.fixed.filter((r: any) => inMonth(r.cost_date, y, m)).reduce((s, r: any) => s + Number(r.amount || 0), 0) +
      d.variable.filter((r: any) => inMonth(r.cost_date, y, m)).reduce((s, r: any) => s + Number(r.amount || 0), 0) +
      d.siteExp.filter((r: any) => inMonth(r.expense_date, y, m)).reduce((s, r: any) => s + Number(r.amount || 0), 0);

    const thisMonth = costsInMonth(year, month);
    const prevDate = new Date(year, month - 1, 1);
    const lastMonth = costsInMonth(prevDate.getFullYear(), prevDate.getMonth());
    const variation = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;

    const today = new Date().toISOString().split('T')[0];
    const openSup = d.supInv.filter((r: any) => r.status !== 'pagata');
    const supToPay = openSup.reduce((s, r: any) => s + Math.max(0, Number(r.total || 0) - Number(r.paid_amount || 0)), 0);
    const supOverdue = openSup.filter((r: any) => r.due_date && r.due_date < today)
      .reduce((s, r: any) => s + Math.max(0, Number(r.total || 0) - Number(r.paid_amount || 0)), 0);

    const openCust = d.custInv.filter((r: any) => Number(r.paid_amount || 0) < Number(r.total || 0));
    const custToCollect = openCust.reduce((s, r: any) => s + Math.max(0, Number(r.total || 0) - Number(r.paid_amount || 0)), 0);
    const custOverdue = openCust.filter((r: any) => r.due_date && r.due_date < today)
      .reduce((s, r: any) => s + Math.max(0, Number(r.total || 0) - Number(r.paid_amount || 0)), 0);

    // IVA del trimestre corrente
    const q = Math.floor(month / 3);
    const inQuarter = (dt?: string | null) => {
      if (!dt) return false;
      const x = new Date(dt);
      return x.getFullYear() === year && Math.floor(x.getMonth() / 3) === q;
    };
    const vatDebit = d.custInv.filter((r: any) => inQuarter(r.invoice_date)).reduce((s, r: any) => s + Number(r.vat_amount || 0), 0);
    const vatCredit = d.supInv.filter((r: any) => inQuarter(r.invoice_date) && !r.is_reverse_charge)
      .reduce((s, r: any) => s + Number(r.vat_amount || 0), 0);
    const vat = vatDebit - vatCredit;

    const monthly = MONTHS.map((label, m) => ({
      label,
      Entrate: d.custInv.filter((r: any) => inMonth(r.invoice_date, year, m)).reduce((s, r: any) => s + Number(r.total || 0), 0),
      Uscite: costsInMonth(year, m),
    }));

    const byCategory = new Map<string, number>();
    const add = (k: string, v: number) => byCategory.set(k, (byCategory.get(k) || 0) + v);
    d.supInv.forEach((r: any) => add(r.category || 'altri', Number(r.total || 0)));
    d.fixed.forEach((r: any) => add(r.category || 'altri_costi_fissi', Number(r.amount || 0)));
    d.variable.forEach((r: any) => add(r.category || 'altri', Number(r.amount || 0)));
    d.siteExp.forEach((r: any) => add(r.expense_type || 'altri', Number(r.amount || 0)));
    const pie = Array.from(byCategory.entries())
      .map(([k, v]) => ({ name: categoryLabel(k), value: Math.round(v * 100) / 100 }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);

    return { thisMonth, variation, supToPay, supOverdue, custToCollect, custOverdue, vat, monthly, pie };
  }, [data, year, month]);

  return (
    <div className="space-y-4">
      <CrmKpiRow>
        <CrmKpiTile
          label="Costi del mese"
          value={fmtEur(calc.thisMonth)}
          color="orange"
          icon={<TrendingDown className="w-4 h-4" />}
          hint={calc.variation === null ? 'Nessun dato mese scorso' : (
            <span className={calc.variation > 0 ? 'text-red-600' : 'text-green-600'}>
              {calc.variation > 0 ? '+' : ''}{calc.variation.toFixed(1)}% vs mese scorso
            </span>
          )}
        />
        <CrmKpiTile
          label="Da pagare fornitori"
          value={fmtEur(calc.supToPay)}
          color="red"
          icon={<Euro className="w-4 h-4" />}
          hint={<span className="text-red-600">di cui scaduto: {fmtEur(calc.supOverdue)}</span>}
        />
        <CrmKpiTile
          label="Da incassare clienti"
          value={fmtEur(calc.custToCollect)}
          color="green"
          icon={<TrendingUp className="w-4 h-4" />}
          hint={<span className="text-red-600">di cui scaduto: {fmtEur(calc.custOverdue)}</span>}
        />
        <CrmKpiTile
          label="IVA del periodo"
          value={fmtEur(Math.abs(calc.vat))}
          color={calc.vat < 0 ? 'green' : 'amber'}
          icon={<Percent className="w-4 h-4" />}
          hint={calc.vat < 0 ? <span className="text-green-600">a credito</span> : 'a debito (trimestre)'}
        />
      </CrmKpiRow>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Entrate e uscite per mese</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calc.monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => fmtEur(Number(v))} />
                <Legend />
                <Bar dataKey="Entrate" fill="#16A34A" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Uscite" fill="#E44258" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Costi per categoria</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            {calc.pie.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun costo registrato.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={calc.pie} dataKey="value" nameKey="name" outerRadius={90} label={(e: any) => e.name}>
                    {calc.pie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmtEur(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm">Prossime scadenze</CardTitle>
          <Link to="/admin/costi" className="text-[12px] text-crm-primary hover:underline">Scadenzario completo</Link>
        </CardHeader>
        <CardContent>
          <ScadenzarioTable compact limit={8} />
        </CardContent>
      </Card>
    </div>
  );
}

export default FinanceOverviewBlock;
