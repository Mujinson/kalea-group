/// <reference types="node" />
import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { expiryStatus } from './companyDocuments';

const today = new Date(2026, 10, 5);
describe('expiryStatus', () => {
  test('no date = senza scadenza', () => assert.equal(expiryStatus(null, today), 'none'));
  test('yesterday = scaduto', () => assert.equal(expiryStatus('2026-11-04', today), 'expired'));
  test('within 30 days = in scadenza', () => assert.equal(expiryStatus('2026-12-05', today), 'expiring'));
  test('after 30 days = valido', () => assert.equal(expiryStatus('2026-12-06', today), 'valid'));
});
