/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { workingDaysInMonth, computeCrew, DEFAULT_CREW_SETTINGS as S, workerDailyCost, workerMonthlyCost } from "./crewCosts";
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

describe("costi squadra", () => {
  test("costo fisso operaio = 2000 + 1297 + 300 + 400 = 3997 €/mese", () => {
    assert.equal(workerMonthlyCost(S), 3997);
    close(workerDailyCost(S), 3997 / 22);
  });
  test("cantiere vicino: gasolio e Telepass A/R ogni giorno", () => {
    const c = computeCrew({ kmOneWay: 50, tollOneWay: 5, days: 3, workers: 2, vans: 1 }, S);
    assert.equal(c.isTrasferta, false);
    close(c.fuel, 100 * 0.1 * 1.75 * 3);
    close(c.tolls, 10 * 3);
    close(c.meals, 15 * 2 * 3);
    assert.equal(c.hotel, 0);
  });
  test("oltre la soglia km è trasferta: un solo viaggio, albergo e cena per notte", () => {
    const c = computeCrew({ kmOneWay: 200, tollOneWay: 20, days: 4, workers: 2 }, S);
    assert.equal(c.isTrasferta, true);
    assert.equal(c.nights, 3);
    close(c.tolls, 40);
    close(c.fuel, (400 + 20 * 4) * 0.1 * 1.75);
    assert.ok(computeCrew({ kmOneWay: 200, days: 6 }, S).fuel > c.fuel);
    close(c.hotel, 80 * 2 * 3);
    close(c.meals, 15 * 2 * 4 + 25 * 2 * 3);
  });
  test("trasferta forzata spenta resta pendolare", () => {
    assert.equal(computeCrew({ kmOneWay: 300, days: 2, trasferta: "off" }, S).isTrasferta, false);
  });
  test("giorni lavorativi reali: dicembre 2026 = 21 (8, 25, 26 festivi), costo operaio = 3997/21", () => {
    assert.equal(workingDaysInMonth(2026, 12), 21);
    const c = computeCrew({ days: 1, workers: 1, startDate: "2026-12-01" }, S);
    close(c.labor, 3997 / 21);
  });
  test("furgone a km: 60 km sola andata × 5 giorni = 600 km × 0,30 €", () => {
    const c = computeCrew({ kmOneWay: 60, days: 5, workers: 1 }, S);
    close(c.totalKm, 600);
    close(c.van, 180);
  });
});
