import { useToolSettings } from '@/hooks/useToolSettings';
import {
  ToolPageHeader,
  ToolCard,
  StatTile,
  SliderRow,
  fmtEur,
  fmtPct,
} from './_shared';

interface S {
  costoOperaio: number;
  commercialista: number;
  tools: number;
  ads: number;
  affitto: number;
  assicurazioni: number;
  varie: number;
  soci: number;
  mqFornitura: number;
  mqPosa: number;
  markupMateriali: number; // %
  prezzoPosa: number; // €/mq
  costoMaterialeMedio: number; // €/mq
}

const defaults: S = {
  costoOperaio: 3300,
  commercialista: 250,
  tools: 200,
  ads: 1500,
  affitto: 800,
  assicurazioni: 200,
  varie: 300,
  soci: 2500,
  mqFornitura: 200,
  mqPosa: 80,
  markupMateriali: 60,
  prezzoPosa: 35,
  costoMaterialeMedio: 25,
};

export default function Sostenibilita() {
  const { settings: s, update } = useToolSettings<S>('sostenibilita', defaults);

  const costiFissi =
    s.costoOperaio +
    s.commercialista +
    s.tools +
    s.ads +
    s.affitto +
    s.assicurazioni +
    s.varie +
    s.soci;

  const calcScenario = (volMul: number) => {
    const mqF = s.mqFornitura * volMul;
    const mqP = s.mqPosa * volMul;
    const ricaviMateriali =
      mqF * s.costoMaterialeMedio * (1 + s.markupMateriali / 100);
    const ricaviPosa = mqP * s.prezzoPosa;
    const ricavi = ricaviMateriali + ricaviPosa;
    const cogs = mqF * s.costoMaterialeMedio;
    const margineLordo = ricavi - cogs;
    const utile = margineLordo - costiFissi;
    const accantonamento = utile > 0 ? utile * 0.15 : 0;
    const netto = utile - accantonamento;
    return { ricavi, cogs, margineLordo, utile, accantonamento, netto };
  };

  const prudente = calcScenario(0.8);
  const realistico = calcScenario(1);
  const ottimistico = calcScenario(1.2);

  // Markup minimo per coprire costi fissi (a parità di volumi realistici)
  const cogs = s.mqFornitura * s.costoMaterialeMedio;
  const ricaviPosa = s.mqPosa * s.prezzoPosa;
  const needFromMateriali = costiFissi - (ricaviPosa - 0) + 0; // serve da materiali per pareggiare
  const markupMinimo = cogs > 0 ? (needFromMateriali / cogs) * 100 : 0;
  const markupTarget = markupMinimo + 20;
  const markupSano = markupMinimo + 40;

  return (
    <div>
      <ToolPageHeader
        title="Sostenibilità"
        subtitle="Conto economico mensile, scenari di volume e markup di sopravvivenza."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ToolCard title="Costi fissi mensili">
          <SliderRow label="Operaio (costo azienda)" value={s.costoOperaio} min={0} max={6000} step={50} onChange={(v) => update({ costoOperaio: v })} />
          <SliderRow label="Commercialista" value={s.commercialista} min={0} max={1000} step={10} onChange={(v) => update({ commercialista: v })} />
          <SliderRow label="Tools / SaaS" value={s.tools} min={0} max={1000} step={10} onChange={(v) => update({ tools: v })} />
          <SliderRow label="Advertising" value={s.ads} min={0} max={10000} step={50} onChange={(v) => update({ ads: v })} />
          <SliderRow label="Affitto" value={s.affitto} min={0} max={3000} step={50} onChange={(v) => update({ affitto: v })} />
          <SliderRow label="Assicurazioni" value={s.assicurazioni} min={0} max={1000} step={10} onChange={(v) => update({ assicurazioni: v })} />
          <SliderRow label="Varie" value={s.varie} min={0} max={2000} step={50} onChange={(v) => update({ varie: v })} />
          <SliderRow label="Compenso soci" value={s.soci} min={0} max={10000} step={100} onChange={(v) => update({ soci: v })} />
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(59,35,20,0.08)' }}>
            <div className="flex justify-between text-[14px]" style={{ color: '#3B2314' }}>
              <span className="font-medium">Totale costi fissi</span>
              <span className="font-heading">{fmtEur(costiFissi)}</span>
            </div>
          </div>
        </ToolCard>

        <ToolCard title="Volumi e pricing">
          <SliderRow label="Mq fornitura/mese" value={s.mqFornitura} min={0} max={2000} step={10} suffix="mq" onChange={(v) => update({ mqFornitura: v })} />
          <SliderRow label="Mq posa/mese" value={s.mqPosa} min={0} max={1000} step={5} suffix="mq" onChange={(v) => update({ mqPosa: v })} />
          <SliderRow label="Markup materiali" value={s.markupMateriali} min={0} max={200} suffix="%" onChange={(v) => update({ markupMateriali: v })} />
          <SliderRow label="Prezzo posa" value={s.prezzoPosa} min={0} max={120} onChange={(v) => update({ prezzoPosa: v })} />
          <SliderRow label="Costo materiale medio (al mq)" value={s.costoMaterialeMedio} min={0} max={200} onChange={(v) => update({ costoMaterialeMedio: v })} />
        </ToolCard>
      </div>

      <h2 className="font-heading text-[18px] mt-8 mb-3" style={{ color: '#3B2314' }}>Scenari</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          ['Prudente (−20% volumi)', prudente, 'red' as const],
          ['Realistico', realistico, 'gold' as const],
          ['Ottimistico (+20% volumi)', ottimistico, 'green' as const],
        ]).map(([label, sc, accent]) => (
          <div key={label as string} className="rounded-lg border bg-white p-5" style={{ borderColor: 'rgba(59,35,20,0.10)' }}>
            <div className="text-[12px] uppercase tracking-[0.12em] mb-3" style={{ color: '#8A7060' }}>{label as string}</div>
            <Row k="Ricavi" v={fmtEur((sc as any).ricavi)} />
            <Row k="COGS" v={fmtEur((sc as any).cogs)} />
            <Row k="Margine lordo" v={fmtEur((sc as any).margineLordo)} />
            <Row k="− Costi fissi" v={fmtEur(-costiFissi)} />
            <Row k="Utile lordo" v={fmtEur((sc as any).utile)} bold accent={accent as any} />
            <Row k="Accantonamento 15%" v={fmtEur(-(sc as any).accantonamento)} />
            <Row k="Netto disponibile" v={fmtEur((sc as any).netto)} bold />
          </div>
        ))}
      </div>

      <h2 className="font-heading text-[18px] mt-8 mb-3" style={{ color: '#3B2314' }}>Markup consigliato sui materiali</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile label="Minimo (break-even)" value={fmtPct(Math.max(0, markupMinimo))} accent="red" hint="copre solo i costi fissi" />
        <StatTile label="Target" value={fmtPct(Math.max(0, markupTarget))} accent="gold" hint="+20% sopra il minimo" />
        <StatTile label="Sano" value={fmtPct(Math.max(0, markupSano))} accent="green" hint="+40% per crescita e riserve" />
      </div>
    </div>
  );
}

function Row({ k, v, bold, accent }: { k: string; v: string; bold?: boolean; accent?: 'gold' | 'green' | 'red' }) {
  const color = accent === 'gold' ? '#C8A96E' : accent === 'green' ? '#3F7A4E' : accent === 'red' ? '#A8443C' : '#3B2314';
  return (
    <div className="flex justify-between py-1 text-[13px]" style={{ color: bold ? color : '#3B2314' }}>
      <span style={{ color: bold ? color : '#8A7060' }}>{k}</span>
      <span className={`tabular-nums ${bold ? 'font-medium' : ''}`}>{v}</span>
    </div>
  );
}
