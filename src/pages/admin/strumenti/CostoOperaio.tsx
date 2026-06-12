import { useToolSettings } from '@/hooks/useToolSettings';
import {
  ToolPageHeader,
  ToolCard,
  StatTile,
  SliderRow,
  fmtEur,
} from './_shared';

interface S {
  nettoMensile: number;
  giorniLavorativi: number;
  pasto: number;
  furgone: number;
  telepass: number;
  trasferta: number;
  albergo: number;
  mqGiornoBase: number; // posa media mq/giorno
}

const defaults: S = {
  nettoMensile: 1800,
  giorniLavorativi: 22,
  pasto: 12,
  furgone: 350,
  telepass: 80,
  trasferta: 20,
  albergo: 0,
  mqGiornoBase: 25,
};

// Coefficiente lordo da netto (semplificato, INPS + IRPEF ~60% sopra-netto)
const NETTO_TO_LORDO_AZIENDA = 1.85;

export default function CostoOperaio() {
  const { settings, update } = useToolSettings<S>('costo_operaio', defaults);

  const stipendioAziendaMensile =
    settings.nettoMensile * NETTO_TO_LORDO_AZIENDA;
  const costiAccessoriMensili =
    settings.pasto * settings.giorniLavorativi +
    settings.furgone +
    settings.telepass +
    settings.trasferta * settings.giorniLavorativi +
    settings.albergo;

  const costoMese = stipendioAziendaMensile + costiAccessoriMensili;
  const costoAnno = costoMese * 12;
  const costoGiorno =
    settings.giorniLavorativi > 0 ? costoMese / settings.giorniLavorativi : 0;
  const costoOra = costoGiorno / 8;

  const costoMq = settings.mqGiornoBase > 0 ? costoGiorno / settings.mqGiornoBase : 0;
  const breakEven = costoMq;
  const target = costoMq * 1.5;
  const premium = costoMq * 2;

  return (
    <div>
      <ToolPageHeader
        title="Costo Operaio"
        subtitle="Calcola il costo aziendale reale di un operaio e il prezzo di posa al mq."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ToolCard title="Retribuzione e giorni">
          <SliderRow
            label="Netto mensile"
            value={settings.nettoMensile}
            min={1200}
            max={3500}
            step={50}
            onChange={(v) => update({ nettoMensile: v })}
          />
          <SliderRow
            label="Giorni lavorativi/mese"
            value={settings.giorniLavorativi}
            min={15}
            max={26}
            suffix="gg"
            onChange={(v) => update({ giorniLavorativi: v })}
          />
          <SliderRow
            label="Mq medi posati/giorno"
            value={settings.mqGiornoBase}
            min={10}
            max={60}
            suffix="mq"
            onChange={(v) => update({ mqGiornoBase: v })}
          />
        </ToolCard>

        <ToolCard title="Costi accessori">
          <SliderRow
            label="Pasto (al giorno)"
            value={settings.pasto}
            min={0}
            max={30}
            onChange={(v) => update({ pasto: v })}
          />
          <SliderRow
            label="Furgone (mese)"
            value={settings.furgone}
            min={0}
            max={1000}
            step={10}
            onChange={(v) => update({ furgone: v })}
          />
          <SliderRow
            label="Telepass (mese)"
            value={settings.telepass}
            min={0}
            max={500}
            step={10}
            onChange={(v) => update({ telepass: v })}
          />
          <SliderRow
            label="Trasferta (al giorno)"
            value={settings.trasferta}
            min={0}
            max={80}
            onChange={(v) => update({ trasferta: v })}
          />
          <SliderRow
            label="Albergo (mese)"
            value={settings.albergo}
            min={0}
            max={2000}
            step={50}
            onChange={(v) => update({ albergo: v })}
          />
        </ToolCard>
      </div>

      <h2
        className="font-heading text-[18px] mt-8 mb-3"
        style={{ color: '#3B2314' }}
      >
        Costo aziendale
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Mese" value={fmtEur(costoMese)} />
        <StatTile label="Anno" value={fmtEur(costoAnno)} />
        <StatTile label="Giorno" value={fmtEur(costoGiorno)} />
        <StatTile label="Ora" value={fmtEur(costoOra)} />
      </div>

      <h2
        className="font-heading text-[18px] mt-8 mb-3"
        style={{ color: '#3B2314' }}
      >
        Pricing posa (€/mq)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile
          label="Break-even"
          value={fmtEur(breakEven)}
          hint="Costo puro, nessun margine"
          accent="red"
        />
        <StatTile
          label="Target"
          value={fmtEur(target)}
          hint="+50% margine consigliato"
          accent="gold"
        />
        <StatTile
          label="Premium"
          value={fmtEur(premium)}
          hint="+100% per posa complessa"
          accent="green"
        />
      </div>
    </div>
  );
}
