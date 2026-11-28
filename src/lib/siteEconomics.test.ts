/// <reference types="node" />
import { describe, it as test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyOutcome,
  computeAllSitesEconomics,
  computeSiteEconomics,
  isMaterialExpense,
  isPlannedExpense,
  resolveIsTravel,
  splitSiteExpenses,
  sumSiteMaterials,
} from './siteEconomics';
import type { TimeEntry } from './timbrature';

const SITE_ID = 'site-aosta';
const SITE_COORDS = { lat: 45.7364947, lng: 7.3177482 }; // Aosta
const WORKER = { id: 'w-luca', user_id: 'u-luca', first_name: 'Luca', last_name: 'Merelli', hourly_cost: 30 };

function makeDayEntries(
  date: string,
  lat: number | null,
  lng: number | null,
  hoursOnSite: number,
  siteId: string | null = null
): (TimeEntry & { worker_id?: string | null })[] {
  const startMs = new Date(`${date}T08:00:00Z`).getTime();
  const endMs = startMs + hoursOnSite * 3600 * 1000;
  const base = {
    user_id: WORKER.user_id,
    worker_id: WORKER.id,
    event_date: date,
    latitude: lat,
    longitude: lng,
    accuracy_m: 10,
    site_id: siteId,
    distance_from_site_m: null,
    is_at_site: null,
    notes: null,
  };
  return [
    { ...base, id: `${date}-a`, event_type: 'arrive_site', event_at: new Date(startMs).toISOString() },
    { ...base, id: `${date}-l`, event_type: 'leave_site', event_at: new Date(endMs).toISOString() },
  ];
}

describe('siteEconomics', () => {
  test('prossimità 3 km: dentro 3 km conta, fuori 3 km non conta', () => {
    // ~1.5 km da Aosta vs ~10 km da Aosta
    const near = makeDayEntries('2026-11-26', 45.7379, 7.3374, 8);
    const far = makeDayEntries('2026-11-25', 45.826, 7.3177, 8);
    const res = computeSiteEconomics({
      siteId: SITE_ID,
      revenue: 1000,
      materials: [],
      expenses: [],
      timeEntries: [...near, ...far],
      workers: [WORKER],
      siteCoords: SITE_COORDS,
      isTravel: false,
    });
    assert.equal(res.laborDaysCount, 1);
    assert.equal(res.laborCost, 260);
    assert.equal(res.days.length, 1);
    assert.equal(res.days[0]?.workDate, '2026-11-26');
    assert.equal(res.allWorkerDays.length, 2);
  });

  test('giornata normale 8h = 260 € e 10h (2h straordinario) = 325 €', () => {
    const d8 = makeDayEntries('2026-11-20', SITE_COORDS.lat, SITE_COORDS.lng, 8);
    const d10 = makeDayEntries('2026-11-21', SITE_COORDS.lat, SITE_COORDS.lng, 10);
    const res = computeSiteEconomics({
      siteId: SITE_ID,
      revenue: 1000,
      materials: [],
      expenses: [],
      timeEntries: [...d8, ...d10],
      workers: [WORKER],
      siteCoords: SITE_COORDS,
      isTravel: false,
    });
    assert.equal(res.laborDaysCount, 2);
    assert.equal(res.regularHours, 16);
    assert.equal(res.overtimeHours, 2);
    assert.equal(res.laborCost, 585); // 260 + 325
  });

  test('giornata in trasferta: 8h = 350 €, 10h = 437.50 €', () => {
    const d8 = makeDayEntries('2026-11-20', SITE_COORDS.lat, SITE_COORDS.lng, 8);
    const d10 = makeDayEntries('2026-11-21', SITE_COORDS.lat, SITE_COORDS.lng, 10);
    const res = computeSiteEconomics({
      siteId: SITE_ID,
      revenue: 2000,
      materials: [],
      expenses: [],
      timeEntries: [...d8, ...d10],
      workers: [WORKER],
      siteCoords: SITE_COORDS,
      isTravel: true,
    });
    assert.equal(res.laborCost, 787.5); // 350 + 437.50
  });

  test('fallback su workers.hourly_cost quando manca la tariffa giornaliera', () => {
    const d8 = makeDayEntries('2026-11-20', SITE_COORDS.lat, SITE_COORDS.lng, 8);
    const res = computeSiteEconomics({
      siteId: SITE_ID,
      revenue: 1000,
      materials: [],
      expenses: [],
      timeEntries: d8,
      workers: [WORKER], // hourly_cost = 30 -> 240 €/giorno
      siteCoords: SITE_COORDS,
      isTravel: false,
      dailyRateOverride: null,
    });
    assert.equal(res.laborCost, 240);
  });

  test('spunta manuale vince sul GPS: esclude giorno vicino e ammette giorno lontano/senza GPS', () => {
    const nearNotAdmitted = makeDayEntries('2026-11-26', 45.7379, 7.3374, 8, SITE_ID);
    const noGpsDay = makeDayEntries('2026-11-24', null, null, 8, null);
    const res = computeSiteEconomics({
      siteId: SITE_ID,
      revenue: 1000,
      materials: [],
      expenses: [],
      timeEntries: [...nearNotAdmitted, ...noGpsDay],
      workers: [WORKER],
      siteCoords: SITE_COORDS,
      isTravel: true,
      overrides: [
        { worker_id: WORKER.id, work_date: '2026-11-26', decision: 'esclusa', note: 'Non ammesso in cantiere' },
        { worker_id: WORKER.id, work_date: '2026-11-24', decision: 'ammessa' },
      ],
    });
    assert.equal(res.laborDaysCount, 1);
    assert.equal(res.laborCost, 350);
    assert.equal(res.days.find((d) => d.workDate === '2026-11-26')?.status, 'esclusa');
    assert.equal(res.days.find((d) => d.workDate === '2026-11-24')?.status, 'ammessa');
  });

  test('separazione spese PREVISTO (case-insensitive, trim) e materiali con fallback', () => {
    assert.equal(isPlannedExpense('PREVISTO, non ancora sostenuto'), true);
    assert.equal(isPlannedExpense('  previsto albergo'), true);
    assert.equal(isPlannedExpense('Importo indicato da Gabriel'), false);
    assert.equal(isPlannedExpense(null), false);

    const exp = splitSiteExpenses([
      { amount: 350, notes: 'Fermo cantiere' },
      { amount: 15, notes: 'Pranzo' },
      { amount: 490, notes: 'PREVISTO, non ancora sostenuto' },
      { amount: 105, notes: ' previsto pranzi' },
    ]);
    assert.equal(exp.sustained, 365);
    assert.equal(exp.planned, 595);

    assert.equal(sumSiteMaterials([
      { total_cost: 7406.2, quantity: 1, unit_cost: 0 },
      { total_cost: null, quantity: 10, unit_cost: 20 },
    ]), 7606.2);
  });

  test('esiti utile, perdita, pari (entro ±1 €) e margine con previste', () => {
    assert.equal(classifyOutcome(150), 'utile');
    assert.equal(classifyOutcome(-150), 'perdita');
    assert.equal(classifyOutcome(0.5), 'pari');
    assert.equal(classifyOutcome(-0.9), 'pari');

    const res = computeSiteEconomics({
      siteId: SITE_ID,
      revenue: 10000,
      materials: [{ total_cost: 7406.2 }],
      expenses: [
        { amount: 1148.8, notes: 'Sostenute' },
        { amount: 2000, notes: 'PREVISTO settimana prossima' },
      ],
      timeEntries: [],
      workers: [],
      siteCoords: SITE_COORDS,
      isTravel: true,
    });
    assert.equal(res.margin, 1445);
    assert.equal(res.outcome, 'utile');
    assert.equal(res.marginWithPlanned, -555);
    assert.equal(res.outcomeWithPlanned, 'perdita');
  });

  test('resolveIsTravel: auto >= 150 km da Alzano Lombardo', () => {
    const aosta = resolveIsTravel('auto', SITE_COORDS, 150);
    assert.equal(aosta.isTravel, true);
    assert.ok((aosta.distanceFromOriginKm ?? 0) > 150);

    const villongo = resolveIsTravel('auto', { lat: 45.6704, lng: 9.9382 }, 150);
    assert.equal(villongo.isTravel, false);

    assert.equal(resolveIsTravel('on', { lat: 45.6704, lng: 9.9382 }, 150).isTravel, true);
    assert.equal(resolveIsTravel('off', SITE_COORDS, 150).isTravel, false);
  });

  test('spese con expense_type = materiali sommate ai materiali e non alle spese sostenute', () => {
    assert.equal(isMaterialExpense('materiali'), true);
    assert.equal(isMaterialExpense('Materiali '), true);
    assert.equal(isMaterialExpense('vitto'), false);

    const res = computeSiteEconomics({
      siteId: SITE_ID,
      revenue: 10000,
      materials: [{ total_cost: 7406.2 }],
      expenses: [
        { amount: 203.8, expense_type: 'materiali', notes: 'Differenza fornitore' },
        { amount: 100, expense_type: 'vitto', notes: 'Pranzi' },
        { amount: 300, expense_type: 'materiali', notes: 'PREVISTO materiale extra' },
      ],
      timeEntries: [],
      workers: [],
      siteCoords: SITE_COORDS,
      isTravel: false,
    });
    assert.equal(res.materialsCost, 7610);
    assert.equal(res.sustainedExpenses, 100);
    assert.equal(res.plannedExpenses, 300);
    assert.equal(res.totalCost, 7710);
    assert.equal(res.margin, 2290);
    assert.equal(res.marginWithPlanned, 1990);
  });

  test('caso 1: cantiere senza spese (solo ricavo, materiali e manodopera)', () => {
    const d8 = makeDayEntries('2026-11-18', SITE_COORDS.lat, SITE_COORDS.lng, 8);
    const res = computeSiteEconomics({
      siteId: 'site-no-exp',
      revenue: 5000,
      materials: [{ total_cost: 1500 }],
      expenses: [],
      timeEntries: d8,
      workers: [WORKER],
      siteCoords: SITE_COORDS,
      isTravel: false,
    });
    assert.equal(res.sustainedExpenses, 0);
    assert.equal(res.plannedExpenses, 0);
    assert.equal(res.laborCost, 260);
    assert.equal(res.totalCost, 1760);
    assert.equal(res.margin, 3240);
    assert.equal(res.marginWithPlanned, 3240);
    assert.equal(res.outcome, 'utile');
    assert.equal(res.outcomeWithPlanned, 'utile');
  });

  test('caso 2: cantiere con spese previste (attuale in utile, previsto più basso)', () => {
    const res = computeSiteEconomics({
      siteId: 'site-planned',
      revenue: 12000,
      materials: [{ total_cost: 7406.2 }],
      expenses: [
        { amount: 203.8, expense_type: 'materiali', notes: 'Integrazione' },
        { amount: 890, expense_type: 'trasporto', notes: 'Trasferta sostenuta' },
        { amount: 1500, expense_type: 'alloggio', notes: 'PREVISTO albergo settimana prossima' },
      ],
      timeEntries: [],
      workers: [],
      siteCoords: SITE_COORDS,
      isTravel: true,
    });
    assert.equal(res.materialsCost, 7610);
    assert.equal(res.sustainedExpenses, 890);
    assert.equal(res.plannedExpenses, 1500);
    assert.equal(res.margin, 3500);
    assert.equal(res.outcome, 'utile');
    assert.equal(res.marginWithPlanned, 2000);
    assert.equal(res.outcomeWithPlanned, 'utile');
  });

  test('caso 3: cantiere in perdita (costi sostenuti superiori al ricavo)', () => {
    const d8a = makeDayEntries('2026-11-26', SITE_COORDS.lat, SITE_COORDS.lng, 8);
    const d8b = makeDayEntries('2026-11-27', SITE_COORDS.lat, SITE_COORDS.lng, 8);
    const res = computeSiteEconomics({
      siteId: 'site-loss',
      revenue: 3000,
      materials: [{ total_cost: 2800 }],
      expenses: [
        { amount: 400, expense_type: 'vitto', notes: 'Vitto squadra' },
        { amount: 500, expense_type: 'alloggio', notes: 'PREVISTO completamento' },
      ],
      timeEntries: [...d8a, ...d8b],
      workers: [WORKER],
      siteCoords: SITE_COORDS,
      isTravel: true,
    });
    assert.equal(res.laborCost, 700);
    assert.equal(res.totalCost, 3900);
    assert.equal(res.margin, -900);
    assert.equal(res.outcome, 'perdita');
    assert.equal(res.marginWithPlanned, -1400);
    assert.equal(res.outcomeWithPlanned, 'perdita');
  });

  test('computeAllSitesEconomics calcola in batch con le stesse regole', () => {
    const map = computeAllSitesEconomics({
      sites: [
        { id: 's1', latitude: SITE_COORDS.lat, longitude: SITE_COORDS.lng, travel_mode: 'off' },
        { id: 's2', latitude: SITE_COORDS.lat, longitude: SITE_COORDS.lng, travel_mode: 'on' },
      ],
      invoices: [
        { id: 'i1', site_id: 's1', subtotal: 4000, status: 'pagata' },
        { id: 'i2', site_id: 's2', subtotal: 1000, status: 'da_pagare' },
      ],
      schedules: [],
      materials: [
        { site_id: 's1', total_cost: 1000 },
        { site_id: 's2', total_cost: 1200 },
      ],
      expenses: [
        { site_id: 's2', amount: 200, expense_type: 'materiali', notes: 'Colla' },
        { site_id: 's2', amount: 300, expense_type: 'alloggio', notes: 'PREVISTO hotel' },
      ],
      timeEntries: [],
      workers: [WORKER],
    });
    assert.equal(map.get('s1')?.margin, 3000);
    assert.equal(map.get('s1')?.outcome, 'utile');
    assert.equal(map.get('s2')?.materialsCost, 1400);
    assert.equal(map.get('s2')?.margin, -400);
    assert.equal(map.get('s2')?.marginWithPlanned, -700);
    assert.equal(map.get('s2')?.outcome, 'perdita');
  });
});