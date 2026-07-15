import { useToolSettings } from '@/hooks/useToolSettings';
import { Slider as UISlider } from '@/components/ui/slider';

// ─── HELPERS ─────────────────────────────────────────────────
const fmt = (n: number) => '€ ' + Math.round(n).toLocaleString('it-IT');
const fmtP = (n: number) => Math.round(n) + '%';

// ─── SUB-COMPONENTS ──────────────────────────────────────────
function Slider({
  label,
  min,
  max,
  value,
  step,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#6B6860' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{format(value)}</span>
      </div>
      <UISlider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color = '#1A1A1A',
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div style={{ background: '#F1F5F9', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#6B6860', marginBottom: 6, lineHeight: 1.4 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 300, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9A9890', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function DRow({
  label,
  value,
  color,
  big,
}: {
  label: string;
  value: string;
  color?: string;
  big?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '7px 0',
        borderBottom: '0.5px solid #E0DDD8',
        fontSize: 13,
      }}
    >
      <span style={{ color: '#6B6860' }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: big ? 15 : 13, color: color || '#1A1A1A' }}>
        {value}
      </span>
    </div>
  );
}

function ScenarioCard({
  label,
  desc,
  fatturato,
  accant,
  cfMese,
  utile,
}: {
  label: string;
  desc: string;
  fatturato: number;
  accant: number;
  cfMese: number;
  utile: number;
}) {
  const bg = utile > 2000 ? '#EAF3DE' : utile > 0 ? '#FAEEDA' : '#FCEBEB';
  const col = utile > 2000 ? '#27500A' : utile > 0 ? '#633806' : '#A32D2D';
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '16px 18px' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: col,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 11, color: col, opacity: 0.7, marginBottom: 12 }}>{desc}</div>
      <div style={{ fontSize: 12, color: col, marginBottom: 3 }}>
        Fatturato: <strong>{fmt(fatturato)}/mese</strong>
      </div>
      <div style={{ fontSize: 12, color: col, marginBottom: 3 }}>
        Accantonamento: {fmt(accant)}
      </div>
      <div style={{ fontSize: 12, color: col, marginBottom: 3 }}>Costi fissi: {fmt(cfMese)}</div>
      <div style={{ fontSize: 26, fontWeight: 300, color: col, marginTop: 10 }}>
        {fmt(utile)}
        <span style={{ fontSize: 13, fontWeight: 300 }}>/mese</span>
      </div>
      <div style={{ fontSize: 11, color: col, marginTop: 2 }}>{fmt(utile * 12)} / anno</div>
    </div>
  );
}

function MkCard({
  label,
  value,
  sub,
  bg,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  bg: string;
  color: string;
}) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color,
          textTransform: 'uppercase',
          letterSpacing: '.05em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 34, fontWeight: 300, color, margin: '8px 0 4px' }}>{value}</div>
      <div style={{ fontSize: 11, color, opacity: 0.75, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
        {sub}
      </div>
    </div>
  );
}

interface S {
  operaio: number;
  comm: number;
  tools: number;
  ads: number;
  affitto: number;
  assicur: number;
  varie: number;
  soci: number;
  mqForn: number;
  costoMat: number;
  mkMat: number;
  mqPosa: number;
  prezzoPosa: number;
  costoPosa: number;
}

const defaults: S = {
  operaio: 4500,
  comm: 333,
  tools: 100,
  ads: 100,
  affitto: 0,
  assicur: 200,
  varie: 200,
  soci: 0,
  mqForn: 80,
  costoMat: 35,
  mkMat: 70,
  mqPosa: 60,
  prezzoPosa: 35,
  costoPosa: 18,
};

export default function Sostenibilita() {
  const { settings: s, update } = useToolSettings<S>('sostenibilita', defaults);

  // ── Calcoli ──
  const cfMese = s.operaio + s.comm + s.tools + s.ads + s.affitto + s.assicur + s.varie + s.soci;
  const prezzMat = s.costoMat * (1 + s.mkMat / 100);
  const ricForn = s.mqForn * prezzMat;
  const ricPosa = s.mqPosa * s.prezzoPosa;
  const fatt = ricForn + ricPosa;
  const cvMat = s.mqForn * s.costoMat;
  const cvPosa = s.mqPosa * s.costoPosa;
  const accant = fatt * 0.15;
  const utile = fatt - cvMat - cvPosa - cfMese - accant;

  const cfPerMq = s.mqForn > 0 ? cfMese / s.mqForn : 0;
  const mkMin = Math.max(0, ((s.costoMat + cfPerMq) / s.costoMat - 1) * 100);
  const mkTarget = mkMin * 1.22;
  const mkSano = mkMin * 1.48;

  const utileColor = utile > 1000 ? '#27500A' : utile > 0 ? '#633806' : '#A32D2D';

  const situazione = () => {
    if (utile > 3000)
      return {
        bg: '#EAF3DE',
        col: '#27500A',
        testo: `✓ Ottima posizione — ${fmt(utile)}/mese di utile netto dopo accantonamento.`,
      };
    if (utile > 500)
      return {
        bg: '#EAF3DE',
        col: '#27500A',
        testo: `✓ In positivo con ${fmt(utile)}/mese. Punta ad aumentare i volumi.`,
      };
    if (utile >= 0)
      return {
        bg: '#FAEEDA',
        col: '#633806',
        testo: `⚠ Quasi in pareggio (${fmt(utile)}/mese). Aumenta markup o volumi.`,
      };
    return {
      bg: '#FCEBEB',
      col: '#A32D2D',
      testo: `✗ In perdita di ${fmt(Math.abs(utile))}/mese. Rivedi i volumi minimi o riduci i costi.`,
    };
  };
  const sit = situazione();

  const zonaColor = s.mkMat >= mkSano ? '#27500A' : s.mkMat >= mkTarget ? '#633806' : '#A32D2D';
  const zonaText = s.mkMat >= mkSano ? 'sano ✓' : s.mkMat >= mkTarget ? 'target ✓' : 'sotto il minimo ⚠';

  return (
    <div
      style={{
        fontFamily: "'new-order', 'New Order', sans-serif",
        color: '#1A1A1A',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '28px 20px',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: '#1A1A2E', marginBottom: 4 }}>
          Sostenibilità Finanziaria
        </h1>
        <p style={{ fontSize: 13, color: '#9A9890' }}>
          Break-even · Markup consigliato · Scenari di crescita · Anno 1
        </p>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #E0DDD8',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#9A9890',
            textTransform: 'uppercase',
            letterSpacing: '.07em',
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: '1px solid #E0DDD8',
          }}
        >
          Costi fissi mensili
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <Slider label="Operaio — costo azienda" min={3000} max={7000} value={s.operaio} step={100} onChange={(v) => update({ operaio: v })} format={(v) => '€ ' + v.toLocaleString('it-IT')} />
            <Slider label="Commercialista (÷12)" min={150} max={700} value={s.comm} step={1} onChange={(v) => update({ comm: v })} format={(v) => '€ ' + Math.round(v)} />
            <Slider label="CRM + tools + dominio" min={50} max={500} value={s.tools} step={10} onChange={(v) => update({ tools: v })} format={(v) => '€ ' + v} />
            <Slider label="Ads / marketing" min={0} max={1000} value={s.ads} step={25} onChange={(v) => update({ ads: v })} format={(v) => '€ ' + v} />
          </div>
          <div>
            <Slider label="Affitto sede / magazzino" min={0} max={2000} value={s.affitto} step={50} onChange={(v) => update({ affitto: v })} format={(v) => '€ ' + v} />
            <Slider label="Assicurazioni (RC + furgone)" min={0} max={600} value={s.assicur} step={25} onChange={(v) => update({ assicur: v })} format={(v) => '€ ' + v} />
            <Slider label="Varie / imprevisti mensili" min={50} max={1000} value={s.varie} step={50} onChange={(v) => update({ varie: v })} format={(v) => '€ ' + v} />
            <Slider label="Stipendi soci" min={0} max={8000} value={s.soci} step={250} onChange={(v) => update({ soci: v })} format={(v) => '€ ' + v.toLocaleString('it-IT')} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <MetricCard label="Costi fissi / mese" value={fmt(cfMese)} color="#A32D2D" />
        <MetricCard label="Costi fissi / anno" value={fmt(cfMese * 12)} color="#A32D2D" />
        <MetricCard label="Accantonamento 15% / mese" sub="da mettere da parte" value={fmt(accant)} color="#633806" />
        <MetricCard label="Fabbisogno totale / mese" value={fmt(cfMese + accant)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #E0DDD8' }}>
            Volumi & pricing
          </div>
          <div style={{ fontSize: 11, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Fornitura materiali</div>
          <Slider label="mq fornitura / mese" min={10} max={600} value={s.mqForn} step={10} onChange={(v) => update({ mqForn: v })} format={(v) => v + ' mq'} />
          <Slider label="Costo acquisto materiale (€/mq)" min={10} max={100} value={s.costoMat} step={1} onChange={(v) => update({ costoMat: v })} format={(v) => '€ ' + v + '/mq'} />
          <Slider label="Markup materiali" min={20} max={150} value={s.mkMat} step={5} onChange={(v) => update({ mkMat: v })} format={(v) => v + '%'} />
          <div style={{ height: 1, background: '#E0DDD8', margin: '12px 0' }} />
          <div style={{ fontSize: 11, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Posa</div>
          <Slider label="mq posa / mese" min={0} max={400} value={s.mqPosa} step={10} onChange={(v) => update({ mqPosa: v })} format={(v) => v + ' mq'} />
          <Slider label="Prezzo posa al cliente (€/mq)" min={12} max={80} value={s.prezzoPosa} step={1} onChange={(v) => update({ prezzoPosa: v })} format={(v) => '€ ' + v + '/mq'} />
          <Slider label="Costo posa reale operaio (€/mq)" min={8} max={40} value={s.costoPosa} step={1} onChange={(v) => update({ costoPosa: v })} format={(v) => '€ ' + v + '/mq'} />
        </div>

        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #E0DDD8' }}>
            Conto economico mensile
          </div>
          <DRow label="Ricavi fornitura materiali" value={fmt(ricForn)} />
          <DRow label="Ricavi posa" value={fmt(ricPosa)} />
          <DRow label="Fatturato totale" value={fmt(fatt)} color="#0C447C" big />
          <div style={{ height: 1, background: '#E0DDD8', margin: '8px 0' }} />
          <DRow label="− Costo acquisto materiali" value={'− ' + fmt(cvMat)} color="#A32D2D" />
          <DRow label="− Costo operaio (posa)" value={'− ' + fmt(cvPosa)} color="#A32D2D" />
          <DRow label="− Costi fissi" value={'− ' + fmt(cfMese)} color="#A32D2D" />
          <DRow label="− Accantonamento 15%" value={'− ' + fmt(accant)} color="#633806" />
          <div style={{ height: 1, background: '#E0DDD8', margin: '8px 0' }} />
          <DRow label="Utile netto / mese" value={fmt(utile)} color={utileColor} big />
          <DRow label="Utile netto / anno" value={fmt(utile * 12)} color={utileColor} big />
          <div style={{ background: sit.bg, border: `1px solid ${sit.col}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: sit.col, lineHeight: 1.6, marginTop: 12 }}>
            {sit.testo}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
        <div style={{ flex: 1, height: 1, background: '#E0DDD8' }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>Scenari di crescita</span>
        <div style={{ flex: 1, height: 1, background: '#E0DDD8' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Prudente', mult: 0.6, desc: '60% dei volumi — fase avvio' },
          { label: 'Realistico', mult: 1.0, desc: 'Volumi come impostati sopra' },
          { label: 'Ottimistico', mult: 1.5, desc: '150% — mercato che risponde bene' },
        ].map((sc) => {
          const sFatt = (ricForn + ricPosa) * sc.mult;
          const sCv = (cvMat + cvPosa) * sc.mult;
          const sAccant = sFatt * 0.15;
          const sUtile = sFatt - sCv - cfMese - sAccant;
          return (
            <ScenarioCard
              key={sc.label}
              label={sc.label}
              desc={sc.desc}
              fatturato={sFatt}
              accant={sAccant}
              cfMese={cfMese}
              utile={sUtile}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
        <div style={{ flex: 1, height: 1, background: '#E0DDD8' }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>
          Markup consigliato sui materiali
        </span>
        <div style={{ flex: 1, height: 1, background: '#E0DDD8' }} />
      </div>
      <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
          <MkCard label="Markup minimo" value={fmtP(mkMin)} sub={'Copre solo i costi fissi\nbreak-even puro — nessun utile'} bg="#FCEBEB" color="#A32D2D" />
          <MkCard label="Markup target" value={fmtP(mkTarget)} sub={'Costi + accantonamento 15%\nsostenibile nel lungo periodo'} bg="#FAEEDA" color="#633806" />
          <MkCard label="Markup sano" value={fmtP(mkSano)} sub={"Costi + accantonamento + utile\nquesto è l'obiettivo"} bg="#EAF3DE" color="#27500A" />
        </div>
        <div style={{ background: '#F1F5F9', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#6B6860', lineHeight: 1.8 }}>
          Con i tuoi costi fissi di <strong style={{ color: '#1A1A1A' }}>{fmt(cfMese)}/mese</strong> e{' '}
          <strong style={{ color: '#1A1A1A' }}>{s.mqForn} mq di fornitura al mese</strong>, il markup minimo è{' '}
          <strong style={{ color: '#A32D2D' }}>{fmtP(mkMin)}</strong>. Per stare bene ti serve tra{' '}
          <strong style={{ color: '#633806' }}>{fmtP(mkTarget)}</strong> e{' '}
          <strong style={{ color: '#27500A' }}>{fmtP(mkSano)}</strong>. Il tuo markup attuale è{' '}
          <strong style={{ color: '#1A1A1A' }}>{s.mkMat}%</strong> — zona:{' '}
          <strong style={{ color: zonaColor }}>{zonaText}</strong>.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
        <div style={{ flex: 1, height: 1, background: '#E0DDD8' }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>
          Perché il 15% di accantonamento
        </span>
        <div style={{ flex: 1, height: 1, background: '#E0DDD8' }} />
      </div>
      <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 14 }}>
          {[
            {
              titolo: 'IVA trimestrale',
              testo:
                "L'IVA che incassi non è tua. Ogni 3 mesi la versi. Se non l'hai accantonata, blocchi i pagamenti fornitori.",
            },
            {
              titolo: 'IRES / IRAP / INPS annuali',
              testo:
                'Le tasse di fine anno arrivano in blocco a novembre-dicembre. Senza cuscinetto, fai un finanziamento o non paghi i fornitori.',
            },
            {
              titolo: 'Imprevisti operativi',
              testo:
                'Un cliente che paga tardi. Un errore su un cantiere. Un operaio malato 3 settimane. Senza cuscinetto, ogni imprevisto diventa una crisi.',
            },
          ].map((b) => (
            <div key={b.titolo} style={{ background: '#F1F5F9', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{b.titolo}</div>
              <div style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.7 }}>{b.testo}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#E6F1FB', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#0C447C', lineHeight: 1.7 }}>
          <strong>La regola pratica:</strong> ogni volta che incassi, prima di toccare i soldi, sposta il{' '}
          <strong>15%</strong> su un conto separato dedicato solo a tasse e imprevisti. Non toccarlo mai per altro. Dopo 6 mesi avrai un cuscinetto che ti fa dormire la notte.
        </div>
      </div>
    </div>
  );
}
