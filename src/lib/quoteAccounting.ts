// Contabilità interna preventivo: costo per voce, utile, margine, incidenza.
export interface AccRow {
  key: string;
  desc: string;
  qta: number;
  unita: string;
  supplierPrice: number; // prezzo fornitore unitario (listino)
  supplierDiscountPct: number; // sconto fornitore %
  clientUnit: number; // prezzo cliente unitario (lordo, prima dello sconto globale)
}

export interface AccExtras {
  kmEnabled: boolean; km: number; eurKm: number; // km andata + ritorno
  craneEnabled: boolean; crane: number;
  wasteEnabled: boolean; waste: number;
  rewardEnabled: boolean; rewardPct: number; // riconoscenza/provvigione % sul netto cliente
  crewEnabled: boolean; crew: number;
}

export const DEFAULT_EXTRAS: AccExtras = {
  kmEnabled: false, km: 0, eurKm: 2,
  craneEnabled: false, crane: 0,
  wasteEnabled: false, waste: 0,
  rewardEnabled: false, rewardPct: 0,
  crewEnabled: false, crew: 0,
};

export const netUnitCost = (price: number, discPct: number) =>
  (Number(price) || 0) * (1 - (Number(discPct) || 0) / 100);

export const markupPct = (cost: number, sell: number) => (cost > 0 ? ((sell - cost) / cost) * 100 : 0);

export function computeAccounting(rows: AccRow[], extras: AccExtras, globalDiscountPct: number, deposit = 0, crewTripCost = 0) {
  const f = 1 - (Number(globalDiscountPct) || 0) / 100;
  const lines = rows.map((r) => {
    const costUnit = netUnitCost(r.supplierPrice, r.supplierDiscountPct);
    const cost = costUnit * r.qta;
    const clientTotal = r.clientUnit * r.qta * f;
    const profit = clientTotal - cost;
    return { ...r, costUnit, cost, clientTotal, profit, ricarico: markupPct(cost, clientTotal) };
  });
  const clientNet = lines.reduce((s, l) => s + l.clientTotal, 0);
  const linesCost = lines.reduce((s, l) => s + l.cost, 0);
  const extra = {
    trasporto: extras.kmEnabled ? (Number(extras.km) || 0) * (Number(extras.eurKm) || 0) : 0,
    gru: extras.craneEnabled ? Number(extras.crane) || 0 : 0,
    smaltimento: extras.wasteEnabled ? Number(extras.waste) || 0 : 0,
    riconoscenza: extras.rewardEnabled ? clientNet * (Number(extras.rewardPct) || 0) / 100 : 0,
    squadra: extras.crewEnabled ? Number(extras.crew) || 0 : 0,
    squadraTrasferta: Number(crewTripCost) || 0,
  };
  const extraTot = Object.values(extra).reduce((s, v) => s + v, 0);
  const totalCost = linesCost + extraTot;
  const profit = clientNet - totalCost;
  const marginPct = clientNet > 0 ? (profit / clientNet) * 100 : 0;
  return {
    lines: lines.map((l) => ({ ...l, incidenza: clientNet > 0 ? (l.clientTotal / clientNet) * 100 : 0 })),
    extra, extraTot, linesCost, totalCost, clientNet, profit, marginPct,
    extraIncidence: clientNet > 0 ? (extraTot / clientNet) * 100 : 0,
    deposit, depositCoversPct: totalCost > 0 ? (deposit / totalCost) * 100 : 0,
  };
}

export const marginLevel = (pct: number) => (pct >= 25 ? "ok" : pct >= 10 ? "warn" : "bad");
