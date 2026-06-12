import { useMemo, useState } from 'react';
import { useToolSettings } from '@/hooks/useToolSettings';
import { flowProducts } from '@/data/strumenti/flowProducts';
import { ToolPageHeader, ToolCard, StatTile, SliderRow, fmtEur, fmtPct } from './_shared';

interface S {
  scontoFornitore: number; // % cumulato (es. 55 = 50+10)
  markup: number; // % markup Kalēa
}

const defaults: S = { scontoFornitore: 55, markup: 60 };

export default function PricingFlow() {
  const { settings, update } = useToolSettings<S>('pricing_flow', defaults);
  const coeff = (1 - settings.scontoFornitore / 100);
  const [selected, setSelected] = useState<string | null>(null);
  const [mq, setMq] = useState(50);
  const [sfrido, setSfrido] = useState(10);
  const [scontoCliente, setScontoCliente] = useState(0);

  const rows = useMemo(
    () =>
      flowProducts.map((p) => {
        const tuoCosto = p.listPrice * coeff;
        const tuoPrezzo = tuoCosto * (1 + settings.markup / 100);
        const margine = tuoPrezzo > 0 ? ((tuoPrezzo - tuoCosto) / tuoPrezzo) * 100 : 0;
        const scontoMax = tuoPrezzo > 0 ? ((tuoPrezzo - tuoCosto) / tuoPrezzo) * 100 : 0;
        return { ...p, tuoCosto, tuoPrezzo, margine, scontoMax };
      }),
    [coeff, settings.markup],
  );

  const sel = rows.find((r) => r.code === selected) || rows[0];

  const mqEff = mq * (1 + sfrido / 100);
  const totaleLordo = sel ? sel.tuoPrezzo * mqEff : 0;
  const totale = totaleLordo * (1 - scontoCliente / 100);
  const costo = sel ? sel.tuoCosto * mqEff : 0;
  const margineAss = totale - costo;
  const marginePct = totale > 0 ? (margineAss / totale) * 100 : 0;
  const breakEven = sel && sel.tuoPrezzo > 0
    ? (1 - sel.tuoCosto / sel.tuoPrezzo) * 100
    : 0;

  return (
    <div>
      <ToolPageHeader title="Pricing Flow" subtitle="Listino Flow 2025 con sconto fornitore e markup Kalēa." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <ToolCard title="Parametri">
          <SliderRow label="Sconto fornitore" value={settings.scontoFornitore} min={0} max={80} suffix="%" onChange={(v) => update({ scontoFornitore: v })} />
          <SliderRow label="Markup Kalēa" value={settings.markup} min={0} max={150} suffix="%" onChange={(v) => update({ markup: v })} />
          <div className="text-[12px] mt-2" style={{ color: '#8A7060' }}>
            Coefficiente costo: {coeff.toFixed(3)} · es. listino 100 € → tuo costo {fmtEur(100 * coeff)}
          </div>
        </ToolCard>
        <ToolCard title="Riepilogo listino">
          {rows.length === 0 ? (
            <div className="text-[13px]" style={{ color: '#8A7060' }}>
              Dataset prodotti non ancora caricato. Incolla il JSON Flow per popolare la tabella.
            </div>
          ) : (
            <div className="text-[13px]" style={{ color: '#3B2314' }}>
              {rows.length} prodotti · prezzo medio {fmtEur(rows.reduce((s, r) => s + r.tuoPrezzo, 0) / rows.length)}
            </div>
          )}
        </ToolCard>
      </div>

      <ToolCard title="Listino" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ color: '#8A7060' }} className="text-left text-[11px] uppercase tracking-[0.08em]">
                <th className="py-2 pr-3">Codice</th>
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3 text-right">Listino</th>
                <th className="py-2 pr-3 text-right">Tuo costo</th>
                <th className="py-2 pr-3 text-right">Tuo prezzo</th>
                <th className="py-2 pr-3 text-right">Margine</th>
                <th className="py-2 pr-3 text-right">Sconto max</th>
                <th className="py-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code} className="border-t" style={{ borderColor: 'rgba(59,35,20,0.06)', color: '#3B2314' }}>
                  <td className="py-2 pr-3 font-mono text-[12px]">{r.code}</td>
                  <td className="py-2 pr-3">{r.name}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{fmtEur(r.listPrice)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{fmtEur(r.tuoCosto)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmtEur(r.tuoPrezzo)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums" style={{ color: '#3F7A4E' }}>{fmtPct(r.margine)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums" style={{ color: '#C8A96E' }}>{fmtPct(r.scontoMax)}</td>
                  <td className="py-2 pr-3 text-right">
                    <button
                      onClick={() => setSelected(r.code)}
                      className="text-[12px] px-2 py-1 rounded border"
                      style={{ borderColor: 'rgba(59,35,20,0.15)', color: '#3B2314' }}
                    >
                      Usa
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center" style={{ color: '#8A7060' }}>Nessun prodotto caricato.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ToolCard>

      <h2 className="font-heading text-[18px] mb-3" style={{ color: '#3B2314' }}>Calcolatore preventivo</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ToolCard title={sel ? `Prodotto: ${sel.name}` : 'Seleziona un prodotto'}>
          <SliderRow label="Mq" value={mq} min={1} max={500} suffix="mq" onChange={setMq} />
          <SliderRow label="Sfrido" value={sfrido} min={0} max={30} suffix="%" onChange={setSfrido} />
          <SliderRow label="Sconto cliente" value={scontoCliente} min={0} max={50} suffix="%" onChange={setScontoCliente} />
        </ToolCard>
        <div className="grid grid-cols-2 gap-4">
          <StatTile label="Totale cliente" value={fmtEur(totale)} accent="gold" />
          <StatTile label="Costo" value={fmtEur(costo)} />
          <StatTile label="Margine" value={`${fmtEur(margineAss)} · ${fmtPct(marginePct)}`} accent={marginePct > 30 ? 'green' : marginePct > 0 ? 'gold' : 'red'} />
          <StatTile label="Break-even sconto" value={fmtPct(breakEven)} hint="oltre vai in perdita" accent="red" />
        </div>
      </div>
    </div>
  );
}
