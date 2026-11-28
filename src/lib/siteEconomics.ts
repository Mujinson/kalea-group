import { haversineMeters } from './geo';
import { computeMargin } from './margin';
import { summarizeDay, type TimeEntry } from './timbrature';

export const SITE_PROXIMITY_METERS = 3000;
export const NORMAL_DAILY_RATE = 260;
export const TRAVEL_DAILY_RATE = 350;
export const STANDARD_DAY_HOURS = 8;
export const BREAK_EVEN_EPSILON = 1;
export const DEFAULT_ORIGIN_COORDS = { lat: 45.7318, lng: 9.7276 }; // Alzano Lombardo (BG)

export type TravelMode = 'auto' | 'on' | 'off';
export type AttendanceDecision = 'ammessa' | 'esclusa';
export type AttendanceStatus = 'gps' | 'ammessa' | 'esclusa' | 'fuori_raggio';
export type EconomicsOutcome = 'utile' | 'perdita' | 'pari';

export interface SiteMaterialRow {
  total_cost?: number | string | null;
  quantity?: number | string | null;
  unit_cost?: number | string | null;
}

export interface SiteExpenseRow {
  amount?: number | string | null;
  notes?: string | null;
}

export interface SiteWorkerRow {
  id: string;
  user_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  hourly_cost?: number | string | null;
}

export interface AttendanceOverrideRow {
  worker_id: string;
  work_date: string;
  decision: AttendanceDecision;
  note?: string | null;
}

export interface SiteAttendanceDay {
  key: string;
  workerId: string | null;
  workerName: string;
  workDate: string;
  hours: number;
  regularHours: number;
  overtimeHours: number;
  minDistanceM: number | null;
  withinRadius: boolean;
  linkedToSite: boolean;
  status: AttendanceStatus;
  included: boolean;
  dailyRate: number;
  hourlyRate: number;
  cost: number;
  overrideDecision: AttendanceDecision | null;
  overrideNote: string | null;
}

const r2 = (v: number) => Math.round(v * 100) / 100;
const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const hasCoord = (v: unknown): v is number => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

export function resolveIsTravel(
  mode: TravelMode | null | undefined,
  siteCoords: { lat?: number | string | null; lng?: number | string | null },
  thresholdKm = 150,
  originCoords = DEFAULT_ORIGIN_COORDS
): { isTravel: boolean; distanceFromOriginKm: number | null } {
  let distanceFromOriginKm: number | null = null;
  if (hasCoord(siteCoords.lat) && hasCoord(siteCoords.lng)) {
    const meters = haversineMeters(originCoords.lat, originCoords.lng, Number(siteCoords.lat), Number(siteCoords.lng));
    distanceFromOriginKm = Math.round((meters / 1000) * 10) / 10;
  }
  if (mode === 'on') return { isTravel: true, distanceFromOriginKm };
  if (mode === 'off') return { isTravel: false, distanceFromOriginKm };
  return {
    isTravel: distanceFromOriginKm !== null && distanceFromOriginKm >= thresholdKm,
    distanceFromOriginKm,
  };
}

export function sumSiteMaterials(materials: SiteMaterialRow[]): number {
  return r2(
    materials.reduce((sum, m) => {
      const total = m.total_cost !== null && m.total_cost !== undefined && m.total_cost !== ''
        ? num(m.total_cost)
        : num(m.quantity) * num(m.unit_cost);
      return sum + total;
    }, 0)
  );
}

export function isPlannedExpense(notes?: string | null): boolean {
  return String(notes ?? '').trim().toUpperCase().startsWith('PREVISTO');
}

export function splitSiteExpenses(expenses: SiteExpenseRow[]) {
  let sustained = 0;
  let planned = 0;
  let sustainedCount = 0;
  let plannedCount = 0;
  for (const e of expenses) {
    const amt = num(e.amount);
    if (isPlannedExpense(e.notes)) {
      planned += amt;
      plannedCount += 1;
    } else {
      sustained += amt;
      sustainedCount += 1;
    }
  }
  return { sustained: r2(sustained), planned: r2(planned), sustainedCount, plannedCount };
}

export function classifyOutcome(margin: number, epsilon = BREAK_EVEN_EPSILON): EconomicsOutcome {
  if (margin > epsilon) return 'utile';
  if (margin < -epsilon) return 'perdita';
  return 'pari';
}

export interface ComputeSiteEconomicsInput {
  siteId: string;
  revenue: number;
  materials: SiteMaterialRow[];
  expenses: SiteExpenseRow[];
  timeEntries: (TimeEntry & { worker_id?: string | null })[];
  workers: SiteWorkerRow[];
  siteCoords: { lat?: number | string | null; lng?: number | string | null };
  overrides?: AttendanceOverrideRow[];
  isTravel: boolean;
  /** Override della tariffa giornaliera; passare null/0 per usare il fallback workers.hourly_cost × 8 */
  dailyRateOverride?: number | null;
  proximityMeters?: number;
}

export function computeSiteEconomics(input: ComputeSiteEconomicsInput) {
  const proximityM = input.proximityMeters ?? SITE_PROXIMITY_METERS;
  const siteLat = hasCoord(input.siteCoords.lat) ? Number(input.siteCoords.lat) : null;
  const siteLng = hasCoord(input.siteCoords.lng) ? Number(input.siteCoords.lng) : null;
  const hasSiteCoords = siteLat !== null && siteLng !== null;

  const workerById = new Map<string, SiteWorkerRow>();
  const workerByUser = new Map<string, SiteWorkerRow>();
  for (const w of input.workers) {
    workerById.set(w.id, w);
    if (w.user_id) workerByUser.set(w.user_id, w);
  }

  const resolveWorker = (workerId?: string | null, userId?: string | null) =>
    (workerId ? workerById.get(workerId) : undefined) || (userId ? workerByUser.get(userId) : undefined);

  const overrideMap = new Map<string, AttendanceOverrideRow>();
  for (const ov of input.overrides || []) {
    const d = String(ov.work_date || '').slice(0, 10);
    if (ov.worker_id && d) overrideMap.set(`${ov.worker_id}|${d}`, ov);
  }

  const byDay = new Map<string, (TimeEntry & { worker_id?: string | null })[]>();
  for (const e of input.timeEntries) {
    const date = String(e.event_date || '').slice(0, 10);
    if (!date) continue;
    const w = resolveWorker(e.worker_id, e.user_id);
    const wKey = w ? `w:${w.id}` : e.worker_id ? `w:${e.worker_id}` : `u:${e.user_id || 'unknown'}`;
    const key = `${wKey}|${date}`;
    const arr = byDay.get(key);
    if (arr) arr.push(e);
    else byDay.set(key, [e]);
  }

  const configuredDaily = input.dailyRateOverride !== undefined
    ? (input.dailyRateOverride && input.dailyRateOverride > 0 ? input.dailyRateOverride : null)
    : (input.isTravel ? TRAVEL_DAILY_RATE : NORMAL_DAILY_RATE);

  const allWorkerDays: SiteAttendanceDay[] = [];

  for (const [key, entries] of byDay) {
    const sample = entries[0];
    if (!sample) continue;
    const workDate = String(sample.event_date || '').slice(0, 10);
    const w = resolveWorker(sample.worker_id, sample.user_id);
    const workerId = w?.id ?? sample.worker_id ?? null;
    const workerName = w ? `${w.first_name || ''} ${w.last_name || ''}`.trim() || 'Operaio' : 'Operaio';

    let minDistanceM: number | null = null;
    if (hasSiteCoords) {
      for (const e of entries) {
        if (hasCoord(e.latitude) && hasCoord(e.longitude)) {
          const dist = haversineMeters(Number(e.latitude), Number(e.longitude), siteLat, siteLng);
          if (minDistanceM === null || dist < minDistanceM) minDistanceM = dist;
        }
      }
    }

    const withinRadius = minDistanceM !== null && minDistanceM <= proximityM;
    const linkedToSite = entries.some((e) => e.site_id === input.siteId);
    const ov = workerId ? overrideMap.get(`${workerId}|${workDate}`) : undefined;

    let status: AttendanceStatus;
    let included: boolean;
    if (ov?.decision === 'ammessa') {
      status = 'ammessa';
      included = true;
    } else if (ov?.decision === 'esclusa') {
      status = 'esclusa';
      included = false;
    } else if (withinRadius) {
      status = 'gps';
      included = true;
    } else {
      status = 'fuori_raggio';
      included = false;
    }

    const summary = summarizeDay(entries);
    const hours = r2(summary.siteMinutes / 60);
    const regularHours = r2(Math.min(hours, STANDARD_DAY_HOURS));
    const overtimeHours = r2(Math.max(0, hours - STANDARD_DAY_HOURS));

    const fallbackHourly = num(w?.hourly_cost);
    const dailyRate = configuredDaily !== null ? configuredDaily : r2(fallbackHourly * STANDARD_DAY_HOURS);
    const hourlyRate = dailyRate > 0 ? dailyRate / STANDARD_DAY_HOURS : 0;
    const cost = hours > 0 ? r2(hours * hourlyRate) : 0;

    allWorkerDays.push({
      key,
      workerId,
      workerName,
      workDate,
      hours,
      regularHours,
      overtimeHours,
      minDistanceM,
      withinRadius,
      linkedToSite,
      status,
      included,
      dailyRate: r2(dailyRate),
      hourlyRate: r2(hourlyRate),
      cost,
      overrideDecision: ov?.decision ?? null,
      overrideNote: ov?.note ?? null,
    });
  }

  allWorkerDays.sort((a, b) => b.workDate.localeCompare(a.workDate) || a.workerName.localeCompare(b.workerName));

  const relevantDays = allWorkerDays.filter((d) => d.withinRadius || d.linkedToSite || d.overrideDecision !== null);
  const includedList = relevantDays.filter((d) => d.included);

  const laborCost = r2(includedList.reduce((s, d) => s + d.cost, 0));
  const regularHours = r2(includedList.reduce((s, d) => s + d.regularHours, 0));
  const overtimeHours = r2(includedList.reduce((s, d) => s + d.overtimeHours, 0));
  const totalHours = r2(regularHours + overtimeHours);

  const materialsCost = sumSiteMaterials(input.materials);
  const expenses = splitSiteExpenses(input.expenses);

  const current = computeMargin(input.revenue, {
    materials: materialsCost,
    labor: laborCost,
    expenses: expenses.sustained,
  });
  const withPlanned = computeMargin(input.revenue, {
    materials: materialsCost,
    labor: laborCost,
    expenses: r2(expenses.sustained + expenses.planned),
  });

  return {
    revenue: current.revenue,
    materialsCost,
    laborCost,
    laborDaysCount: includedList.length,
    regularHours,
    overtimeHours,
    totalHours,
    sustainedExpenses: expenses.sustained,
    sustainedExpensesCount: expenses.sustainedCount,
    plannedExpenses: expenses.planned,
    plannedExpensesCount: expenses.plannedCount,
    totalCost: current.totalCost,
    margin: current.margin,
    marginPct: current.marginPct,
    outcome: classifyOutcome(current.margin),
    totalCostWithPlanned: withPlanned.totalCost,
    marginWithPlanned: withPlanned.margin,
    marginWithPlannedPct: withPlanned.marginPct,
    outcomeWithPlanned: classifyOutcome(withPlanned.margin),
    days: relevantDays,
    allWorkerDays,
  };
}