import { useMemo, useState } from 'react';
import { useToolSettings } from '@/hooks/useToolSettings';
import { kronosProducts, kronosCollections, KronosCollection } from '@/data/strumenti/kronosProducts';
import { ToolPageHeader, ToolCard, StatTile, SliderRow, fmtEur, fmtPct } from './_shared';

interface S {
  scontoFornitore: number;
  markup: number;
}
const defaults: S = { scontoFornitore: 64, markup: 70 };

export default function PricingKronos() {
  const { settings, update } = useToolSettings<S>('pricing_kronos', defaults);
  const coeff = 1 - settings.scontoFornitore / 100;
  const [filter, setFilter] = useState<KronosCollection | 'Tutte'>('Tutte');
  const [selected, setSelected] = useState<string | null>(null);
  const [mq, setMq] = useState(50);
  const [sfrido, setSfrido] = useState(10);
  const [scontoCliente, setScontoCliente] = useState(0);
  const [mlBattiscopa, setMlBattiscopa] = useState(30);

  const rows = useMemo(() => {
    return kronosProducts
      .filter((p) => filter === 'Tutte' || p.collection === filter)
      .map((p) => {
        const tuoCosto = p.listPrice * coeff;
        const tuoPrezzo = tuoCosto * (1 + settings.markup / 100);
        const margine = tuoPrezzo > 0 ? ((tuoPrezzo - tuoCosto) / tuoPrezzo) * 100 : 0;
        return { ...p, tuoCosto, tuoPrezzo, margine, scontoMax: margine };
      });
  }, [coeff, settings.markup, filter]);

  const sel = rows.find((r) => r.code === selected) || rows[0];

  const mqEff = mq * (1 + sfrido / 100);
  const baseProdotto = sel ? sel.tuoPrezzo * mqEff : 0;
  const baseBattiscopaPrezzo = sel?.skirtingPrice
    ? sel.skirtingPrice * (1 - settings.scontoFornitore / 100) * (1 + settings.markup / 100) * mlBattiscopa
    : 0;
  const lordo = baseProdotto + baseBattiscopaPrezzo;
  const totale = lordo * (1 - scontoCliente / 100);
  const costo = sel ? sel.tuoCosto * mqEff + (sel.skirtingPrice ?? 0) * coeff * mlBattiscopa : 0;
  const margine = totale - costo;
  const marginePct = totale > 0 ? (margine / totale) * 100 : 0;

  return (
    <div>
      <ToolPageHeader title="Pricing Kronos" subtitle="Listino Kronos 2026 con filtro collezione e calcolo battiscopa." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <ToolCard title="Parametri">
          <SliderRow label="Sconto fornitore" value={settings.scontoFornitore} min={0} max={85} suffix="%" onChange={(v) => update({ scontoFornitore: v })} />
          <SliderRow label="Markup Kalēa" value={settings.markup} min={0} max={200} suffix="%" onChange={(v) => update({ markup: v })} />
          <div className="text-[12px] mt-2" style={{ color: '#8A7060' }}>
            Coefficiente costo: {coeff.toFixed(3)} · default 50+20+10 ≈ 0,360
          </div>
        </ToolCard>
        <ToolCard title="Filtra collezione">
          <div className="flex flex-wrap gap-2">
            {(['Tutte', ...kronosCollections] as const).map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c as any)}
                  className="px-3 py-1.5 rounded-full text-[12px] border transition-colors"
                  style={{
                    borderColor: active ? '#C8A96E' : 'rgba(59,35,20,0.15)',
                    background: active ? 'rgba(200,169,110,0.15)' : 'transparent',
                    color: active ? '#3B2314' : '#8A7060',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </ToolCard>
      </div>

      <ToolCard title={`Listino · ${rows.length} prodotti`} className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ color: '#8A7060' }} className="text-left text-[11px] uppercase tracking-[0.08em]">
                <th className="py-2 pr-3">Codice</th>
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">Collezione</th>
                <th className="py-2 pr-3 text-right">Listino</th>
                <th className="py-2 pr-3 text-right">Costo</th>
                <th className="py-2 pr-3 text-right">Prezzo</th>
                <th className="py-2 pr-3 text-right">Margine</th>
                <th className="py-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code} className="border-t" style={{ borderColor: 'rgba(59,35,20,0.06)', color: '#3B2314' }}>
                  <td className="py-2 pr-3 font-mono text-[12px]">{r.code}</td>
                  <td className="py-2 pr-3">{r.name}</td>
                  <td className="py-2 pr-3 text-[12px]" style={{ color: '#8A7060' }}>{r.collection}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{fmtEur(r.listPrice)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{fmtEur(r.tuoCosto)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmtEur(r.tuoPrezzo)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums" style={{ color: '#3F7A4E' }}>{fmtPct(r.margine)}</td>
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
          <SliderRow label="Ml battiscopa" value={mlBattiscopa} min={0} max={300} suffix="ml" onChange={setMlBattiscopa} />
          <SliderRow label="Sconto cliente" value={scontoCliente} min={0} max={50} suffix="%" onChange={setScontoCliente} />
        </ToolCard>
        <div className="grid grid-cols-2 gap-4">
          <StatTile label="Totale cliente" value={fmtEur(totale)} accent="gold" />
          <StatTile label="Costo" value={fmtEur(costo)} />
          <StatTile label="Margine" value={`${fmtEur(margine)} · ${fmtPct(marginePct)}`} accent={marginePct > 30 ? 'green' : marginePct > 0 ? 'gold' : 'red'} />
          <StatTile label="Battiscopa incluso" value={fmtEur(baseBattiscopaPrezzo)} hint={sel?.skirtingPrice ? `${fmtEur(sel.skirtingPrice)}/ml listino` : 'prezzo non impostato'} />
        </div>
      </div>
    </div>
  );
}
