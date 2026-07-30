import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Trash2, Merge } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  leads: any[];
  onDone: () => void;
}

type Group = { key: string; label: string; leads: any[] };

const normPhone = (p?: string | null) => (p || '').replace(/[^0-9]/g, '').replace(/^0039|^39/, '');
const normEmail = (e?: string | null) => (e || '').trim().toLowerCase();

export const LeadDuplicatesDialog = ({ open, onOpenChange, leads, onDone }: Props) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const groups: Group[] = useMemo(() => {
    const byKey = new Map<string, any[]>();
    for (const l of leads) {
      if (l.deleted_at) continue;
      const phone = normPhone(l.phone);
      const email = normEmail(l.email);
      const key = phone ? `tel:${phone}` : email ? `mail:${email}` : '';
      if (!key) continue;
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push(l);
    }
    return Array.from(byKey.entries())
      .filter(([, arr]) => arr.length > 1)
      .map(([key, arr]) => ({
        key,
        label: key.startsWith('tel:') ? `Telefono ${arr[0].phone}` : `Email ${arr[0].email}`,
        leads: [...arr].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      }))
      .sort((a, b) => b.leads.length - a.leads.length);
  }, [leads]);

  const totalDupes = groups.reduce((s, g) => s + g.leads.length - 1, 0);

  const toggleGroup = (g: Group, on: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      // mantiene il primo (più vecchio) e seleziona gli altri
      g.leads.slice(1).forEach((l) => { next[l.id] = on; });
      return next;
    });
  };

  const selectAll = () => {
    const next: Record<string, boolean> = {};
    groups.forEach((g) => g.leads.slice(1).forEach((l) => { next[l.id] = true; }));
    setSelected(next);
  };

  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);

  const removeSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Eliminare (soft delete) ${selectedIds.length} lead duplicati? I lead più vecchi di ogni gruppo restano.`)) return;
    setBusy(true);
    for (let i = 0; i < selectedIds.length; i += 100) {
      const { error } = await supabase
        .from('leads')
        .update({ deleted_at: new Date().toISOString() } as any)
        .in('id', selectedIds.slice(i, i + 100));
      if (error) { toast.error(error.message); setBusy(false); return; }
    }
    toast.success(`${selectedIds.length} duplicati eliminati`);
    setSelected({});
    setBusy(false);
    onDone();
    onOpenChange(false);
  };

  const mergeSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Unire ${selectedIds.length} duplicati nel lead principale di ogni gruppo? Le note vengono accodate e i duplicati eliminati.`)) return;
    setBusy(true);
    try {
      for (const g of groups) {
        const master = g.leads[0];
        const dupes = g.leads.slice(1).filter((l) => selected[l.id]);
        if (!dupes.length) continue;
        // riporta i campi mancanti sul master
        const patch: any = {};
        for (const f of ['email', 'phone', 'city', 'province', 'region', 'country', 'company_name', 'address', 'interest']) {
          if (!master[f]) {
            const v = dupes.find((d) => d[f])?.[f];
            if (v) patch[f] = v;
          }
        }
        const extraNotes = dupes.map((d) => d.message || d.notes).filter(Boolean).join('\n---\n');
        if (extraNotes) patch.notes = [master.notes, extraNotes].filter(Boolean).join('\n---\n');
        if (Object.keys(patch).length) {
          const { error } = await supabase.from('leads').update(patch).eq('id', master.id);
          if (error) throw error;
        }
        // sposta attività collegate
        const dupeIds = dupes.map((d) => d.id);
        await supabase.from('lead_activities').update({ lead_id: master.id }).in('lead_id', dupeIds);
        await supabase.from('leads').update({ deleted_at: new Date().toISOString() } as any).in('id', dupeIds);
      }
      toast.success('Duplicati uniti');
      setSelected({});
      onDone();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || 'Errore durante il merge');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead duplicati</DialogTitle>
          <DialogDescription>
            {groups.length} grupp{groups.length === 1 ? 'o' : 'i'} · {totalDupes} duplicati (match su telefono o email).
            Il lead più vecchio di ogni gruppo è il principale.
          </DialogDescription>
        </DialogHeader>

        {groups.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Nessun duplicato trovato.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAll}>Seleziona tutti i duplicati</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected({})}>Deseleziona</Button>
            </div>
            {groups.map((g) => (
              <div key={g.key} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{g.label} <Badge variant="secondary" className="ml-2">{g.leads.length}</Badge></div>
                  <Button size="sm" variant="outline" onClick={() => toggleGroup(g, true)}>Seleziona duplicati</Button>
                </div>
                {g.leads.map((l, idx) => (
                  <div key={l.id} className="flex items-center gap-3 text-sm">
                    {idx === 0 ? (
                      <Badge className="bg-green-100 text-green-800">Principale</Badge>
                    ) : (
                      <Checkbox checked={!!selected[l.id]} onCheckedChange={(v) => setSelected((p) => ({ ...p, [l.id]: !!v }))} />
                    )}
                    <span className="font-medium">{l.name || l.company_name || '—'}</span>
                    <span className="text-muted-foreground">{l.email || l.phone || ''}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {l.created_at ? format(new Date(l.created_at), 'dd/MM/yyyy') : ''}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Chiudi</Button>
          <Button variant="outline" onClick={mergeSelected} disabled={busy || !selectedIds.length}>
            <Merge className="w-4 h-4 mr-2" />Unisci ({selectedIds.length})
          </Button>
          <Button variant="destructive" onClick={removeSelected} disabled={busy || !selectedIds.length}>
            <Trash2 className="w-4 h-4 mr-2" />Elimina ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDuplicatesDialog;
