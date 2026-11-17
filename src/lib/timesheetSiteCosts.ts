export interface TsEntry { worker_id: string | null; event_date: string; site_id: string | null; event_type: string }
export interface Window { worker_id: string; site_id: string; start_date: string | null; end_date: string | null }

/** Giorni in cui ogni operaio ha lavorato sul cantiere: timbratura con quel cantiere,
 *  oppure timbratura senza cantiere in un giorno in cui era assegnato a quel cantiere. */
export function siteWorkerDays(siteId: string, entries: TsEntry[], windows: Window[]): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const inWin = (w: Window, d: string) => (!w.start_date || d >= w.start_date) && (!w.end_date || d <= w.end_date);
  for (const e of entries) {
    if (!e.worker_id || !["arrive_site", "leave_site"].includes(e.event_type)) continue;
    const ok = e.site_id ? e.site_id === siteId
      : windows.some((w) => w.worker_id === e.worker_id && w.site_id === siteId && inWin(w, e.event_date));
    if (!ok) continue;
    if (!out.has(e.event_date)) out.set(e.event_date, new Set());
    out.get(e.event_date)!.add(e.worker_id);
  }
  return out;
}
