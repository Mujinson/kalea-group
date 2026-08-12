import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/admin/crm-ui';
import { DataTable } from '@/components/admin/DataTable';
import { useScadenzario, ScadenzaRow } from '@/hooks/useScadenzario';
import { fmtEur, fmtDateIt, daysUntil } from '@/lib/finance';
import { AlertTriangle, CalendarClock } from 'lucide-react';

const originTone = (o: ScadenzaRow['origin']) =>
  o === 'Fattura fornitore' ? 'purple' : o === 'Costo fisso' ? 'slate' : 'teal';

export function ScadenzarioTable({ compact = false, limit }: { compact?: boolean; limit?: number }) {
  const { data, isLoading } = useScadenzario();
  const rows = useMemo(() => (limit ? (data || []).slice(0, limit) : data || []), [data, limit]);

  const next30 = useMemo(
    () => (data || []).filter((r) => {
      const d = daysUntil(r.date);
      return d !== null && d <= 30;
    }).reduce((s, r) => s + r.amount, 0),
    [data],
  );
  const overdue = useMemo(
    () => (data || []).filter((r) => (daysUntil(r.date) ?? 0) < 0).reduce((s, r) => s + r.amount, 0),
    [data],
  );

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> In uscita nei prossimi 30 giorni</p>
              <p className="text-xl font-bold">{fmtEur(next30)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Già scaduto</p>
              <p className="text-xl font-bold text-red-600">{fmtEur(overdue)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        data={rows}
        loading={isLoading}
        searchable={!compact}
        pageSize={compact ? 8 : 25}
        searchPlaceholder="Cerca scadenza…"
        searchKeys={['who', 'what', 'origin']}
        emptyTitle="Nessuna scadenza"
        emptyDescription="Non ci sono pagamenti in scadenza."
        columns={[
          {
            key: 'date',
            header: 'Data',
            sortable: true,
            cell: (r) => {
              const d = daysUntil(r.date);
              const late = d !== null && d < 0;
              return <span className={late ? 'font-semibold text-red-600' : ''}>{fmtDateIt(r.date)}</span>;
            },
          },
          { key: 'who', header: 'A chi', sortable: true },
          { key: 'what', header: 'Cosa', sortable: true },
          {
            key: 'origin',
            header: 'Origine',
            cell: (r) => <StatusPill size="sm" tone={originTone(r.origin) as any}>{r.origin}</StatusPill>,
          },
          {
            key: 'amount',
            header: 'Importo',
            sortable: true,
            className: 'text-right font-semibold',
            accessor: (r) => r.amount,
            cell: (r) => fmtEur(r.amount),
          },
        ]}
      />

      {compact && (
        <div className="text-right">
          <Link to="/admin/costi" className="text-[12px] font-medium text-crm-primary hover:underline">
            Vedi scadenzario completo →
          </Link>
        </div>
      )}
    </div>
  );
}

export default ScadenzarioTable;
