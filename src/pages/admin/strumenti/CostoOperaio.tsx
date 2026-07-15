import { useToolSettings } from '@/hooks/useToolSettings';
import { Slider as UISlider } from '@/components/ui/slider';

// ─── HELPERS ─────────────────────────────────────────────────
const fmt = (n: number) => '€ ' + Math.round(n).toLocaleString('it-IT');
const fmt2 = (n: number) =>
  '€ ' + n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtP = (n: number) => n.toFixed(1) + '%';

// ─── SLIDER ROW ──────────────────────────────────────────────
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
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#6B6860' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{format(value)}</span>
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
    <div
      style={{
        background: '#F1F5F9',
        borderRadius: 10,
        padding: '14px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, color: '#6B6860', marginBottom: 6, lineHeight: 1.4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 300, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9A9890', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 0',
        borderBottom: '0.5px solid #E0DDD8',
        fontSize: 13,
      }}
    >
      <span style={{ color: '#6B6860' }}>{label}</span>
      <span
        style={{
          fontWeight: 500,
          fontSize: highlight ? 15 : 13,
          color: color || (highlight ? '#0C447C' : '#1A1A1A'),
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PriceRow({
  scenario,
  price,
  margin,
  note,
  bg,
  color,
}: {
  scenario: string;
  price: string;
  margin: string;
  note: string;
  bg: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 120px 80px 1fr',
        gap: 12,
        padding: '10px 14px',
        background: bg,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500, color }}>{scenario}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color, textAlign: 'right' }}>{price}</span>
      <span style={{ fontSize: 12, color, textAlign: 'center' }}>{margin}</span>
      <span style={{ fontSize: 12, color, opacity: 0.75 }}>{note}</span>
    </div>
  );
}

interface S {
  netto: number;
  giorni: number;
  pasto: number;
  furgone: number;
  telepass: number;
  trasfertaGg: number;
  hotel: number;
  mqGg: number;
  margineTarget: number;
}

const defaults: S = {
  netto: 2000,
  giorni: 21,
  pasto: 10,
  furgone: 600,
  telepass: 80,
  trasfertaGg: 3,
  hotel: 90,
  mqGg: 12,
  margineTarget: 30,
};

export default function CostoOperaio() {
  const { settings: s, update } = useToolSettings<S>('costo_operaio', defaults);

  // ── Calcoli CCNL Edilizia ──
  const lordo = s.netto / 0.72;
  const contrib = lordo * 0.3;
  const ferie = lordo * 0.085;
  const gratifica = lordo * 0.1;
  const tfr = lordo * 0.0691;
  const cassaEdile = lordo * 0.042;
  const studioPaghe = 100;
  const subtotLavoro =
    lordo + contrib + ferie + gratifica + tfr + cassaEdile + studioPaghe;

  const costiPasti = s.pasto * s.giorni;
  const costiHotel = s.hotel * s.trasfertaGg;
  const subtotOp = costiPasti + s.furgone + s.telepass + costiHotel;

  const totMese = subtotLavoro + subtotOp;
  const totAnno = totMese * 12;
  const costoGg = totMese / s.giorni;
  const costoOra = costoGg / 8;

  // ── Pricing posa ──
  const costoMqPosa = costoGg / s.mqGg;
  const pMin = costoMqPosa;
  const pLow = costoMqPosa / 0.85;
  const pTarget = costoMqPosa / (1 - s.margineTarget / 100);
  const pPremium = costoMqPosa / 0.5;

  const costoGgTrasferta = costoGg + s.hotel;
  const suppTrasferta = costoGgTrasferta / s.mqGg - costoMqPosa;

  return (
    <div
      style={{
        fontFamily:
          "'new-order', 'New Order', sans-serif",
        color: '#1A1A1A',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '28px 20px',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: '#1A1A2E', marginBottom: 4 }}>
          Costo Reale Operaio
        </h1>
        <p style={{ fontSize: 13, color: '#9A9890' }}>
          CCNL Edilizia Artigianato · Aggiorna gli slider per ricalcolare in tempo reale
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard label="Costo aziendale / anno" value={fmt(totAnno)} color="#0C447C" />
        <MetricCard label="Costo aziendale / mese" value={fmt(totMese)} color="#0C447C" />
        <MetricCard label="Costo reale / giorno" value={fmt(costoGg)} color="#633806" />
        <MetricCard label="Costo reale / ora (8h)" value={fmt(costoOra)} color="#633806" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #E0DDD8',
            borderRadius: 12,
            padding: '20px 24px',
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
            Parametri retributivi & operativi
          </div>

          <Slider
            label="Netto mensile target"
            min={1500}
            max={4000}
            value={s.netto}
            step={50}
            onChange={(v) => update({ netto: v })}
            format={(v) => '€ ' + v.toLocaleString('it-IT')}
          />
          <Slider
            label="Giorni lavorativi / mese"
            min={18}
            max={23}
            value={s.giorni}
            step={1}
            onChange={(v) => update({ giorni: v })}
            format={(v) => v + ' giorni'}
          />

          <div style={{ height: 1, background: '#E0DDD8', margin: '12px 0' }} />
          <div
            style={{
              fontSize: 11,
              color: '#9A9890',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              marginBottom: 10,
            }}
          >
            Costi operativi
          </div>

          <Slider
            label="Pasto / giorno"
            min={0}
            max={25}
            value={s.pasto}
            step={1}
            onChange={(v) => update({ pasto: v })}
            format={(v) => '€ ' + v}
          />
          <Slider
            label="Furgone + carburante / mese"
            min={200}
            max={1500}
            value={s.furgone}
            step={50}
            onChange={(v) => update({ furgone: v })}
            format={(v) => '€ ' + v.toLocaleString('it-IT')}
          />
          <Slider
            label="Telepass / pedaggi / mese"
            min={0}
            max={400}
            value={s.telepass}
            step={10}
            onChange={(v) => update({ telepass: v })}
            format={(v) => '€ ' + v}
          />

          <div style={{ height: 1, background: '#E0DDD8', margin: '12px 0' }} />
          <div
            style={{
              fontSize: 11,
              color: '#9A9890',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              marginBottom: 10,
            }}
          >
            Trasferta (oltre 150 km)
          </div>

          <Slider
            label="Giorni trasferta / mese"
            min={0}
            max={15}
            value={s.trasfertaGg}
            step={1}
            onChange={(v) => update({ trasfertaGg: v })}
            format={(v) => v + ' gg'}
          />
          <Slider
            label="Albergo max / notte"
            min={50}
            max={200}
            value={s.hotel}
            step={5}
            onChange={(v) => update({ hotel: v })}
            format={(v) => '€ ' + v}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #E0DDD8',
              borderRadius: 12,
              padding: '20px 24px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#9A9890',
                textTransform: 'uppercase',
                letterSpacing: '.07em',
                marginBottom: 14,
                paddingBottom: 10,
                borderBottom: '1px solid #E0DDD8',
              }}
            >
              Costo lavoro mensile — CCNL Edilizia
            </div>
            <DetailRow label="Retribuzione lorda stimata" value={fmt(lordo)} />
            <DetailRow label="Contributi datore (≈30%)" value={fmt(contrib)} />
            <DetailRow
              label="Accantonamento ferie (8,5% — Cassa Ed.)"
              value={fmt(ferie)}
            />
            <DetailRow
              label="Accantonamento gratifica natalizia (10%)"
              value={fmt(gratifica)}
            />
            <DetailRow label="TFR (≈6,91% lordo/12)" value={fmt(tfr)} />
            <DetailRow label="Quota Cassa Edile datore (≈4,2%)" value={fmt(cassaEdile)} />
            <DetailRow label="Studio paghe" value="€ 100" />
            <div style={{ height: 1, background: '#E0DDD8', margin: '8px 0' }} />
            <DetailRow
              label="Subtotale costo lavoro"
              value={fmt(subtotLavoro)}
              highlight
              color="#0C447C"
            />
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #E0DDD8',
              borderRadius: 12,
              padding: '20px 24px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#9A9890',
                textTransform: 'uppercase',
                letterSpacing: '.07em',
                marginBottom: 14,
                paddingBottom: 10,
                borderBottom: '1px solid #E0DDD8',
              }}
            >
              Costi operativi mensili
            </div>
            <DetailRow label={`Pasti (€${s.pasto}/gg × ${s.giorni} gg)`} value={fmt(costiPasti)} />
            <DetailRow label="Furgone + carburante" value={fmt(s.furgone)} />
            <DetailRow label="Telepass / pedaggi" value={fmt(s.telepass)} />
            <DetailRow
              label={`Albergo trasferta (${s.trasfertaGg} notti)`}
              value={fmt(costiHotel)}
            />
            <div style={{ height: 1, background: '#E0DDD8', margin: '8px 0' }} />
            <DetailRow label="Subtotale operativi" value={fmt(subtotOp)} highlight color="#0C447C" />
            <div style={{ height: 1, background: '#E0DDD8', margin: '8px 0' }} />
            <DetailRow label="TOTALE MENSILE" value={fmt(totMese)} highlight color="#0C447C" />
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #E0DDD8',
          borderRadius: 12,
          padding: '20px 24px',
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
          Motore di pricing posa — soglie di prezzo al mq
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            marginBottom: 16,
          }}
        >
          <div>
            <Slider
              label="mq posati / giorno (produttività)"
              min={4}
              max={35}
              value={s.mqGg}
              step={1}
              onChange={(v) => update({ mqGg: v })}
              format={(v) => v + ' mq/gg'}
            />
            <Slider
              label="Margine target sulla posa (%)"
              min={10}
              max={60}
              value={s.margineTarget}
              step={5}
              onChange={(v) => update({ margineTarget: v })}
              format={(v) => v + '%'}
            />
            <div style={{ fontSize: 12, color: '#9A9890', lineHeight: 1.7, marginTop: 8 }}>
              SPC: 35–45 mq/gg &nbsp;·&nbsp; Ceramica: 10–15 mq/gg &nbsp;·&nbsp; Parquet: 15–25
              mq/gg &nbsp;·&nbsp; Resina: 8–12 mq/gg
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <PriceRow
              scenario="Break-even"
              price={fmt2(pMin)}
              margin="0%"
              note="Non scendere mai sotto"
              bg="#FCEBEB"
              color="#A32D2D"
            />
            <PriceRow
              scenario="Minimo accettabile"
              price={fmt2(pLow)}
              margin="15%"
              note="Solo per clienti strategici"
              bg="#FAEEDA"
              color="#633806"
            />
            <PriceRow
              scenario={`Target (${s.margineTarget}%)`}
              price={fmt2(pTarget)}
              margin={fmtP(s.margineTarget)}
              note="Preventivi standard"
              bg="#E6F1FB"
              color="#0C447C"
            />
            <PriceRow
              scenario="Premium / complesso"
              price={fmt2(pPremium)}
              margin="50%"
              note="Lavori difficili o trasferta"
              bg="#EAF3DE"
              color="#27500A"
            />
          </div>
        </div>

        <div
          style={{
            background: '#FAEEDA',
            border: '1px solid #EF9F27',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: '#633806',
            lineHeight: 1.6,
          }}
        >
          <strong>Trasferta (oltre 150 km):</strong> il costo/giorno sale a{' '}
          <strong>{fmt(costoGgTrasferta)}</strong>. Supplemento posa consigliato:{' '}
          <strong>+{fmt2(suppTrasferta)}/mq</strong> oppure voce separata "spese trasferta" nel
          preventivo.
        </div>
      </div>
    </div>
  );
}
