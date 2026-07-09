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
  leave_site: { label: 'Esco dal cantiere', short: 'Uscita cantiere', icon: '🚪' },
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

/** Returns the logical next events allowed after the last recorded one. */
export function nextEvents(lastType: TimbratureEventType | null): TimbratureEventType[] {
  switch (lastType) {
    case null:
      return ['start_home'];
    case 'start_home':
      return ['arrive_site', 'arrive_home'];
    case 'arrive_site':
      return ['pause_start', 'leave_site'];
    case 'pause_start':
      return ['pause_end'];
    case 'pause_end':
      return ['pause_start', 'leave_site'];
    case 'leave_site':
      return ['arrive_site', 'arrive_home'];
    case 'arrive_home':
      return []; // giornata chiusa
  }
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

export interface DailySummary {
  totalMinutes: number;
  workMinutes: number;
  pauseMinutes: number;
  siteMinutes: number;
  firstAt: string | null;
  lastAt: string | null;
}

export function summarizeDay(entries: TimeEntry[]): DailySummary {
  const sorted = [...entries].sort((a, b) => a.event_at.localeCompare(b.event_at));
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
  const first = sorted.find((e) => e.event_type === 'start_home');
  const last = [...sorted].reverse().find((e) => e.event_type === 'arrive_home');
  const totalMin = first && last ? (new Date(last.event_at).getTime() - new Date(first.event_at).getTime()) / 60000 : 0;
  const workMin = Math.max(0, totalMin - pause);
  return {
    totalMinutes: Math.round(totalMin),
    workMinutes: Math.round(workMin),
    pauseMinutes: Math.round(pause),
    siteMinutes: Math.round(site),
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
