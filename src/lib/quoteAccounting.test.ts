/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
import { computeAccounting, DEFAULT_EXTRAS, marginLevel, netUnitCost } from "./quoteAccounting";

const row = { key: "a", desc: "Pannello S30", qta: 10, unita: "mq", supplierPrice: 100, supplierDiscountPct: 20, clientUnit: 120 };

describe("contabilità preventivo", () => {
  test("costo netto = prezzo fornitore × (1 − sconto)", () => {
    assert.equal(netUnitCost(100, 20), 80);
  });
  test("utile e margine sul netto cliente con sconto globale", () => {
    const r = computeAccounting([row], DEFAULT_EXTRAS, 10);
    close(r.clientNet, 1080);
    close(r.totalCost, 800);
    close(r.profit, 280);
  });
  test("trasporto = km andata+ritorno × €/km, solo se attivo", () => {
    assert.equal(computeAccounting([row], { ...DEFAULT_EXTRAS, km: 250, eurKm: 2 }, 0).extraTot, 0);
    assert.equal(computeAccounting([row], { ...DEFAULT_EXTRAS, kmEnabled: true, km: 250, eurKm: 2 }, 0).extra.trasporto, 500);
  });
  test("soglie margine 25% / 10%", () => {
    assert.equal(marginLevel(25), "ok");
    assert.equal(marginLevel(12), "warn");
    assert.equal(marginLevel(9.9), "bad");
  });
});
