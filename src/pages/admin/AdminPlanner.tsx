import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/fetchAllRows';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  addDays, addMonths, addWeeks, addYears, differenceInCalendarDays, eachDayOfInterval,
  endOfMonth, endOfWeek, endOfYear, format, isSameMonth, parseISO, startOfMonth, startOfWeek,
  startOfYear, subMonths, subWeeks, subYears,
} from 'date-fns';
import { it } from 'date-fns/locale';
import {
  AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Plus, Users as UsersIcon,
  HardHat, Clock, TrendingUp, Layers, Settings2, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Crew, CrewMember, Assignment, Site, Worker, computeConflicts, crewSaturation,
  workerName, durationDays, formatDeadline, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABEL, assignmentContainsDay, shiftAssignment,
} from '@/lib/planner';
import CrewManagerDialog from '@/components/admin/planner/CrewManagerDialog';
import AssignmentDialog from '@/components/admin/planner/AssignmentDialog';

type ViewMode = 'giorno' | 'settimana' | 'mese' | 'anno' | 'gantt' | 'carico';

const VIEW_LABELS: Record<ViewMode, string> = {
  giorno: 'Giorno', settimana: 'Settimana', mese: 'Mese', anno: 'Anno', gantt: 'Gantt', carico: 'Carico',
};

const KPI = ({ icon: Icon, label, value, color = '#1A1A2E' }: any) => (
  <div className="bg-white border rounded-md px-3 py-2 flex items-center gap-3">
    <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: color + '15' }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-xl font-bold tabular-nums leading-tight">{value}</div>
    </div>
  </div>
);

const StatusPill = ({ status }: { status?: string | null }) => {
  const s = (status || 'da_iniziare').toLowerCase();
  const color = STATUS_COLORS[s] || '#9CA3AF';
  return <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{ background: color + '20', color }}>{STATUS_LABEL[s] || s}</span>;
};

const PriorityDot = ({ priority }: { priority?: string | null }) => {
  const p = (priority || 'media').toLowerCase();
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[p] || '#9CA3AF' }} />;
};

// ──────────────────────────────────────────────────────────────
// Draggable Crew badge / Droppable site or day cell
// ──────────────────────────────────────────────────────────────
function DraggableAssignment({ assignment, crew, members, workers, compact }: {
  assignment: Assignment; crew: Crew; members: CrewMember[]; workers: Worker[]; compact?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `assign:${assignment.id}`,
    data: { type: 'assignment', assignment },
  });
  const crewMembers = members.filter((m) => m.crew_id === crew.id);
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing rounded px-1.5 py-1 select-none ${isDragging ? 'opacity-40' : ''}`}
      style={{ background: crew.color + '20', borderLeft: `3px solid ${crew.color}` }}
      title={crew.name}
    >
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ background: crew.color }} />
        <span className="text-[10px] font-bold uppercase tracking-wide">{crew.name}</span>
        <span className="text-[9px] text-muted-foreground">({crewMembers.length})</span>
      </div>
      {!compact && (
        <div className="text-[9px] text-muted-foreground truncate">
          {crewMembers.slice(0, 3).map((m) => workerName(workers.find((w) => w.id === m.worker_id))).join(', ')}
          {crewMembers.length > 3 && ` +${crewMembers.length - 3}`}
        </div>
      )}
    </div>
  );
}

function DroppableCell({ id, data, children, className, style }: any) {
  const { isOver, setNodeRef } = useDroppable({ id, data });
  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? 'ring-2 ring-blue-400 ring-inset' : ''}`} style={style}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────

export default function AdminPlanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [view, setView] = useState<ViewMode>('settimana');
  const [cursor, setCursor] = useState<Date>(new Date());
  const [crews, setCrews] = useState<Crew[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [crewDialog, setCrewDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState<null | { crew_id?: string; site_id?: string; start_date?: string }>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Filtri
  const [filterCrew, setFilterCrew] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  const fetchAll = useCallback(async () => {
    const [cs, cm, ca, st, wk, cu] = await Promise.all([
      fetchAllRows((supabase as any).from('crews').select('*').order('name')),
      fetchAllRows((supabase as any).from('crew_members').select('*')),
      fetchAllRows((supabase as any).from('crew_assignments').select('*')),
      fetchAllRows((supabase as any).from('construction_sites').select('*')),
      fetchAllRows((supabase as any).from('workers').select('id, full_name, first_name, last_name')),
      fetchAllRows((supabase as any).from('customers').select('id, name, full_name')),
    ]);
    setCrews(cs || []); setCrewMembers(cm || []); setAssignments(ca || []);
    setSites(st || []); setWorkers(wk || []); setCustomers(cu || []);
  }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const customerName = (id?: string | null) => {
    if (!id) return '';
    const c: any = customers.find((x) => x.id === id);
    return c?.name || c?.full_name || '';
  };

  // Filtered sites/assignments
  const filteredSites = useMemo(() => sites.filter((s) => {
    if (filterStatus && (s.status || '').toLowerCase() !== filterStatus) return false;
    if (filterPriority && (s.priority || '').toLowerCase() !== filterPriority) return false;
    return true;
  }), [sites, filterStatus, filterPriority]);

  const filteredAssignments = useMemo(() => assignments.filter((a) => {
    if (filterCrew && a.crew_id !== filterCrew) return false;
    if (!filteredSites.some((s) => s.id === a.site_id)) return false;
    return true;
  }), [assignments, filterCrew, filteredSites]);

  // KPI
  const kpis = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const activeSites = sites.filter((s) => ['attivo', 'in_corso'].includes((s.status || '').toLowerCase()));
    const todaysAssign = assignments.filter((a) => a.start_date <= today && a.end_date >= today);
    const busyCrewIds = new Set(todaysAssign.map((a) => a.crew_id));
    const workersToday = new Set<string>();
    todaysAssign.forEach((a) => crewMembers.filter((m) => m.crew_id === a.crew_id).forEach((m) => workersToday.add(m.worker_id)));
    const freeCrews = crews.filter((c) => c.active && !busyCrewIds.has(c.id)).length;
    const overdue = sites.filter((s) => s.planned_end_date && s.planned_end_date < today && (s.status || '').toLowerCase() !== 'completato').length;
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
    const we = endOfWeek(new Date(), { weekStartsOn: 1 });
    let weekHours = 0;
    assignments.forEach((a) => {
      const s = parseISO(a.start_date) < ws ? ws : parseISO(a.start_date);
      const e = parseISO(a.end_date) > we ? we : parseISO(a.end_date);
      if (e < s) return;
      const days = differenceInCalendarDays(e, s) + 1;
      const crewSize = crewMembers.filter((m) => m.crew_id === a.crew_id).length || 1;
      weekHours += days * Number(a.hours_per_day || 8) * crewSize;
    });
    const sat = crews.length
      ? Math.round(crews.reduce((acc, c) => acc + crewSaturation(c, assignments, ws, we).pct, 0) / crews.length)
      : 0;
    return { active: activeSites.length, workersToday: workersToday.size, freeCrews, overdue, weekHours: Math.round(weekHours), sat };
  }, [sites, assignments, crews, crewMembers]);

  const conflicts = useMemo(() => computeConflicts(assignments, crews, crewMembers, sites), [assignments, crews, crewMembers, sites]);

  // ────────────── DnD ──────────────
  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const data: any = active.data.current;
    const tgt: any = over.data.current;
    if (data?.type !== 'assignment') return;
    const a: Assignment = data.assignment;

    let updates: Partial<Assignment> | null = null;
    if (tgt?.type === 'day') {
      // Sposta nello stesso cantiere a un nuovo giorno → shift conservando durata
      const newStart = tgt.date as string;
      const delta = differenceInCalendarDays(parseISO(newStart), parseISO(a.start_date));
      if (delta === 0 && tgt.site_id === a.site_id) return;
      updates = { ...shiftAssignment(a, delta), site_id: tgt.site_id || a.site_id };
    } else if (tgt?.type === 'site') {
      if (tgt.site_id === a.site_id) return;
      updates = { site_id: tgt.site_id };
    }
    if (!updates) return;
    // Ottimistico
    setAssignments((prev) => prev.map((x) => x.id === a.id ? { ...x, ...updates! } : x));
    const { error } = await (supabase as any).from('crew_assignments').update(updates).eq('id', a.id);
    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
      fetchAll();
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm('Eliminare assegnazione?')) return;
    setAssignments((p) => p.filter((x) => x.id !== id));
    await (supabase as any).from('crew_assignments').delete().eq('id', id);
  };

  // ────────────── Navigation ──────────────
  const periodLabel = useMemo(() => {
    if (view === 'giorno') return format(cursor, "EEEE d MMMM yyyy", { locale: it });
    if (view === 'settimana') {
      const ws = startOfWeek(cursor, { weekStartsOn: 1 });
      const we = endOfWeek(cursor, { weekStartsOn: 1 });
      return `${format(ws, 'd MMM', { locale: it })} → ${format(we, 'd MMM yyyy', { locale: it })}`;
    }
    if (view === 'mese') return format(cursor, 'MMMM yyyy', { locale: it });
    if (view === 'anno') return format(cursor, 'yyyy');
    return format(cursor, 'MMMM yyyy', { locale: it });
  }, [cursor, view]);

  const shift = (dir: number) => {
    if (view === 'giorno') setCursor((d) => addDays(d, dir));
    else if (view === 'settimana') setCursor((d) => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1));
    else if (view === 'mese' || view === 'gantt') setCursor((d) => dir > 0 ? addMonths(d, 1) : subMonths(d, 1));
    else if (view === 'anno') setCursor((d) => dir > 0 ? addYears(d, 1) : subYears(d, 1));
  };

  // ────────────── Views ──────────────
  // Google-Calendar style time grid (06:00 → 22:00)
  const HOUR_START = 6;
  const HOUR_END = 22;
  const HOUR_PX = 48;
  const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  const TimeColumn = ({ day, assignsByDay }: { day: Date; assignsByDay: Assignment[] }) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const isToday = format(new Date(), 'yyyy-MM-dd') === dayStr;
    const now = new Date();
    const nowOffset = isToday ? (now.getHours() + now.getMinutes() / 60 - HOUR_START) * HOUR_PX : -1;
    return (
      <div className="relative border-l" style={{ height: HOURS.length * HOUR_PX }}>
        {/* Hour grid lines + clickable slots */}
        {HOURS.map((h) => (
          <button
            key={h}
            onClick={() => setAssignDialog({ start_date: dayStr, end_date: dayStr } as any)}
            className="absolute left-0 right-0 border-t border-border/60 hover:bg-blue-50/60 transition-colors"
            style={{ top: (h - HOUR_START) * HOUR_PX, height: HOUR_PX }}
            title={`Crea evento ${dayStr} ${String(h).padStart(2, '0')}:00`}
          />
        ))}
        {/* Now indicator */}
        {nowOffset >= 0 && nowOffset <= HOURS.length * HOUR_PX && (
          <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: nowOffset }}>
            <div className="h-px bg-red-500" />
            <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
          </div>
        )}
        {/* Events */}
        {assignsByDay.map((a, idx) => {
          const c = crews.find((x) => x.id === a.crew_id);
          if (!c) return null;
          const s = sites.find((x) => x.id === a.site_id);
          const startH = 8; // default 08:00
          const dur = Math.min(HOUR_END - startH, Number(a.hours_per_day || 8));
          const top = (startH - HOUR_START) * HOUR_PX;
          const height = dur * HOUR_PX - 2;
          const overlapping = assignsByDay.length;
          const width = overlapping > 1 ? `calc(${100 / overlapping}% - 2px)` : 'calc(100% - 4px)';
          const left = overlapping > 1 ? `calc(${(100 / overlapping) * idx}% + 1px)` : '2px';
          return (
            <button
              key={a.id}
              onClick={(e) => { e.stopPropagation(); s && setSelectedSite(s); }}
              className="absolute rounded px-1.5 py-1 text-left overflow-hidden shadow-sm hover:shadow-md transition-shadow z-10"
              style={{ top, height, left, width, background: c.color + 'E6', color: 'white', borderLeft: `3px solid ${c.color}` }}
            >
              <div className="text-[10px] font-bold uppercase truncate">{c.name}</div>
              <div className="text-[9px] opacity-90 truncate">{s?.name || s?.city}</div>
              <div className="text-[9px] opacity-75">{String(startH).padStart(2, '0')}:00 — {String(startH + dur).padStart(2, '0')}:00</div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderSettimana = () => {
    const ws = startOfWeek(cursor, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: ws, end: endOfWeek(cursor, { weekStartsOn: 1 }) });
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return (
      <div className="bg-white border rounded-md overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b sticky top-0 bg-white z-10">
          <div />
          {days.map((d) => {
            const ds = format(d, 'yyyy-MM-dd');
            const isToday = ds === todayStr;
            return (
              <div key={ds} className={`p-2 text-center border-l ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{format(d, 'EEE', { locale: it })}</div>
                <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : ''}`}>{format(d, 'd')}</div>
              </div>
            );
          })}
        </div>
        {/* Body */}
        <div className="overflow-auto max-h-[70vh]">
          <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
            {/* Hours gutter */}
            <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
              {HOURS.map((h) => (
                <div key={h} className="absolute left-0 right-0 text-[10px] text-muted-foreground text-right pr-1.5 -mt-1.5" style={{ top: (h - HOUR_START) * HOUR_PX }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
            {days.map((d) => {
              const dayAssigns = filteredAssignments.filter((a) => assignmentContainsDay(a, d));
              return <TimeColumn key={d.toISOString()} day={d} assignsByDay={dayAssigns} />;
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderGiorno = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const ds = format(cursor, 'yyyy-MM-dd');
    const isToday = ds === todayStr;
    const dayAssigns = filteredAssignments.filter((a) => assignmentContainsDay(a, cursor));
    return (
      <div className="bg-white border rounded-md overflow-hidden">
        <div className="grid grid-cols-[60px_1fr] border-b sticky top-0 bg-white z-10">
          <div />
          <div className={`p-2 text-center border-l ${isToday ? 'bg-blue-50' : ''}`}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{format(cursor, 'EEEE', { locale: it })}</div>
            <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : ''}`}>{format(cursor, 'd MMMM', { locale: it })}</div>
          </div>
        </div>
        <div className="overflow-auto max-h-[70vh]">
          <div className="grid grid-cols-[60px_1fr]">
            <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
              {HOURS.map((h) => (
                <div key={h} className="absolute left-0 right-0 text-[10px] text-muted-foreground text-right pr-1.5 -mt-1.5" style={{ top: (h - HOUR_START) * HOUR_PX }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
            <TimeColumn day={cursor} assignsByDay={dayAssigns} />
          </div>
        </div>
      </div>
    );
  };

  const renderMese = () => {
    const ms = startOfMonth(cursor);
    const me = endOfMonth(cursor);
    const start = startOfWeek(ms, { weekStartsOn: 1 });
    const end = endOfWeek(me, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    return (
      <div className="bg-white border rounded-md overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
            <div key={d} className="p-2 text-center text-[10px] uppercase font-bold tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-border">
          {days.map((d) => {
            const dayStr = format(d, 'yyyy-MM-dd');
            const inMonth = isSameMonth(d, cursor);
            const dayAssigns = filteredAssignments.filter((a) => assignmentContainsDay(a, d));
            const isToday = format(new Date(), 'yyyy-MM-dd') === dayStr;
            return (
              <div
                key={dayStr}
                onClick={() => { setCursor(d); setView('giorno'); }}
                className={`bg-white min-h-[90px] p-1 cursor-pointer hover:bg-blue-50/60 transition-colors ${inMonth ? '' : 'opacity-40'} ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
              >
                <div className={`text-[10px] font-bold mb-1 inline-flex items-center justify-center ${isToday ? 'bg-blue-600 text-white rounded-full w-5 h-5' : ''}`}>{format(d, 'd')}</div>
                <div className="space-y-0.5">
                  {dayAssigns.slice(0, 3).map((a) => {
                    const c = crews.find((x) => x.id === a.crew_id);
                    const s = sites.find((x) => x.id === a.site_id);
                    if (!c) return null;
                    return (
                      <div key={a.id} onClick={(e) => { e.stopPropagation(); s && setSelectedSite(s); }} className="text-[9px] truncate cursor-pointer px-1 rounded" style={{ background: c.color + '20', borderLeft: `2px solid ${c.color}` }} title={`${c.name} → ${s?.name || s?.city}`}>
                        {c.name} · {s?.name || s?.city}
                      </div>
                    );
                  })}
                  {dayAssigns.length > 3 && <div className="text-[9px] text-muted-foreground">+{dayAssigns.length - 3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnno = () => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(cursor.getFullYear(), i, 1));
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {months.map((m) => {
          const ms = startOfMonth(m), me = endOfMonth(m);
          const count = filteredAssignments.filter((a) => !(parseISO(a.end_date) < ms || parseISO(a.start_date) > me)).length;
          const intensity = Math.min(1, count / 20);
          return (
            <button key={m.toISOString()} onClick={() => { setCursor(m); setView('mese'); }} className="bg-white border rounded-md p-3 text-left hover:shadow-md transition-all">
              <div className="text-xs uppercase font-bold text-muted-foreground">{format(m, 'MMMM', { locale: it })}</div>
              <div className="text-2xl font-bold mt-1">{count}</div>
              <div className="text-[10px] text-muted-foreground">assegnazioni</div>
              <div className="h-1.5 mt-2 rounded-full" style={{ background: `rgba(59,130,246,${0.15 + intensity * 0.6})` }} />
            </button>
          );
        })}
      </div>
    );
  };

  const renderGantt = () => {
    const ms = startOfMonth(cursor), me = endOfMonth(cursor);
    const days = eachDayOfInterval({ start: ms, end: me });
    const dayW = 28;
    const sitesWithAssign = filteredSites.filter((s) => filteredAssignments.some((a) => a.site_id === s.id && !(parseISO(a.end_date) < ms || parseISO(a.start_date) > me)));
    if (!sitesWithAssign.length) return <EmptyState />;
    return (
      <div className="overflow-auto bg-white border rounded-md">
        <div style={{ minWidth: 200 + days.length * dayW }}>
          <div className="flex sticky top-0 bg-muted/50 z-10 border-b">
            <div style={{ width: 200 }} className="p-2 text-[10px] uppercase font-bold tracking-wider">Cantiere</div>
            {days.map((d) => (
              <div key={d.toISOString()} style={{ width: dayW }} className="p-1 text-center text-[10px] border-l">
                <div className="text-muted-foreground">{format(d, 'EEEEE', { locale: it })}</div>
                <div className="font-bold">{format(d, 'd')}</div>
              </div>
            ))}
          </div>
          {sitesWithAssign.map((s) => {
            const sAssigns = filteredAssignments.filter((a) => a.site_id === s.id);
            return (
              <div key={s.id} className="flex border-b hover:bg-muted/20">
                <div style={{ width: 200 }} className="p-2 border-r cursor-pointer" onClick={() => setSelectedSite(s)}>
                  <div className="flex items-center gap-1.5"><PriorityDot priority={s.priority} /><span className="text-xs font-semibold truncate">{s.name || s.city}</span></div>
                  <div className="text-[10px] text-muted-foreground truncate">{customerName(s.customer_id)}</div>
                </div>
                <div className="relative" style={{ width: days.length * dayW, height: 48 }}>
                  {sAssigns.map((a, idx) => {
                    const c = crews.find((x) => x.id === a.crew_id);
                    if (!c) return null;
                    const startD = parseISO(a.start_date) < ms ? ms : parseISO(a.start_date);
                    const endD = parseISO(a.end_date) > me ? me : parseISO(a.end_date);
                    const offset = differenceInCalendarDays(startD, ms) * dayW;
                    const width = (differenceInCalendarDays(endD, startD) + 1) * dayW;
                    return (
                      <div key={a.id} className="absolute text-[10px] font-bold text-white rounded cursor-pointer px-1.5 flex items-center"
                        style={{ left: offset, width: width - 2, top: 6 + idx * 18, height: 16, background: c.color }}
                        title={`${c.name}: ${a.start_date} → ${a.end_date}`}
                        onClick={() => { if (confirm(`Eliminare ${c.name}?`)) deleteAssignment(a.id); }}
                      >
                        {c.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCarico = () => {
    const ws = startOfWeek(cursor, { weekStartsOn: 1 });
    const we = endOfWeek(cursor, { weekStartsOn: 1 });
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {crews.map((c) => {
          const sat = crewSaturation(c, assignments, ws, we);
          const members = crewMembers.filter((m) => m.crew_id === c.id);
          const color = sat.pct >= 100 ? '#DC2626' : sat.pct >= 80 ? '#F59E0B' : '#16A34A';
          return (
            <div key={c.id} className="bg-white border rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{ background: c.color }} />
                  <span className="font-bold">{c.name}</span>
                  <Badge variant="outline">{members.length} operai</Badge>
                </div>
                <span className="text-2xl font-bold tabular-nums" style={{ color }}>{sat.pct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, sat.pct)}%`, background: color }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div><div className="text-muted-foreground">Cantieri</div><div className="font-bold text-base">{sat.activeSites}</div></div>
                <div><div className="text-muted-foreground">Ore sett.</div><div className="font-bold text-base">{sat.hoursAssigned}</div></div>
                <div><div className="text-muted-foreground">Giorni</div><div className="font-bold text-base">{sat.busyDays}/7</div></div>
              </div>
            </div>
          );
        })}
        {!crews.length && <EmptyState msg="Nessuna squadra. Creane una con 'Squadre'." />}
      </div>
    );
  };

  // ────────────── Render ──────────────
  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="p-4 md:p-6 space-y-4 min-h-screen bg-[#FAF9F6]">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="w-6 h-6" />Planner Operativo</h1>
            <p className="text-sm text-muted-foreground">Pianificazione squadre e cantieri — drag & drop</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCrewDialog(true)}><Settings2 className="w-4 h-4 mr-1" />Squadre</Button>
            <Button onClick={() => setAssignDialog({})}><Plus className="w-4 h-4 mr-1" />Assegna</Button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <KPI icon={HardHat} label="Cantieri attivi" value={kpis.active} color="#3B82F6" />
          <KPI icon={UsersIcon} label="Operai oggi" value={kpis.workersToday} color="#16A34A" />
          <KPI icon={Layers} label="Squadre libere" value={kpis.freeCrews} color="#8C7B6B" />
          <KPI icon={AlertTriangle} label="In ritardo" value={kpis.overdue} color="#DC2626" />
          <KPI icon={Clock} label="Ore settimana" value={kpis.weekHours} color="#F59E0B" />
          <KPI icon={TrendingUp} label="Saturazione" value={`${kpis.sat}%`} color="#A855F7" />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap bg-white border rounded-md p-2">
          <div className="flex items-center gap-1">
            {(Object.keys(VIEW_LABELS) as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${view === v ? 'bg-foreground text-background' : 'hover:bg-muted'}`}>
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Button>
            <Button
              size="sm"
              variant={format(cursor, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'default' : 'outline'}
              onClick={() => setCursor(new Date())}
            >Oggi</Button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-sm font-semibold capitalize min-w-[180px] text-center px-2 py-1 rounded hover:bg-muted transition-colors">
                  {periodLabel}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="single" selected={cursor} onSelect={(d) => d && setCursor(d)} weekStartsOn={1} locale={it} initialFocus />
              </PopoverContent>
            </Popover>
            <Button size="sm" variant="ghost" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <select value={filterCrew} onChange={(e) => setFilterCrew(e.target.value)} className="border rounded px-2 py-1 bg-background">
              <option value="">Tutte squadre</option>
              {crews.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded px-2 py-1 bg-background">
              <option value="">Tutti stati</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="border rounded px-2 py-1 bg-background">
              <option value="">Priorità</option>
              <option value="bassa">Bassa</option><option value="media">Media</option>
              <option value="alta">Alta</option><option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        {/* Conflitti */}
        {conflicts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1.5">
              <AlertTriangle className="w-4 h-4" />Conflitti rilevati ({conflicts.length})
            </div>
            <ul className="text-xs space-y-0.5 max-h-32 overflow-auto">
              {conflicts.slice(0, 10).map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.level === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  {c.message}
                </li>
              ))}
              {conflicts.length > 10 && <li className="text-muted-foreground">+ altri {conflicts.length - 10}</li>}
            </ul>
          </div>
        )}

        {/* Area */}
        <div className="min-h-[400px]">
          {view === 'giorno' && renderGiorno()}
          {view === 'settimana' && renderSettimana()}
          {view === 'mese' && renderMese()}
          {view === 'anno' && renderAnno()}
          {view === 'gantt' && renderGantt()}
          {view === 'carico' && renderCarico()}
        </div>
      </div>

      {/* Drawer dettaglio cantiere */}
      <Sheet open={!!selectedSite} onOpenChange={(o) => !o && setSelectedSite(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><PriorityDot priority={selectedSite?.priority} />{selectedSite?.name || selectedSite?.city}</SheetTitle></SheetHeader>
          {selectedSite && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2"><StatusPill status={selectedSite.status} /><span className="text-xs text-muted-foreground">{formatDeadline(selectedSite.planned_end_date)}</span></div>
              {customerName(selectedSite.customer_id) && <div>🏠 <b>Cliente:</b> {customerName(selectedSite.customer_id)}</div>}
              {selectedSite.address && <div>📍 {selectedSite.address}</div>}
              {selectedSite.estimated_hours && <div>⏱ Ore stimate: <b>{selectedSite.estimated_hours}h</b></div>}
              <div>
                <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Squadre assegnate</div>
                <div className="space-y-1">
                  {assignments.filter((a) => a.site_id === selectedSite.id).map((a) => {
                    const c = crews.find((x) => x.id === a.crew_id);
                    if (!c) return null;
                    return (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded" style={{ background: c.color + '15' }}>
                        <div>
                          <div className="font-semibold text-xs flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{a.start_date} → {a.end_date} ({durationDays(a)}gg · {a.hours_per_day}h/g)</div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => deleteAssignment(a.id)}>×</Button>
                      </div>
                    );
                  })}
                  {!assignments.some((a) => a.site_id === selectedSite.id) && <p className="text-xs text-muted-foreground italic">Nessuna squadra</p>}
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => setAssignDialog({ site_id: selectedSite.id })}><Plus className="w-3 h-3 mr-1" />Assegna squadra</Button>
              </div>
              <Button variant="default" className="w-full" onClick={() => navigate(`/admin/cantieri/${selectedSite.id}`)}><ExternalLink className="w-4 h-4 mr-1" />Apri dettaglio completo</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CrewManagerDialog open={crewDialog} onOpenChange={setCrewDialog} crews={crews} crewMembers={crewMembers} workers={workers} onChanged={fetchAll} />
      <AssignmentDialog open={!!assignDialog} onOpenChange={(o) => !o && setAssignDialog(null)} crews={crews} sites={sites} initial={assignDialog || undefined} onSaved={fetchAll} />
    </DndContext>
  );
}

// ──────────────────────────────────────────────────────────────
function SiteRow({ site, days, customerName, assignments, crews, crewMembers, workers, onOpen, onAddAssignment }: {
  site: Site; days: Date[]; customerName: string; assignments: Assignment[];
  crews: Crew[]; crewMembers: CrewMember[]; workers: Worker[];
  onOpen: () => void; onAddAssignment: (start_date: string) => void;
}) {
  return (
    <>
      <div className="bg-white p-2 border-r cursor-pointer hover:bg-muted/30" onClick={onOpen}>
        <div className="flex items-center gap-1.5"><PriorityDot priority={site.priority} /><span className="text-xs font-bold truncate">{site.name || site.city}</span></div>
        <div className="text-[10px] text-muted-foreground truncate">{customerName}</div>
        <StatusPill status={site.status} />
      </div>
      {days.map((d) => {
        const dayStr = format(d, 'yyyy-MM-dd');
        const dayAssigns = assignments.filter((a) => assignmentContainsDay(a, d));
        return (
          <DroppableCell key={dayStr} id={`day:${site.id}:${dayStr}`} data={{ type: 'day', site_id: site.id, date: dayStr }} className="bg-white p-1 min-h-[80px] space-y-0.5">
            {dayAssigns.map((a) => {
              const c = crews.find((x) => x.id === a.crew_id);
              return c ? <DraggableAssignment key={a.id} assignment={a} crew={c} members={crewMembers} workers={workers} compact /> : null;
            })}
            {!dayAssigns.length && (
              <button onClick={() => onAddAssignment(dayStr)} className="w-full h-full opacity-0 hover:opacity-100 text-[10px] text-muted-foreground hover:bg-muted/30 rounded transition-opacity">+</button>
            )}
          </DroppableCell>
        );
      })}
    </>
  );
}

const EmptyState = ({ msg = 'Nessun dato' }: { msg?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
    <CalendarDays className="w-12 h-12 mb-2 opacity-30" />
    <p className="text-sm">{msg}</p>
  </div>
);
