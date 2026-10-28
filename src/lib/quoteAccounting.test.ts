import { describe, expect, test } from "bun:test";
import { computeAccounting, DEFAULT_EXTRAS, marginLevel, netUnitCost } from "./quoteAccounting";

const row = { key: "a", desc: "Pannello S30", qta: 10, unita: "mq", supplierPrice: 100, supplierDiscountPct: 20, clientUnit: 120 };

describe("contabilità preventivo", () => {
  test("costo netto = prezzo fornitore × (1 − sconto)", () => {
    expect(netUnitCost(100, 20)).toBe(80);
  });
  test("utile e margine sul netto cliente con sconto globale", () => {
    const r = computeAccounting([row], DEFAULT_EXTRAS, 10);
    expect(r.clientNet).toBeCloseTo(1080);
    expect(r.totalCost).toBeCloseTo(800);
    expect(r.profit).toBeCloseTo(280);
  });
  test("trasporto = km andata+ritorno × €/km, solo se attivo", () => {
    expect(computeAccounting([row], { ...DEFAULT_EXTRAS, km: 250, eurKm: 2 }, 0).extraTot).toBe(0);
    expect(computeAccounting([row], { ...DEFAULT_EXTRAS, kmEnabled: true, km: 250, eurKm: 2 }, 0).extra.trasporto).toBe(500);
  });
  test("soglie margine 25% / 10%", () => {
    expect(marginLevel(25)).toBe("ok");
    expect(marginLevel(12)).toBe("warn");
    expect(marginLevel(9.9)).toBe("bad");
  });
});
