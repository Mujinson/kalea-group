import { addDays, differenceInCalendarDays, format, isWithinInterval, parseISO, startOfDay } from 'date-fns';

export type Crew = {
  id: string;
  name: string;
  color: string;
  max_workers: number;
  lead_worker_id: string | null;
  notes: string | null;
  active: boolean;
};

export type CrewMember = {
  id: string;
  crew_id: string;
  worker_id: string;
  role: string;
};

export type Assignment = {
  id: string;
  crew_id: string;
  site_id: string;
  start_date: string; // ISO date
  end_date: string;
  hours_per_day: number;
  notes: string | null;
};

export type Worker = {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

export type Site = {
  id: string;
  name?: string | null;
  city?: string | null;
  customer_id?: string | null;
  status?: string | null;
  priority?: string | null;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  estimated_hours?: number | null;
  address?: string | null;
  region?: string | null;
};

export const PRIORITY_COLORS: Record<string, string> = {
  bassa: '#16a34a',
  media: '#d97706',
  alta: '#ea580c',
  urgente: '#dc2626',
};

export const STATUS_LABEL: Record<string, string> = {
  da_iniziare: 'Da iniziare',
  in_corso: 'In corso',
  attivo: 'In corso',
  in_pausa: 'In pausa',
  completato: 'Completato',
  bloccato: 'Bloccato',
  pianificato: 'Pianificato',
};

export const STATUS_COLORS: Record<string, string> = {
  da_iniziare: '#9CA3AF',
  pianificato: '#9CA3AF',
  in_corso: '#3B82F6',
  attivo: '#3B82F6',
  in_pausa: '#F59E0B',
  completato: '#16A34A',
  bloccato: '#DC2626',
};

export function workerName(w?: Worker | null) {
  if (!w) return '—';
  if (w.full_name) return w.full_name;
  return `${w.first_name || ''} ${w.last_name || ''}`.trim() || '—';
}

export function assignmentContainsDay(a: Assignment, day: Date): boolean {
  const d = startOfDay(day);
  return isWithinInterval(d, {
    start: startOfDay(parseISO(a.start_date)),
    end: startOfDay(parseISO(a.end_date)),
  });
}

export function assignmentsOverlap(a: Assignment, b: Assignment): boolean {
  return !(parseISO(a.end_date) < parseISO(b.start_date) || parseISO(b.end_date) < parseISO(a.start_date));
}

export function shiftAssignment(a: Assignment, deltaDays: number): { start_date: string; end_date: string } {
  return {
    start_date: format(addDays(parseISO(a.start_date), deltaDays), 'yyyy-MM-dd'),
    end_date: format(addDays(parseISO(a.end_date), deltaDays), 'yyyy-MM-dd'),
  };
}

export function durationDays(a: Assignment): number {
  return differenceInCalendarDays(parseISO(a.end_date), parseISO(a.start_date)) + 1;
}

export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  return differenceInCalendarDays(parseISO(dateStr), startOfDay(new Date()));
}

export function formatDeadline(dateStr?: string | null): string {
  const d = daysUntil(dateStr);
  if (d === null) return '—';
  if (d === 0) return 'Scade oggi';
  if (d > 0) return `Scade tra ${d} ${d === 1 ? 'giorno' : 'giorni'}`;
  return `Scaduto da ${Math.abs(d)} ${Math.abs(d) === 1 ? 'giorno' : 'giorni'}`;
}

export type Conflict = {
  level: 'red' | 'amber';
  kind: string;
  message: string;
  ref?: string;
};

export function computeConflicts(
  assignments: Assignment[],
  crews: Crew[],
  crewMembers: CrewMember[],
  sites: Site[],
): Conflict[] {
  const out: Conflict[] = [];
  const crewById = new Map(crews.map((c) => [c.id, c]));
  const siteById = new Map(sites.map((s) => [s.id, s]));
  const membersByCrew = new Map<string, CrewMember[]>();
  crewMembers.forEach((m) => {
    if (!membersByCrew.has(m.crew_id)) membersByCrew.set(m.crew_id, []);
    membersByCrew.get(m.crew_id)!.push(m);
  });

  // Squadra > max
  crews.forEach((c) => {
    const n = (membersByCrew.get(c.id) || []).length;
    if (n > c.max_workers) {
      out.push({
        level: 'amber',
        kind: 'crew_over_capacity',
        message: `Squadra "${c.name}": ${n} operai (max ${c.max_workers})`,
        ref: c.id,
      });
    }
  });

  // Operaio in 2 cantieri overlap (stesso giorno) — basato su crew_assignments
  // Per ogni operaio raggruppo gli assignment delle sue crew, controllo overlap di date su site_id differenti
  const workerAssignments = new Map<string, Assignment[]>();
  crewMembers.forEach((m) => {
    const crewAs = assignments.filter((a) => a.crew_id === m.crew_id);
    if (!workerAssignments.has(m.worker_id)) workerAssignments.set(m.worker_id, []);
    workerAssignments.get(m.worker_id)!.push(...crewAs);
  });
  workerAssignments.forEach((list, workerId) => {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i].site_id !== list[j].site_id && assignmentsOverlap(list[i], list[j])) {
          out.push({
            level: 'red',
            kind: 'worker_double_booked',
            message: `Operaio in 2 cantieri sovrapposti`,
            ref: workerId,
          });
          return;
        }
      }
    }
  });

  // Cantiere senza assegnazione attiva nei prossimi 7 giorni (ma con deadline futura)
  const today = startOfDay(new Date());
  const in7 = addDays(today, 7);
  sites.forEach((s) => {
    if (!s.planned_end_date) return;
    const end = parseISO(s.planned_end_date);
    if (end < today) return;
    if ((s.status || '').toLowerCase() === 'completato') return;
    const has = assignments.some(
      (a) => a.site_id === s.id && !(parseISO(a.end_date) < today || parseISO(a.start_date) > in7),
    );
    if (!has) {
      out.push({
        level: 'red',
        kind: 'site_unassigned',
        message: `Cantiere "${s.name || s.city || '—'}" senza squadra nei prossimi 7gg`,
        ref: s.id,
      });
    }
  });

  // Cantiere non finirà entro deadline: ore previste > ore_assignment fino alla deadline
  sites.forEach((s) => {
    if (!s.planned_end_date || !s.estimated_hours) return;
    const end = parseISO(s.planned_end_date);
    if (end < today) return;
    const planned = assignments
      .filter((a) => a.site_id === s.id && parseISO(a.start_date) <= end)
      .reduce((acc, a) => {
        const effEnd = parseISO(a.end_date) > end ? end : parseISO(a.end_date);
        const days = differenceInCalendarDays(effEnd, parseISO(a.start_date)) + 1;
        const crewSize = (membersByCrew.get(a.crew_id) || []).length || 1;
        return acc + Math.max(0, days) * Number(a.hours_per_day || 8) * crewSize;
      }, 0);
    if (planned < Number(s.estimated_hours)) {
      out.push({
        level: 'amber',
        kind: 'deadline_at_risk',
        message: `"${s.name || s.city}": ore pianificate ${Math.round(planned)}h < stimate ${s.estimated_hours}h`,
        ref: s.id,
      });
    }
  });

  return out;
}

export function crewSaturation(
  crew: Crew,
  assignments: Assignment[],
  windowStart: Date,
  windowEnd: Date,
): { pct: number; hoursAssigned: number; capacity: number; activeSites: number; busyDays: number } {
  const totalDays = differenceInCalendarDays(windowEnd, windowStart) + 1;
  const capacity = totalDays * 8; // 8h/giorno per crew
  const crewAs = assignments.filter((a) => a.crew_id === crew.id);
  const busyDates = new Set<string>();
  let hours = 0;
  const sites = new Set<string>();
  crewAs.forEach((a) => {
    const s = parseISO(a.start_date);
    const e = parseISO(a.end_date);
    const from = s < windowStart ? windowStart : s;
    const to = e > windowEnd ? windowEnd : e;
    if (to < from) return;
    sites.add(a.site_id);
    for (let d = from; d <= to; d = addDays(d, 1)) {
      const key = format(d, 'yyyy-MM-dd');
      busyDates.add(key);
      hours += Number(a.hours_per_day || 8);
    }
  });
  const pct = capacity > 0 ? Math.min(100, Math.round((hours / capacity) * 100)) : 0;
  return { pct, hoursAssigned: hours, capacity, activeSites: sites.size, busyDays: busyDates.size };
}
