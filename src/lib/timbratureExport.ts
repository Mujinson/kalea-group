import * as XLSX from 'xlsx';
import { STAGE_ORDER, EVENT_LABELS, type TimeEntry, type TimbratureEventType } from './timbrature';

/** Minuti dal mezzanotte (ora italiana) di un timestamp ISO. */
export function minutesOfDayRome(iso: string): number {
  const parts = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return h * 60 + m;
}

/** Arrotonda alla mezz'ora più vicina (a metà, per eccesso): 9:02/9:07/9:14 → 9:00, 9:15 → 9:30. */
export function roundToHalfHour(minutes: number): number {
  return Math.round(minutes / 30) * 30;
}

/** "09:02" / "9.02" / "9,02" → minuti dal mezzanotte; null se non valido. */
export function parseHHMM(text: unknown): number | null {
  const m = String(text ?? '').trim().match(/^(\d{1,2})[:.,](\d{2})(?::\d{2})?$/);
  if (!m) return null;
  const h = Number(m[1]); const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** "8,50" / "8.5" / "8:30" → ore decimali; null se non valido. */
export function parseHours(text: unknown): number | null {
  if (typeof text === 'number') return Number.isFinite(text) ? text : null;
  const s = String(text ?? '').trim();
  if (!s) return null;
  if (s.includes(':')) {
    const m = s.match(/^(\d+):(\d{2})$/);
    return m ? Number(m[1]) + Number(m[2]) / 60 : null;
  }
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export interface DayTimes {
  stages: Record<TimbratureEventType, number | null>; // minuti dal mezzanotte
  pauseMinutes: number;
  totalHours: number | null; // Partenza casa → Arrivo casa − pausa
  siteHours: number | null;  // Arrivo cantiere → Fine cantiere − pausa
  travelHours: number | null;
}

/** Calcola orari e ore di una giornata; con rounded=true usa gli orari arrotondati a 30 min. */
export function computeDayTimes(entries: Pick<TimeEntry, 'event_type' | 'event_at'>[], rounded = false): DayTimes {
  const stages = {} as Record<TimbratureEventType, number | null>;
  STAGE_ORDER.forEach((t) => (stages[t] = null));
  [...entries].sort((a, b) => a.event_at.localeCompare(b.event_at)).forEach((e) => {
    if (stages[e.event_type] == null) {
      const m = minutesOfDayRome(e.event_at);
      stages[e.event_type] = rounded ? roundToHalfHour(m) : m;
    }
  });
  const s = stages;
  const pause = s.pause_start != null && s.pause_end != null ? Math.max(0, s.pause_end - s.pause_start) : 0;
  const total = s.start_home != null && s.arrive_home != null ? Math.max(0, s.arrive_home - s.start_home - pause) / 60 : null;
  const site = s.arrive_site != null && s.leave_site != null ? Math.max(0, s.leave_site - s.arrive_site - pause) / 60 : null;
  const travel = total != null && site != null ? Math.max(0, total - site) : null;
  return { stages, pauseMinutes: pause, totalHours: total, siteHours: site, travelHours: travel };
}

export interface ExportDay { date: string; name: string; complete: boolean; entries: TimeEntry[] }

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Crea e scarica un XLSX con orari veri (hh:mm) e ore numeriche sommabili. */
export function downloadTimbratureXLSX(days: ExportDay[], filename: string, rounded: boolean) {
  const header = ['Data', 'Posatore', 'Stato', ...STAGE_ORDER.map((t) => EVENT_LABELS[t].short),
    'Pausa (min)', 'Ore totali (viaggio incluso)', 'Ore cantiere', 'Viaggio (ore)'];
  const aoa: (string | number | null)[][] = [header];
  days.forEach((d) => {
    const t = computeDayTimes(d.entries, rounded);
    aoa.push([
      d.date, d.name, d.complete ? 'Completato' : 'Incompleto',
      ...STAGE_ORDER.map((k) => (t.stages[k] == null ? null : (t.stages[k] as number) / 1440)),
      t.pauseMinutes,
      t.totalHours == null ? null : r2(t.totalHours),
      t.siteHours == null ? null : r2(t.siteHours),
      t.travelHours == null ? null : r2(t.travelHours),
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const n = days.length;
  const firstTime = 3, pauseCol = firstTime + STAGE_ORDER.length;
  for (let r = 1; r <= n; r++) {
    for (let c = firstTime; c < pauseCol; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell) { cell.t = 'n'; cell.z = 'hh:mm'; }
    }
    for (let c = pauseCol + 1; c <= pauseCol + 3; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell) cell.z = '0.00';
    }
  }
  const totRow = n + 1;
  ws[XLSX.utils.encode_cell({ r: totRow, c: 0 })] = { t: 's', v: 'TOTALE' };
  for (let c = pauseCol; c <= pauseCol + 3; c++) {
    const col = XLSX.utils.encode_col(c);
    ws[XLSX.utils.encode_cell({ r: totRow, c })] = { t: 'n', f: `SUM(${col}2:${col}${n + 1})`, z: c === pauseCol ? '0' : '0.00' };
  }
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totRow, c: pauseCol + 3 } });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, rounded ? 'Commercialista' : 'Timbrature');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
