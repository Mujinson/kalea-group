/// <reference types="node" />
import { describe, it as test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyOutcome,
  computeSiteEconomics,
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
});