/// <reference types="node" />
import { describe, it as test } from 'node:test';
import assert from 'node:assert/strict';
import { fixedMonthlyTotal, fixedCostsInMonth, fixedCostsInPeriod } from './fixedCosts';

describe('costi fissi', () => {
  test('media mensile: mensile ×1, trimestrale ÷3, semestrale ÷6, annuale ÷12, una tantum 0', () => {
    assert.ok(Math.abs(fixedMonthlyTotal([
      { amount: 100, frequency: 'mensile' }, { amount: 300, frequency: 'trimestrale' },
      { amount: 600, frequency: 'semestrale' }, { amount: 1200, frequency: 'annuale' }, { amount: 999, frequency: 'una_tantum' },
    ]) - 400) < 0.01);
  });
  test('mensile conta 100 € in un mese pieno', () => {
    assert.equal(fixedCostsInMonth([{ amount: 100, frequency: 'mensile', cost_date: '2026-01-15' }], 2026, 4), 100);
  });
  test('trimestrale 300 € vale 100 € al mese', () => {
    assert.equal(fixedCostsInMonth([{ amount: 300, frequency: 'trimestrale', cost_date: '2026-01-01' }], 2026, 2), 100);
  });
  test('una tantum solo nel suo mese', () => {
    const r = [{ amount: 500, frequency: 'una_tantum', cost_date: '2026-03-10' }];
    assert.equal(fixedCostsInMonth(r, 2026, 2), 500);
    assert.equal(fixedCostsInMonth(r, 2026, 3), 0);
  });
  test('costo che inizia dopo il periodo non conta', () => {
    assert.equal(fixedCostsInPeriod([{ amount: 100, frequency: 'mensile', cost_date: '2026-12-01' }], '2026-01-01', '2026-11-30'), 0);
  });
});
