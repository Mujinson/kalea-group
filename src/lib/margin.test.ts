/// <reference types="node" />
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeMargin, jobRevenue } from './margin';

const invoices = [
  { id: 'a', quote_id: 'q1', status: 'pagata', subtotal: 12500, total: 13750 },
  { id: 'b', status: 'pagata', subtotal: 1413, total: 1723.86 },
  { id: 'c', site_id: 's9', status: 'annullata', subtotal: 999, total: 1218.78 },
];
const schedules = [
  { sale_id: 'sale2', invoice_id: 'b', is_paid: true, amount: 1723.86, is_invoiced: true },
  { sale_id: 'sale2', invoice_id: null, is_paid: false, amount: 4022.34 },
];

describe('computeMargin', () => {
  it('sottrae tutti i costi dal fatturato imponibile', () => {
    assert.deepEqual(computeMargin(10000, { materials: 4000, labor: 1500, expenses: 500 }), { revenue: 10000, totalCost: 6000, margin: 4000, marginPct: 40 });
  });
  it('senza fatturato la percentuale è 0 e il margine è negativo', () => {
    const m = computeMargin(0, 800);
    assert.equal(m.margin, -800);
    assert.equal(m.marginPct, 0);
  });
});

describe('jobRevenue', () => {
  it('collega la fattura tramite preventivo e usa l\'imponibile', () => {
    assert.equal(jobRevenue({ siteId: 's1', quoteId: 'q1' }, invoices, schedules), 12500);
  });
  it('collega la fattura tramite rate della vendita senza contare le rate aperte', () => {
    assert.equal(jobRevenue({ saleId: 'sale2' }, invoices, schedules), 1413);
  });
  it('esclude le fatture annullate', () => {
    assert.equal(jobRevenue({ siteId: 's9' }, invoices, schedules), 0);
  });
});
