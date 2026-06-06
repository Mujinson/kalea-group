import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface Point {
  date: string;
  label: string;
  revenue: number;
  count: number;
}

const SalesTrendChart = () => {
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = startOfDay(subDays(new Date(), 29)).toISOString();
      const { data: sales } = await supabase
        .from('sales')
        .select('quantity_sqm, sale_price, created_at')
        .gte('created_at', since);

      const buckets: Record<string, Point> = {};
      for (let i = 29; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, 'yyyy-MM-dd');
        buckets[key] = { date: key, label: format(d, 'd MMM', { locale: it }), revenue: 0, count: 0 };
      }
      sales?.forEach((s) => {
        const key = format(new Date(s.created_at), 'yyyy-MM-dd');
        if (!buckets[key]) return;
        buckets[key].revenue += Number(s.quantity_sqm || 0) * Number(s.sale_price || 0);
        buckets[key].count += 1;
      });
      setData(Object.values(buckets));
      setLoading(false);
    })();
  }, []);

  const total = data.reduce((s, p) => s + p.revenue, 0);
  const count = data.reduce((s, p) => s + p.count, 0);

  return (
    <div className="bg-white rounded-lg border p-5" style={{ borderColor: 'rgba(59,35,20,0.10)' }}>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#8A7060] font-semibold mb-1">Trend vendite · 30gg</p>
          <p className="text-[22px] font-semibold text-[#1A1008]">
            {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(total)}
          </p>
          <p className="text-[12px] text-[#8A7060]">{count} vendite negli ultimi 30 giorni</p>
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-[180px] w-full" />
      ) : (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8A96E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C8A96E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,35,20,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8A7060' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 10, fill: '#8A7060' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(59,35,20,0.12)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [
                  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v),
                  'Fatturato',
                ]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C8A96E" strokeWidth={2} fill="url(#goldFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SalesTrendChart;
