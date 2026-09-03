import { supabase } from '@/integrations/supabase/client';
import { haversineMeters, getCurrentPosition } from './geo';

export type TimbratureEventType =
  | 'start_home'
  | 'arrive_site'
  | 'pause_start'
  | 'pause_end'
  | 'leave_site'
  | 'arrive_home';

export const EVENT_LABELS: Record<TimbratureEventType, { label: string; short: string; icon: string }> = {
  start_home: { label: 'Parto da casa', short: 'Partenza casa', icon: '🚐' },
  arrive_site: { label: 'Arrivato in cantiere', short: 'Arrivo cantiere', icon: '📍' },
  pause_start: { label: 'Inizio pausa', short: 'Inizio pausa', icon: '☕' },
  pause_end: { label: 'Fine pausa', short: 'Fine pausa', icon: '▶️' },
  leave_site: { label: 'Fine giornata in cantiere', short: 'Fine cantiere', icon: '🚪' },
  arrive_home: { label: 'Arrivato a casa', short: 'Arrivo casa', icon: '🏠' },
};

export interface TimeEntry {
  id: string;
  user_id: string;
  event_type: TimbratureEventType;
  event_at: string;
  event_date: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  site_id: string | null;
  distance_from_site_m: number | null;
  is_at_site: boolean | null;
  notes: string | null;
}

/** Returns the single logical next event allowed after the last recorded one. */
export function nextEvents(lastType: TimbratureEventType | null, entries: TimeEntry[] = []): TimbratureEventType[] {
  const done = new Set(entries.map((e) => e.event_type));
  switch (lastType) {
    case null:
      return ['start_home'];
    case 'start_home':
      return ['arrive_site'];
    case 'arrive_site':
      // se la pausa è già stata fatta, il passo successivo è la fine cantiere
      return done.has('pause_end') ? ['leave_site'] : ['pause_start'];
    case 'pause_start':
      return ['pause_end'];
    case 'pause_end':
      return ['leave_site'];
    case 'leave_site':
      return ['arrive_home'];
    case 'arrive_home':
      return [];
    default:
      return [];
  }
}


/** Tappe obbligatorie non ancora timbrate nella giornata. */
export function missingRequired(entries: TimeEntry[]): TimbratureEventType[] {
  const done = new Set(entries.map((e) => e.event_type));
  return REQUIRED_EVENTS.filter((t) => !done.has(t));
}


interface RecordOptions {
  userId: string;
  eventType: TimbratureEventType;
  workerId?: string | null;
  site?: { id: string; latitude?: number | null; longitude?: number | null } | null;
  siteRadiusM?: number;
}

export async function recordTimbratura(opts: RecordOptions): Promise<{ entry: TimeEntry | null; gpsError: string | null }> {
  const { userId, eventType, workerId, site, siteRadiusM = 200 } = opts;

  let lat: number | null = null;
  let lng: number | null = null;
  let acc: number | null = null;
  let gpsError: string | null = null;

  try {
    const pos = await getCurrentPosition();
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    acc = pos.coords.accuracy ?? null;
  } catch (e: any) {
    gpsError = e?.message || 'GPS non disponibile';
  }

  let distance: number | null = null;
  let atSite: boolean | null = null;
  if (site && site.latitude != null && site.longitude != null && lat != null && lng != null) {
    distance = haversineMeters(lat, lng, site.latitude, site.longitude);
    atSite = distance <= siteRadiusM;
  }

  const { data, error } = await supabase
    .from('worker_time_entries' as any)
    .insert({
      user_id: userId,
      worker_id: workerId ?? null,
      event_type: eventType,
      latitude: lat,
      longitude: lng,
      accuracy_m: acc,
      site_id: site?.id ?? null,
      distance_from_site_m: distance,
      is_at_site: atSite,
    })
    .select()
    .single();

  if (error) throw error;
  return { entry: data as unknown as TimeEntry, gpsError };
}

export function todayKey(d = new Date()): string {
  // Local (browser) date, matches DB event_date default (Europe/Rome typical for IT users)
  return d.toISOString().slice(0, 10);
}

/** Tappe obbligatorie che ogni dipendente deve timbrare ogni giorno. */
export const REQUIRED_EVENTS: TimbratureEventType[] = [
  'start_home',
  'arrive_site',
  'pause_start',
  'pause_end',
  'leave_site',
  'arrive_home',
];


/** Ordine di visualizzazione delle tappe nel riepilogo giornaliero. */
export const STAGE_ORDER: TimbratureEventType[] = [
  'start_home',
  'arrive_site',
  'pause_start',
  'pause_end',
  'leave_site',
  'arrive_home',
];

export interface StageInfo {
  firstAt: string | null;
  lastAt: string | null;
  count: number;
}

export interface DayStages {
  stages: Record<TimbratureEventType, StageInfo>;
  missing: TimbratureEventType[];
  isComplete: boolean;
}

/** Tempi registrati per ogni tappa + stato completato/non completato della giornata. */
export function dayStages(entries: TimeEntry[]): DayStages {
  const stages = {} as Record<TimbratureEventType, StageInfo>;
  STAGE_ORDER.forEach((t) => (stages[t] = { firstAt: null, lastAt: null, count: 0 }));
  [...entries]
    .sort((a, b) => a.event_at.localeCompare(b.event_at))
    .forEach((e) => {
      const s = stages[e.event_type];
      if (!s) return;
      if (!s.firstAt) s.firstAt = e.event_at;
      s.lastAt = e.event_at;
      s.count += 1;
    });
  const missing = REQUIRED_EVENTS.filter((t) => stages[t].count === 0);
  return { stages, missing, isComplete: missing.length === 0 };
}

export function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

export interface DailySummary {
  totalMinutes: number;
  workMinutes: number;
  pauseMinutes: number;
  siteMinutes: number;
  travelMinutes: number;
  firstAt: string | null;
  lastAt: string | null;
}

export function summarizeDay(entries: TimeEntry[]): DailySummary {
  const sorted = [...entries].sort((a, b) => a.event_at.localeCompare(b.event_at));
  if (sorted.length === 0) {
    return { totalMinutes: 0, workMinutes: 0, pauseMinutes: 0, siteMinutes: 0, travelMinutes: 0, firstAt: null, lastAt: null };
  }
  const lastEventAt = sorted[sorted.length - 1].event_at;
  const lastTs = new Date(lastEventAt).getTime();

  let pause = 0;
  let site = 0;
  let pauseStart: number | null = null;
  let siteStart: number | null = null;
  for (const e of sorted) {
    const t = new Date(e.event_at).getTime();
    if (e.event_type === 'pause_start') pauseStart = t;
    if (e.event_type === 'pause_end' && pauseStart != null) {
      pause += (t - pauseStart) / 60000;
      pauseStart = null;
    }
    if (e.event_type === 'arrive_site') siteStart = t;
    if ((e.event_type === 'leave_site' || e.event_type === 'pause_start') && siteStart != null) {
      site += (t - siteStart) / 60000;
      siteStart = null;
    }
    if (e.event_type === 'pause_end') siteStart = t; // riprende conteggio cantiere
  }
  // Giornata incompleta: chiudo i periodi aperti all'ultima timbratura disponibile
  if (siteStart != null) site += Math.max(0, (lastTs - siteStart) / 60000);
  // una pausa aperta non viene conteggiata (nessuna fine pausa registrata)

  const first = sorted.find((e) => e.event_type === 'start_home') || sorted[0];
  const last = [...sorted].reverse().find((e) => e.event_type === 'arrive_home') || sorted[sorted.length - 1];

  // Viaggio = casa → primo arrivo cantiere + ultima uscita cantiere → casa
  const firstSite = sorted.find((e) => e.event_type === 'arrive_site');
  const lastLeave = [...sorted].reverse().find((e) => e.event_type === 'leave_site');
  const arriveHome = [...sorted].reverse().find((e) => e.event_type === 'arrive_home');
  let travel = 0;
  if (first && firstSite) {
    travel += Math.max(0, (new Date(firstSite.event_at).getTime() - new Date(first.event_at).getTime()) / 60000);
  }
  if (lastLeave && arriveHome) {
    travel += Math.max(0, (new Date(arriveHome.event_at).getTime() - new Date(lastLeave.event_at).getTime()) / 60000);
  }

  const totalMin = Math.max(0, (new Date(last.event_at).getTime() - new Date(first.event_at).getTime()) / 60000);
  const workMin = Math.max(0, totalMin - pause);

  return {
    totalMinutes: Math.round(totalMin),
    workMinutes: Math.round(workMin),
    pauseMinutes: Math.round(pause),
    siteMinutes: Math.round(site),
    travelMinutes: Math.round(travel),

    firstAt: first?.event_at || null,
    lastAt: last?.event_at || null,
  };
}


export function formatHM(minutes: number): string {
  if (!minutes || minutes < 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
