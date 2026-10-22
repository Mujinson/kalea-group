import { describe, expect, test } from 'bun:test';
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
    expect(paidPs.map((row) => row.id)).toEqual(['paid-linked']);
    expect(paidPs.reduce((sum, row) => sum + row.amount, 0)).toBe(100);
  });

  test('includes linked open installments in balances and overdue cash', () => {
    const { unpaidPs } = revenueSources(schedules, invoices, () => true);
    expect(unpaidPs.reduce((sum, row) => sum + row.amount, 0)).toBe(500);
    expect(unpaidPs.filter((row) => row.due_date && row.due_date < '2026-10-22')
      .reduce((sum, row) => sum + row.amount, 0)).toBe(200);
  });

  test('counts linked invoices once and preserves standalone invoice cash', () => {
    const standaloneInvoice = { id: 'standalone', status: 'da_pagare', total: 400 };
    const directPaid = { id: 'paid-direct', invoice_id: null, amount: 50, is_paid: true, paid_date: '2026-10-22' };
    const { standalone, unlinkedPaidPs } = revenueSources([...schedules, directPaid], [...invoices, standaloneInvoice], () => true);
    expect(standalone.map((row) => row.id)).toEqual(['standalone']);
    expect(unlinkedPaidPs.map((row) => row.id)).toEqual(['paid-direct']);
    expect([...invoices, standaloneInvoice].reduce((sum, row) => sum + row.total, 0)
      + unlinkedPaidPs.reduce((sum, row) => sum + row.amount, 0)).toBe(550);
  });

  test('preserves paid-date period filtering and excludes cancelled standalone invoices', () => {
    const { paidPs, unpaidPs, standalone } = revenueSources(schedules,
      [...invoices, { id: 'cancelled', status: 'annullata', total: 999 }],
      (date) => date?.startsWith('2025') ?? false);
    expect(paidPs).toEqual([]);
    expect(unpaidPs).toHaveLength(2);
    expect(standalone).toEqual([]);
  });
});