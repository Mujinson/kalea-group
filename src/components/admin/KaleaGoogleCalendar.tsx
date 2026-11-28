import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDays, addMonths, endOfMonth, endOfWeek, format, isSameMonth,
  startOfMonth, startOfWeek, subMonths,
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ExternalLink, List, MapPin, RefreshCw } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  htmlLink: string;
  allDay: boolean;
  startDate: string | null;
  endDate: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

/** Restituisce tutte le chiavi YYYY-MM-DD coperte da un evento (gestisce end.date esclusivo senza conversioni timezone). */
function eventCoveredDays(ev: GoogleCalendarEvent): string[] {
  if (ev.allDay && ev.startDate) {
    const days: string[] = [];
    const start = ev.startDate;
    const endExcl = ev.endDate && ev.endDate > start ? ev.endDate : null;
    if (!endExcl) return [start];
    let cur = new Date(`${start}T12:00:00Z`);
    const limit = new Date(`${endExcl}T12:00:00Z`);
    let guard = 0;
    while (cur < limit && guard < 90) {
      days.push(cur.toISOString().slice(0, 10));
      cur = new Date(cur.getTime() + 86400000);
      guard++;
    }
    return days.length > 0 ? days : [start];
  }
  if (ev.startDateTime) {
    const start = new Date(ev.startDateTime);
    const end = ev.endDateTime ? new Date(ev.endDateTime) : start;
    const startKey = format(start, 'yyyy-MM-dd');
    const endKey = format(end, 'yyyy-MM-dd');
    if (startKey === endKey || Number.isNaN(end.getTime())) return [startKey];
    const days: string[] = [];
    let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    let guard = 0;
    while (cur <= endDay && guard < 90) {
      days.push(format(cur, 'yyyy-MM-dd'));
      cur = addDays(cur, 1);
      guard++;
    }
    return days;
  }
  return [];
}

function formatEventTime(ev: GoogleCalendarEvent): string {
  if (ev.allDay) return 'Tutto il giorno';
  if (!ev.startDateTime) return '';
  const s = new Date(ev.startDateTime);
  const e = ev.endDateTime ? new Date(ev.endDateTime) : null;
  const sStr = format(s, 'HH:mm');
  return e && !Number.isNaN(e.getTime()) ? `${sStr} – ${format(e, 'HH:mm')}` : sStr;
}

export default function KaleaGoogleCalendar() {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [view, setView] = useState<'mese' | 'lista'>('mese');
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async (targetMonth: Date) => {
    setLoading(true);
    setError(null);
    try {
      const gridStart = startOfWeek(startOfMonth(targetMonth), { weekStartsOn: 1 });
      const gridEnd = endOfWeek(endOfMonth(targetMonth), { weekStartsOn: 1 });
      const { data, error: fnErr } = await supabase.functions.invoke('google-calendar-events', {
        body: { timeMin: gridStart.toISOString(), timeMax: gridEnd.toISOString() },
      });
      if (fnErr) {
        const details = fnErr instanceof FunctionsHttpError ? await fnErr.context.text() : fnErr.message;
        console.error('google-calendar-events failed:', details);
        let friendly = 'Impossibile caricare il calendario Google.';
        try {
          const parsed = JSON.parse(details);
          if (typeof parsed?.error === 'string' && parsed.error.trim()) friendly = parsed.error;
        } catch {
          // keep fallback
        }
        setError(friendly);
        setEvents([]);
        return;
      }
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (e) {
      console.error('google-calendar-events error:', e);
      setError('Impossibile caricare il calendario Google.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents(month);
  }, [month, loadEvents]);

  const todayKey = format(new Date(), 'yyyy-MM-dd');

  const eventsByDay = useMemo(() => {
    const map = new Map<string, GoogleCalendarEvent[]>();
    for (const ev of events) {
      for (const dayKey of eventCoveredDays(ev)) {
        const list = map.get(dayKey) || [];
        list.push(ev);
        map.set(dayKey, list);
      }
    }
    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days: Date[] = [];
    let cur = start;
    while (cur <= end) {
      days.push(cur);
      cur = addDays(cur, 1);
    }
    return days;
  }, [month]);

  const selectedDayEvents = eventsByDay.get(selectedDay) || [];

  const monthAgenda = useMemo(() => {
    const monthPrefix = format(month, 'yyyy-MM');
    return Array.from(eventsByDay.entries())
      .filter(([dayKey]) => dayKey.startsWith(monthPrefix))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [eventsByDay, month]);

  return (
    <div className="bg-white border rounded-xl overflow-hidden min-w-0">
      <div className="px-3 sm:px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-semibold truncate">Calendario Kalēa</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setView('mese')}
              className={`px-2 py-1 text-xs font-medium rounded ${view === 'mese' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              Mese
            </button>
            <button
              type="button"
              onClick={() => setView('lista')}
              className={`px-2 py-1 text-xs font-medium rounded inline-flex items-center gap-1 ${view === 'lista' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              <List className="w-3 h-3" /> Lista
            </button>
          </div>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => loadEvents(month)} title="Aggiorna">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <a
            href="https://calendar.google.com/calendar/u/0/r"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border"
          >
            Google <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-2 border-b bg-muted/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            onClick={() => {
              const now = new Date();
              setMonth(startOfMonth(now));
              setSelectedDay(format(now, 'yyyy-MM-dd'));
            }}
          >
            Oggi
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm font-semibold capitalize">{format(month, 'MMMM yyyy', { locale: it })}</div>
      </div>

      {error && (
        <div className="p-4 text-xs text-destructive bg-destructive/5 border-b flex items-center justify-between gap-2">
          <span>{error}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => loadEvents(month)}>Riprova</Button>
        </div>
      )}

      {view === 'mese' ? (
        <div className="p-2 sm:p-3 space-y-3">
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-[11px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
            {calendarDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDay.get(key) || [];
              const inMonth = isSameMonth(day, month);
              const isToday = key === todayKey;
              const isSelected = key === selectedDay;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(key)}
                  className={`min-h-[46px] sm:min-h-[68px] p-1 rounded-lg border text-left flex flex-col transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border/60 hover:bg-muted/40'
                  } ${!inMonth ? 'opacity-40' : ''}`}
                >
                  <span
                    className={`text-xs font-semibold w-5 h-5 inline-flex items-center justify-center rounded-full ${
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-0.5 sm:flex-col sm:gap-0.5 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev.id}
                        className="w-1.5 h-1.5 sm:w-full sm:h-auto sm:px-1 sm:py-0.5 rounded-full sm:rounded text-[10px] leading-tight truncate bg-primary/80 sm:bg-primary/10 sm:text-primary font-medium"
                        title={ev.summary}
                      >
                        <span className="hidden sm:inline">{ev.summary}</span>
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-muted-foreground font-medium leading-none">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t pt-2.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {format(new Date(`${selectedDay}T12:00:00`), "EEEE d MMMM", { locale: it })}
            </div>
            {loading ? (
              <p className="text-xs text-muted-foreground py-2">Caricamento eventi…</p>
            ) : selectedDayEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Nessun evento in questa giornata.</p>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map((ev) => (
                  <EventRow key={ev.id} ev={ev} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 max-h-[460px] overflow-y-auto space-y-3">
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Caricamento eventi…</p>
          ) : monthAgenda.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Nessun evento in questo mese.</p>
          ) : (
            monthAgenda.map(([dayKey, list]) => (
              <div key={dayKey} className="space-y-1.5">
                <div className={`text-xs font-semibold capitalize ${dayKey === todayKey ? 'text-primary' : 'text-muted-foreground'}`}>
                  {format(new Date(`${dayKey}T12:00:00`), 'EEEE d MMMM', { locale: it })}
                </div>
                {list.map((ev) => (
                  <EventRow key={`${dayKey}-${ev.id}`} ev={ev} />
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function EventRow({ ev }: { ev: GoogleCalendarEvent }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-primary">{formatEventTime(ev)}</div>
        <div className="text-sm font-medium text-foreground break-words">{ev.summary}</div>
        {ev.location && (
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5 break-words">
            <MapPin className="w-3 h-3 shrink-0" /> {ev.location}
          </div>
        )}
      </div>
      {ev.htmlLink && (
        <a
          href={ev.htmlLink}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground shrink-0 p-1"
          title="Apri in Google Calendar"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}