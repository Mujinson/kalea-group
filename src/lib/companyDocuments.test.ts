import { describe, it, expect } from 'bun:test';
import { expiryStatus } from './companyDocuments';

const today = new Date(2026, 10, 5);
describe('expiryStatus', () => {
  it('no date = senza scadenza', () => expect(expiryStatus(null, today)).toBe('none'));
  it('yesterday = scaduto', () => expect(expiryStatus('2026-11-04', today)).toBe('expired'));
  it('within 30 days = in scadenza', () => expect(expiryStatus('2026-12-05', today)).toBe('expiring'));
  it('after 30 days = valido', () => expect(expiryStatus('2026-12-06', today)).toBe('valid'));
});
