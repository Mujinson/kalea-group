import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Crew, CrewMember, Worker } from '@/lib/planner';
import { workerName } from '@/lib/planner';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  crews: Crew[];
  crewMembers: CrewMember[];
  workers: Worker[];
  onChanged: () => void;
}

const PALETTE = ['#64748B', '#3B82F6', '#16A34A', '#DC2626', '#F59E0B', '#A855F7', '#06B6D4', '#EC4899'];

export default function CrewManagerDialog({ open, onOpenChange, crews, crewMembers, workers, onChanged }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [max, setMax] = useState(5);
  const [busy, setBusy] = useState(false);

  const createCrew = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const { error } = await (supabase as any).from('crews').insert({ name: name.trim(), color, max_workers: max });
    setBusy(false);
    if (error) return toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    setName(''); onChanged();
  };

  const deleteCrew = async (id: string) => {
    if (!confirm('Eliminare la squadra? Le assegnazioni saranno rimosse.')) return;
    const { error } = await (supabase as any).from('crews').delete().eq('id', id);
    if (error) return toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    onChanged();
  };

  const addMember = async (crewId: string, workerId: string) => {
    const { error } = await (supabase as any).from('crew_members').insert({ crew_id: crewId, worker_id: workerId });
    if (error) return toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    onChanged();
  };

  const removeMember = async (id: string) => {
    const { error } = await (supabase as any).from('crew_members').delete().eq('id', id);
    if (error) return toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    onChanged();
  };

  const freeWorkers = workers.filter((w) => !crewMembers.some((m) => m.worker_id === w.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestione squadre</DialogTitle>
        </DialogHeader>

        <div className="border rounded-md p-3 bg-muted/30">
          <div className="text-xs font-semibold mb-2 uppercase tracking-wider">Nuova squadra</div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,80px,auto] gap-2 items-end">
            <div>
              <Label className="text-[11px]">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alpha" />
            </div>
            <div>
              <Label className="text-[11px]">Colore</Label>
              <div className="flex gap-1 mt-1">
                {PALETTE.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded ${color === c ? 'ring-2 ring-offset-1' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[11px]">Max</Label>
              <Input type="number" min={1} value={max} onChange={(e) => setMax(Number(e.target.value))} />
            </div>
            <Button onClick={createCrew} disabled={busy}><Plus className="w-4 h-4 mr-1" />Crea</Button>
          </div>
        </div>

        <div className="space-y-3">
          {crews.map((c) => {
            const members = crewMembers.filter((m) => m.crew_id === c.id);
            return (
              <div key={c.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded" style={{ background: c.color }} />
                    <span className="font-semibold">{c.name}</span>
                    <Badge variant="outline">{members.length}/{c.max_workers}</Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteCrew(c.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {members.map((m) => {
                    const w = workers.find((x) => x.id === m.worker_id);
                    return (
                      <span key={m.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: c.color + '20', color: '#1A1A2E' }}>
                        {workerName(w)}
                        <button onClick={() => removeMember(m.id)} className="hover:opacity-60"><X className="w-3 h-3" /></button>
                      </span>
                    );
                  })}
                  {!members.length && <span className="text-xs text-muted-foreground italic">Nessun operaio</span>}
                </div>
                {freeWorkers.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      className="text-xs border rounded px-2 py-1 bg-background"
                      onChange={(e) => { if (e.target.value) { addMember(c.id, e.target.value); e.target.value = ''; } }}
                      value=""
                    >
                      <option value="">+ Aggiungi operaio…</option>
                      {freeWorkers.map((w) => <option key={w.id} value={w.id}>{workerName(w)}</option>)}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
          {!crews.length && <p className="text-sm text-muted-foreground text-center py-6">Nessuna squadra creata.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
