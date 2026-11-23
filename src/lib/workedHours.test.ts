/// <reference types="node" />
import { describe, it as test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkedHours, sumWorkedHours, sumLaborCost, groupHoursBySite } from './workedHours';
import type { TimeEntry } from './timbrature';

const mkEntry = (
  event_type: TimeEntry['event_type'],
  time: string,
  extra: Partial<TimeEntry & { worker_id?: string | null }> = {},
): TimeEntry & { worker_id?: string | null } => ({
  id: `${event_type}-${time}`,
  user_id: 'u1',
  worker_id: 'w1',
  event_type,
  event_at: `2026-11-12T${time}:00.000Z`,
  event_date: '2026-11-12',
  latitude: null,
  longitude: null,
  accuracy_m: null,
  site_id: null,
  distance_from_site_m: null,
  is_at_site: null,
  notes: null,
  ...extra,
});

const workers = [
  { id: 'w1', user_id: 'u1', first_name: 'Luca', last_name: 'Merelli', hourly_cost: 30 },
  { id: 'w2', user_id: 'u2', first_name: 'Gabriel', last_name: 'Vladu', hourly_cost: 40 },
];

describe('buildWorkedHours', () => {
  test('calcola ore cantiere escludendo pausa e viaggio, anche con site_id presente solo su alcune tappe', () => {
    const entries = [
      mkEntry('start_home', '06:00', { site_id: null }),
      mkEntry('arrive_site', '07:00', { site_id: 's1' }),
      mkEntry('pause_start', '12:00', { site_id: null }),
      mkEntry('pause_end', '12:30', { site_id: null }),
      mkEntry('leave_site', '16:00', { site_id: 's1' }),
      mkEntry('arrive_home', '17:00', { site_id: null }),
    ];
    const rows = buildWorkedHours({ timeEntries: entries, workers, siteMap: { s1: { title: 'Bellagio' } } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.hours_worked, 8.5);
    assert.equal(rows[0]?.labor_cost, 255);
    assert.equal(rows[0]?.site_id, 's1');
    assert.equal(rows[0]?.from_timbrature, true);
  });

  test('il registro manuale ha priorità sulle timbrature dello stesso operaio e giorno (nessun doppio conteggio)', () => {
    const entries = [
      mkEntry('arrive_site', '07:00', { site_id: 's1' }),
      mkEntry('leave_site', '15:00', { site_id: 's1' }),
    ];
    const manualLogs = [
      { id: 'm1', site_id: 's1', worker_id: 'w1', work_date: '2026-11-12', hours_worked: 6, hourly_cost: 35 },
    ];
    const rows = buildWorkedHours({ manualLogs, timeEntries: entries, workers });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.from_timbrature, false);
    assert.equal(rows[0]?.hours_worked, 6);
    assert.equal(rows[0]?.labor_cost, 210);
  });

  test('siteIdFilter filtra solo il cantiere richiesto mantenendo il calcolo completo della giornata', () => {
    const entries = [
      mkEntry('arrive_site', '08:00', { site_id: 's1' }),
      mkEntry('pause_start', '12:00', { site_id: null }),
      mkEntry('pause_end', '13:00', { site_id: null }),
      mkEntry('leave_site', '17:00', { site_id: null }),
      mkEntry('arrive_site', '08:00', { user_id: 'u2', worker_id: 'w2', site_id: 's2' }),
      mkEntry('leave_site', '12:00', { user_id: 'u2', worker_id: 'w2', site_id: 's2' }),
    ];
    const rows = buildWorkedHours({ timeEntries: entries, workers, siteIdFilter: 's1' });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.hours_worked, 8);
    assert.equal(rows[0]?.labor_cost, 240);
  });

  test('raggruppa correttamente ore e costo per cantiere escludendo righe senza cantiere', () => {
    const entries = [
      mkEntry('arrive_site', '08:00', { site_id: 's1' }),
      mkEntry('leave_site', '12:00', { site_id: 's1' }),
      mkEntry('arrive_site', '08:00', { user_id: 'u2', worker_id: 'w2', site_id: null }),
      mkEntry('leave_site', '13:00', { user_id: 'u2', worker_id: 'w2', site_id: null }),
    ];
    const rows = buildWorkedHours({ timeEntries: entries, workers });
    assert.equal(sumWorkedHours(rows), 9);
    assert.equal(sumLaborCost(rows), 320); // 4*30 + 5*40
    const bySite = groupHoursBySite(rows);
    assert.equal(bySite.size, 1);
    assert.deepEqual(bySite.get('s1'), { hours: 4, laborCost: 120 });
  });

  test('non scarta timbrature di utenti senza scheda in workers (costo orario 0)', () => {
    const entries = [
      mkEntry('arrive_site', '09:00', { user_id: 'u-orphan', worker_id: null, site_id: 's1' }),
      mkEntry('leave_site', '11:00', { user_id: 'u-orphan', worker_id: null, site_id: 's1' }),
    ];
    const rows = buildWorkedHours({ timeEntries: entries, workers });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.hours_worked, 2);
    assert.equal(rows[0]?.labor_cost, 0);
  });
});