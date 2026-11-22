/// <reference types="node" />
import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { computeRevenueSummary, revenueSources } from './revenueSources';

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

describe('computeRevenueSummary', () => {
  test('computes fatturato, incassato, daIncassare and scaduto without double-counting', () => {
    const invs = [
      { id: 'inv-linked', status: 'pagata', total: 1000, subtotal: 819.67, paid_amount: 1000, invoice_date: '2026-10-10', due_date: '2026-10-10' },
      { id: 'inv-standalone', status: 'parziale', total: 500, subtotal: 409.84, paid_amount: 200, invoice_date: '2026-10-01', due_date: '2026-10-15' },
      { id: 'inv-cancelled', status: 'annullata', total: 9999, subtotal: 8000, paid_amount: 0, invoice_date: '2026-10-05', due_date: '2026-10-05' },
    ];
    const scheds = [
      { id: 'ps-linked-paid', invoice_id: 'inv-linked', amount: 1000, is_paid: true, is_invoiced: true, paid_date: '2026-10-10', due_date: '2026-10-10' },
      { id: 'ps-unlinked-invoiced', invoice_id: null, amount: 150, is_paid: true, is_invoiced: true, invoiced_amount: 150, paid_date: '2026-10-12', due_date: '2026-10-12' },
      { id: 'ps-unlinked-not-inv', invoice_id: null, amount: 80, is_paid: true, is_invoiced: false, paid_date: '2026-10-12', due_date: '2026-10-12' },
      { id: 'ps-open-overdue', invoice_id: null, amount: 300, is_paid: false, is_invoiced: false, due_date: '2026-10-01' },
      { id: 'ps-open-future', invoice_id: null, amount: 400, is_paid: false, is_invoiced: false, due_date: '2026-12-01' },
    ];

    const res = computeRevenueSummary(scheds, invs, () => true, { today: '2026-11-22' });
    // fatturato = 1000 (inv-linked) + 500 (inv-standalone) + 150 (ps-unlinked-invoiced) = 1650
    assert.equal(res.fatturato, 1650);
    // incassato = 1000 + 150 + 80 (paidPs) + 200 (inv-standalone paid_amount) = 1430
    assert.equal(res.incassato, 1430);
    // daIncassare = 300 + 400 (unpaidPs) + 300 (inv-standalone open) = 1000
    assert.equal(res.daIncassare, 1000);
    // scaduto = 300 (ps-open-overdue) + 300 (inv-standalone due 2026-10-15) = 600
    assert.equal(res.scaduto, 600);
  });

  test('supports net basis (imponibile) and excludes cancelled invoices', () => {
    const invs = [
      { id: 'inv-1', status: 'pagata', total: 1220, subtotal: 1000, paid_amount: 1220, invoice_date: '2026-10-10' },
      { id: 'inv-2', status: 'annullata', total: 500, subtotal: 400, paid_amount: 0, invoice_date: '2026-10-10' },
    ];
    const res = computeRevenueSummary([], invs, () => true, { basis: 'net' });
    assert.equal(res.fatturato, 1000);
  });
});