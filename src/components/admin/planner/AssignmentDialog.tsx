import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Crew, Site } from '@/lib/planner';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  crews: Crew[];
  sites: Site[];
  initial?: { crew_id?: string; site_id?: string; start_date?: string; end_date?: string };
  onSaved: () => void;
}

export default function AssignmentDialog({ open, onOpenChange, crews, sites, initial, onSaved }: Props) {
  const { toast } = useToast();
  const [crewId, setCrewId] = useState(initial?.crew_id || '');
  const [siteId, setSiteId] = useState(initial?.site_id || '');
  const [start, setStart] = useState(initial?.start_date || new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(initial?.end_date || new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState(8);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setCrewId(initial?.crew_id || '');
      setSiteId(initial?.site_id || '');
      setStart(initial?.start_date || new Date().toISOString().slice(0, 10));
      setEnd(initial?.end_date || initial?.start_date || new Date().toISOString().slice(0, 10));
      setHours(8); setNotes('');
    }
  }, [open, initial]);

  const submit = async () => {
    if (!crewId || !siteId) return toast({ title: 'Seleziona squadra e cantiere', variant: 'destructive' });
    setBusy(true);
    const { error } = await (supabase as any).from('crew_assignments').insert({
      crew_id: crewId, site_id: siteId, start_date: start, end_date: end, hours_per_day: hours, notes: notes || null,
    });
    setBusy(false);
    if (error) return toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    toast({ title: 'Assegnazione creata' });
    onSaved(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuova assegnazione</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Squadra</Label>
            <select className="w-full border rounded px-2 py-2 bg-background" value={crewId} onChange={(e) => setCrewId(e.target.value)}>
              <option value="">—</option>
              {crews.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Cantiere</Label>
            <select className="w-full border rounded px-2 py-2 bg-background" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
              <option value="">—</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name || s.city || s.id.slice(0, 8)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Inizio</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div><Label>Fine</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <div><Label>Ore/giorno</Label><Input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></div>
          <div><Label>Note</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
          <Button onClick={submit} disabled={busy} className="w-full">Salva</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
