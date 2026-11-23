import { summarizeDay, formatTime, type TimeEntry } from '@/lib/timbrature';

export interface WorkLogInput {
  id?: string;
  site_id?: string | null;
  worker_id?: string | null;
  worker_user_id?: string | null;
  work_date: string;
  hours_worked: number | string | null;
  hourly_cost?: number | string | null;
  start_time?: string | null;
  end_time?: string | null;
  break_minutes?: number | null;
  notes?: string | null;
  materials_used?: string[] | null;
  construction_sites?: { title?: string | null; city?: string | null } | null;
  site_work_photos?: any[];
  [key: string]: any;
}

export interface WorkerRateInput {
  id: string;
  user_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  hourly_cost?: number | string | null;
}

export interface UnifiedWorkLog {
  id: string;
  from_timbrature: boolean;
  site_id: string | null;
  worker_id: string | null;
  worker_user_id: string | null;
  worker_name: string | null;
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  break_minutes: number;
  hours_worked: number;
  hourly_cost: number;
  labor_cost: number;
  notes: string | null;
  materials_used?: string[] | null;
  construction_sites: { title?: string | null; city?: string | null } | null;
  site_work_photos?: any[];
}

export interface BuildWorkedHoursOptions {
  manualLogs?: WorkLogInput[];
  timeEntries?: (TimeEntry & { worker_id?: string | null })[];
  workers?: WorkerRateInput[];
  siteMap?: Record<string, { title?: string | null; city?: string | null }>;
  siteIdFilter?: string | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Regola unica per le ore lavorate e il costo manodopera nel CRM:
 * - I registri manuali (`site_work_logs`) hanno priorità sulle timbrature dello stesso operaio/giorno.
 * - Per tutti gli altri giorni, le ore sono le ore in cantiere da `summarizeDay(entries).siteMinutes / 60`
 *   (pausa già esclusa; viaggio escluso).
 * - Il costo manodopera usa `hourly_cost` del registro manuale se presente, altrimenti quello dell'operaio (`workers.hourly_cost`).
 */
export function buildWorkedHours(opts: BuildWorkedHoursOptions): UnifiedWorkLog[] {
  const manualLogs = opts.manualLogs || [];
  const timeEntries = opts.timeEntries || [];
  const workers = opts.workers || [];
  const siteMap = opts.siteMap || {};
  const siteIdFilter = opts.siteIdFilter ?? null;

  const workerById = new Map<string, WorkerRateInput>();
  const workerByUser = new Map<string, WorkerRateInput>();
  for (const w of workers) {
    workerById.set(w.id, w);
    if (w.user_id) workerByUser.set(w.user_id, w);
  }

  const resolveWorker = (workerId?: string | null, userId?: string | null): WorkerRateInput | undefined =>
    (workerId ? workerById.get(workerId) : undefined) || (userId ? workerByUser.get(userId) : undefined);

  const workerKey = (workerId?: string | null, userId?: string | null): string => {
    const w = resolveWorker(workerId, userId);
    if (w) return `w:${w.id}`;
    if (workerId) return `w:${workerId}`;
    return `u:${userId || 'unknown'}`;
  };

  const workerName = (w?: WorkerRateInput): string | null => {
    if (!w) return null;
    const full = `${w.first_name || ''} ${w.last_name || ''}`.trim();
    return full || null;
  };

  const manualKeys = new Set<string>();
  const out: UnifiedWorkLog[] = [];

  for (const l of manualLogs) {
    const date = String(l.work_date || '').slice(0, 10);
    if (!date) continue;
    const w = resolveWorker(l.worker_id, l.worker_user_id);
    manualKeys.add(`${workerKey(l.worker_id, l.worker_user_id)}|${date}`);

    const siteId = l.site_id ?? null;
    if (siteIdFilter && siteId !== siteIdFilter) continue;

    const hours = round2(Number(l.hours_worked || 0));
    const rate = Number(l.hourly_cost ?? w?.hourly_cost ?? 0);
    const siteInfo = l.construction_sites || (siteId && siteMap[siteId] ? siteMap[siteId] : null);

    out.push({
      id: l.id || `ml-${workerKey(l.worker_id, l.worker_user_id)}-${date}`,
      from_timbrature: false,
      site_id: siteId,
      worker_id: w?.id ?? l.worker_id ?? null,
      worker_user_id: w?.user_id ?? l.worker_user_id ?? null,
      worker_name: workerName(w),
      work_date: date,
      start_time: l.start_time ?? null,
      end_time: l.end_time ?? null,
      break_minutes: Number(l.break_minutes || 0),
      hours_worked: hours,
      hourly_cost: rate,
      labor_cost: round2(hours * rate),
      notes: l.notes ?? null,
      materials_used: l.materials_used ?? null,
      construction_sites: siteInfo,
      site_work_photos: l.site_work_photos,
    });
  }

  // Raggruppa le timbrature per operaio + giorno (tutte le tappe del giorno, anche quelle con site_id null)
  const byDay = new Map<string, (TimeEntry & { worker_id?: string | null })[]>();
  for (const e of timeEntries) {
    const date = String(e.event_date || '').slice(0, 10);
    if (!date) continue;
    const key = `${workerKey(e.worker_id, e.user_id)}|${date}`;
    const arr = byDay.get(key);
    if (arr) arr.push(e);
    else byDay.set(key, [e]);
  }

  for (const [key, entries] of byDay) {
    if (manualKeys.has(key)) continue;
    const s = summarizeDay(entries);
    const hours = round2(s.siteMinutes / 60);
    if (hours <= 0) continue;

    const siteId = entries.find((e) => e.site_id)?.site_id ?? null;
    if (siteIdFilter && siteId !== siteIdFilter) continue;

    const sample = entries[0];
    const date = String(sample?.event_date || '').slice(0, 10);
    const w = resolveWorker(sample?.worker_id, sample?.user_id);
    const rate = Number(w?.hourly_cost ?? 0);
    const sorted = [...entries].sort((a, b) => a.event_at.localeCompare(b.event_at));
    const arrive = sorted.find((e) => e.event_type === 'arrive_site');
    const leave = [...sorted].reverse().find((e) => e.event_type === 'leave_site');
    const siteInfo = siteId && siteMap[siteId] ? siteMap[siteId] : null;

    out.push({
      id: `tb-${key}`,
      from_timbrature: true,
      site_id: siteId,
      worker_id: w?.id ?? sample?.worker_id ?? null,
      worker_user_id: w?.user_id ?? sample?.user_id ?? null,
      worker_name: workerName(w),
      work_date: date,
      start_time: arrive ? formatTime(arrive.event_at) : null,
      end_time: leave ? formatTime(leave.event_at) : null,
      break_minutes: s.pauseMinutes,
      hours_worked: hours,
      hourly_cost: rate,
      labor_cost: round2(hours * rate),
      notes: 'Da timbrature',
      construction_sites: siteInfo,
    });
  }

  return out.sort((a, b) => b.work_date.localeCompare(a.work_date));
}

export const sumWorkedHours = (rows: UnifiedWorkLog[]): number =>
  round2(rows.reduce((s, r) => s + r.hours_worked, 0));

export const sumLaborCost = (rows: UnifiedWorkLog[]): number =>
  round2(rows.reduce((s, r) => s + r.labor_cost, 0));

export function groupHoursBySite(rows: UnifiedWorkLog[]): Map<string, { hours: number; laborCost: number }> {
  const m = new Map<string, { hours: number; laborCost: number }>();
  for (const r of rows) {
    if (!r.site_id) continue;
    const prev = m.get(r.site_id) || { hours: 0, laborCost: 0 };
    prev.hours = round2(prev.hours + r.hours_worked);
    prev.laborCost = round2(prev.laborCost + r.labor_cost);
    m.set(r.site_id, prev);
  }
  return m;
}