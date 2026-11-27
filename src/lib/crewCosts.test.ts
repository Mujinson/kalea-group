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
  test("artigiani a mq (Pisa 814 mq): 4 artigiani × 22 mq/g = 88 mq/g → 10 giorni, 9 notti, 17.404 €", () => {
    const c = computeCrew({
      mode: "artigiani", kmOneWay: 310.8, tollOneWay: 24.23, trasferta: "on",
      mq: 814, artisanRateMq: 16, artisanCount: 4, mqPerWorkerDay: 22,
    }, S);
    assert.equal(c.mqPerDay, 88);
    close(c.daysExact, 9.25);
    assert.equal(c.suggestedDays, 10);
    assert.equal(c.days, 10);
    assert.equal(c.nights, 9);
    close(c.labor, 13024);
    close(c.lunchTotal, 600);
    close(c.dinnerTotal, 900);
    close(c.meals, 1500);
    close(c.hotel, 2880);
    assert.equal(c.fuel, 0);
    assert.equal(c.van, 0);
    assert.equal(c.tolls, 0);
    close(c.total, 17404);
    close(c.perMq, 17404 / 814);
  });
  test("artigiani con spese selettive e prezzi personalizzati", () => {
    const c = computeCrew({
      mode: "artigiani", kmOneWay: 300, tollOneWay: 20, trasferta: "on",
      mq: 200, artisanRateMq: 18, artisanCount: 2, mqPerWorkerDay: 25,
      artisanIncludeLunch: false, artisanIncludeDinner: true, artisanIncludeHotel: true, artisanIncludeTravel: true,
      dinnerCost: 30, hotelCost: 70,
    }, S);
    assert.equal(c.days, 4);
    assert.equal(c.nights, 3);
    close(c.labor, 3600);
    close(c.lunchTotal, 0);
    close(c.dinnerTotal, 30 * 2 * 3);
    close(c.hotel, 70 * 2 * 3);
    assert.ok(c.fuel > 0 && c.tolls > 0 && c.van > 0);
  });
});
