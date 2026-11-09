/// <reference types="node" />
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
const expect = (a: unknown) => ({ toBe: (b: unknown) => assert.equal(a, b), toBeCloseTo: (b: number, d = 5) => assert.ok(Math.abs((a as number) - b) < 10 ** -d) });
import { roundToHalfHour, parseHHMM, parseHours, computeDayTimes } from './timbratureExport';

// Ottobre/novembre: Europe/Rome = UTC+1 dopo il 25/10
const at = (hhmm: string) => `2026-11-09T${String(Number(hhmm.slice(0, 2)) - 1).padStart(2, '0')}:${hhmm.slice(3)}:00.000Z`;
const day = [
  { event_type: 'start_home', event_at: at('07:02') },
  { event_type: 'arrive_site', event_at: at('08:07') },
  { event_type: 'pause_start', event_at: at('12:14') },
  { event_type: 'pause_end', event_at: at('13:14') },
  { event_type: 'leave_site', event_at: at('17:20') },
  { event_type: 'arrive_home', event_at: at('18:31') },
] as const;

describe('arrotondamento commercialista', () => {
  it('9:02, 9:07, 9:14 diventano 9:00', () => {
    for (const m of [542, 547, 554]) expect(roundToHalfHour(m)).toBe(540);
  });
  it('9:15 diventa 9:30 e 9:44 diventa 9:30', () => {
    expect(roundToHalfHour(555)).toBe(570);
    expect(roundToHalfHour(584)).toBe(570);
  });
});

describe('conversione testo → numeri', () => {
  it('"09:02" = 542 minuti', () => expect(parseHHMM('09:02')).toBe(542));
  it('"8,50" = 8.5 ore e "8:30" = 8.5 ore', () => {
    expect(parseHours('8,50')).toBe(8.5);
    expect(parseHours('8:30')).toBe(8.5);
  });
});

describe('ore totali vs ore cantiere', () => {
  it('orari effettivi', () => {
    const t = computeDayTimes(day as any);
    expect(t.pauseMinutes).toBe(60);
    expect(t.totalHours).toBeCloseTo((18 * 60 + 31 - (7 * 60 + 2) - 60) / 60, 5); // 10h29
    expect(t.siteHours).toBeCloseTo((17 * 60 + 20 - (8 * 60 + 7) - 60) / 60, 5); // 8h13
  });
  it('orari arrotondati a 30 minuti', () => {
    const t = computeDayTimes(day as any, true);
    // 7:00 → 18:30 meno 1h = 10.5 ; 8:00 → 17:30 meno 1h = 8.5
    expect(t.totalHours).toBe(10.5);
    expect(t.siteHours).toBe(8.5);
    expect(t.travelHours).toBe(2);
  });
});
