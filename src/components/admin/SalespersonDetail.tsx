import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, TrendingUp, Briefcase } from 'lucide-react';

interface Props {
  salespersonId: string;
}

interface Salesperson {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  commission_rate: number | null;
  notes: string | null;
}

interface Quote {
  id: string;
  quote_number: string | null;
  project_name: string | null;
  status: string;
  total_amount: number;
  created_at: string;
}

interface SaleSalesperson {
  id: string;
  commission_percentage: number;
  commission_amount: number | null;
  sale_id: string;
}

const SalespersonDetail = ({ salespersonId }: Props) => {
  const [sp, setSp] = useState<Salesperson | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [commissions, setCommissions] = useState<SaleSalesperson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [spRes, quotesRes, commRes] = await Promise.all([
        supabase.from('salespeople').select('*').eq('id', salespersonId).single(),
        supabase.from('quotes').select('*').eq('assigned_to', salespersonId).order('created_at', { ascending: false }),
        supabase.from('sale_salespeople').select('*').eq('salesperson_id', salespersonId),
      ]);
      if (spRes.data) setSp(spRes.data);
      setQuotes(quotesRes.data || []);
      setCommissions(commRes.data || []);
      setLoading(false);
    };
    load();
  }, [salespersonId]);

  const stats = useMemo(() => {
    const draft = quotes.filter(q => q.status === 'draft').length;
    const sent = quotes.filter(q => q.status === 'sent' || q.status === 'in_attesa').length;
    const won = quotes.filter(q => q.status === 'accepted' || q.status === 'vinto').length;
    const lost = quotes.filter(q => q.status === 'rejected' || q.status === 'perso').length;
    const totalCommission = commissions.reduce((s, c) => s + (c.commission_amount || 0), 0);
    return { draft, sent, won, lost, total: quotes.length, totalCommission };
  }, [quotes, commissions]);

  const statusLabel = (s: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Bozza', variant: 'secondary' },
      sent: { label: 'Inviato', variant: 'default' },
      in_attesa: { label: 'In Attesa', variant: 'default' },
      accepted: { label: 'Vinto', variant: 'default' },
      vinto: { label: 'Vinto', variant: 'default' },
      rejected: { label: 'Perso', variant: 'destructive' },
      perso: { label: 'Perso', variant: 'destructive' },
    };
    return map[s] || { label: s, variant: 'outline' as const };
  };

  if (loading) return <p className="p-4">Caricamento...</p>;
  if (!sp) return <p className="p-4">Commerciale non trovato</p>;

  const barTotal = Math.max(stats.total, 1);

  return (
    <div className="space-y-6 mt-4">
      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {sp.first_name} {sp.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{sp.email || '-'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Telefono</span><span>{sp.phone || '-'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Provvigione accordo</span><span className="font-semibold">{sp.commission_rate ?? 0}%</span></div>
          {sp.notes && <div className="flex justify-between"><span className="text-muted-foreground">Note</span><span>{sp.notes}</span></div>}
        </CardContent>
      </Card>

      {/* Stats chart (horizontal bars) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            Riepilogo Preventivi ({stats.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Bozza', count: stats.draft, color: 'bg-gray-400' },
            { label: 'In Attesa / Inviati', count: stats.sent, color: 'bg-blue-500' },
            { label: 'Vinti', count: stats.won, color: 'bg-green-500' },
            { label: 'Persi', count: stats.lost, color: 'bg-red-500' },
          ].map(bar => (
            <div key={bar.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{bar.label}</span>
                <span className="font-semibold">{bar.count}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${(bar.count / barTotal) * 100}%` }} />
              </div>
            </div>
          ))}

          {stats.totalCommission > 0 && (
            <div className="pt-2 border-t text-sm flex justify-between">
              <span className="text-muted-foreground">Totale provvigioni maturate</span>
              <span className="font-semibold">€ {stats.totalCommission.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotes list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Preventivi ({quotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nessun preventivo assegnato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Progetto</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map(q => {
                  const sl = statusLabel(q.status);
                  return (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs">{q.quote_number || '-'}</TableCell>
                      <TableCell>{q.project_name || '-'}</TableCell>
                      <TableCell>€ {q.total_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell><Badge variant={sl.variant}>{sl.label}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(q.created_at).toLocaleDateString('it-IT')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalespersonDetail;
