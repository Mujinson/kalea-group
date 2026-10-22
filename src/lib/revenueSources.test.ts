/// <reference types="node" />
import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { revenueSources } from './revenueSources';

const invoices = [{ id: 'invoice-1', status: 'pagata', total: 100 }];
const schedules = [
  { id: 'paid-linked', invoice_id: 'invoice-1', amount: 100, is_paid: true, paid_date: '2026-10-22' },
  { id: 'open-linked', invoice_id: 'invoice-2', amount: 200, is_paid: false, due_date: '2026-10-01' },
  { id: 'open-direct', invoice_id: null, amount: 300, is_paid: false, due_date: '2026-11-01' },
];

describe('Revenue cash sources', () => {
  test('includes invoiced installments in collected cash and payment lists', () => {
    const { paidPs } = revenueSources(schedules, invoices, () => true);
    assert.deepEqual(paidPs.map((row) => row.id), ['paid-linked']);
    assert.equal(paidPs.reduce((sum, row) => sum + row.amount, 0), 100);
  });

  test('includes linked open installments in balances and overdue cash', () => {
    const { unpaidPs } = revenueSources(schedules, invoices, () => true);
    assert.equal(unpaidPs.reduce((sum, row) => sum + row.amount, 0), 500);
    assert.equal(unpaidPs.filter((row) => row.due_date && row.due_date < '2026-10-22')
      .reduce((sum, row) => sum + row.amount, 0), 200);
  });

  test('counts linked invoices once and preserves standalone invoice cash', () => {
    const standaloneInvoice = { id: 'standalone', status: 'da_pagare', total: 400 };
    const directPaid = { id: 'paid-direct', invoice_id: null, amount: 50, is_paid: true, paid_date: '2026-10-22' };
    const { standalone, unlinkedPaidPs } = revenueSources([...schedules, directPaid], [...invoices, standaloneInvoice], () => true);
    assert.deepEqual(standalone.map((row) => row.id), ['standalone']);
    assert.deepEqual(unlinkedPaidPs.map((row) => row.id), ['paid-direct']);
    assert.equal([...invoices, standaloneInvoice].reduce((sum, row) => sum + row.total, 0)
      + unlinkedPaidPs.reduce((sum, row) => sum + row.amount, 0), 550);
  });

  test('preserves paid-date period filtering and excludes cancelled standalone invoices', () => {
    const { paidPs, unpaidPs, standalone } = revenueSources(schedules,
      [...invoices, { id: 'cancelled', status: 'annullata', total: 999 }],
      (date) => date?.startsWith('2025') ?? false);
    assert.deepEqual(paidPs, []);
    assert.equal(unpaidPs.length, 2);
    assert.deepEqual(standalone, []);
  });
});