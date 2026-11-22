import { describe, expect, test } from 'bun:test';
import { fixedMonthlyTotal, fixedCostsInMonth, fixedCostsInPeriod } from './fixedCosts';

describe('costi fissi', () => {
  test('media mensile: mensile ×1, trimestrale ÷3, semestrale ÷6, annuale ÷12, una tantum 0', () => {
    expect(fixedMonthlyTotal([
      { amount: 100, frequency: 'mensile' }, { amount: 300, frequency: 'trimestrale' },
      { amount: 600, frequency: 'semestrale' }, { amount: 1200, frequency: 'annuale' }, { amount: 999, frequency: 'una_tantum' },
    ])).toBeCloseTo(400, 2);
  });
  test('mensile conta 100 € in un mese pieno', () => {
    expect(fixedCostsInMonth([{ amount: 100, frequency: 'mensile', cost_date: '2026-01-15' }], 2026, 4)).toBe(100);
  });
  test('trimestrale 300 € vale 100 € al mese', () => {
    expect(fixedCostsInMonth([{ amount: 300, frequency: 'trimestrale', cost_date: '2026-01-01' }], 2026, 2)).toBe(100);
  });
  test('una tantum solo nel suo mese', () => {
    const r = [{ amount: 500, frequency: 'una_tantum', cost_date: '2026-03-10' }];
    expect(fixedCostsInMonth(r, 2026, 2)).toBe(500);
    expect(fixedCostsInMonth(r, 2026, 3)).toBe(0);
  });
  test('costo che inizia dopo il periodo non conta', () => {
    expect(fixedCostsInPeriod([{ amount: 100, frequency: 'mensile', cost_date: '2026-12-01' }], '2026-01-01', '2026-11-30')).toBe(0);
  });
});
