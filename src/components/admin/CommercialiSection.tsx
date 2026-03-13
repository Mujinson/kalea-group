import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { UserPlus, Trash2, Pencil, Eye, Briefcase } from 'lucide-react';
import SalespersonDetail from './SalespersonDetail';

interface Salesperson {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  commission_rate: number | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: string;
}

const CommercialiSection = () => {
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    commission_rate: '',
    notes: '',
  });

  useEffect(() => { fetchSalespeople(); }, []);

  const fetchSalespeople = async () => {
    const { data, error } = await supabase
      .from('salespeople')
      .select('*')
      .eq('is_active', true)
      .order('last_name');
    if (error) { console.error(error); }
    else setSalespeople(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ first_name: '', last_name: '', email: '', phone: '', commission_rate: '', notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (sp: Salesperson) => {
    setEditingId(sp.id);
    setForm({
      first_name: sp.first_name,
      last_name: sp.last_name,
      email: sp.email || '',
      phone: sp.phone || '',
      commission_rate: sp.commission_rate?.toString() || '0',
      notes: sp.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) { toast.error('Nome e cognome sono obbligatori'); return; }

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      commission_rate: parseFloat(form.commission_rate) || 0,
      notes: form.notes || null,
    };

    if (editingId) {
      const { error } = await supabase.from('salespeople').update(payload).eq('id', editingId);
      if (error) { toast.error('Errore aggiornamento'); return; }
      toast.success('Commerciale aggiornato');
    } else {
      const { error } = await supabase.from('salespeople').insert({ ...payload, is_active: true });
      if (error) { toast.error('Errore creazione'); return; }
      toast.success('Commerciale aggiunto');
    }
    setDialogOpen(false);
    fetchSalespeople();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler disattivare questo commerciale?')) return;
    const { error } = await supabase.from('salespeople').update({ is_active: false }).eq('id', id);
    if (error) { toast.error('Errore'); return; }
    toast.success('Commerciale rimosso');
    fetchSalespeople();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Commerciali
            </CardTitle>
            <CardDescription>Gestisci la rete vendita e le provvigioni</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <UserPlus className="w-4 h-4 mr-2" />
                Nuovo Commerciale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Modifica Commerciale' : 'Nuovo Commerciale'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Modifica i dati del commerciale' : 'Aggiungi un nuovo commerciale alla rete vendita'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cognome *</Label>
                    <Input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefono</Label>
                    <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Provvigione accordo (%)</Label>
                  <Input type="number" step="0.1" min="0" max="100" value={form.commission_rate} onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? 'Salva Modifiche' : 'Aggiungi Commerciale'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Caricamento...</p>
          ) : salespeople.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessun commerciale configurato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Provvigione %</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salespeople.map(sp => (
                  <TableRow key={sp.id}>
                    <TableCell className="font-medium">{sp.first_name} {sp.last_name}</TableCell>
                    <TableCell>{sp.email || '-'}</TableCell>
                    <TableCell>{sp.phone || '-'}</TableCell>
                    <TableCell>{sp.commission_rate ?? 0}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setDetailId(sp.id)} title="Dettaglio">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(sp)} title="Modifica">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sp.id)} title="Rimuovi">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!detailId} onOpenChange={(open) => { if (!open) setDetailId(null); }}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Dettaglio Commerciale</SheetTitle>
          </SheetHeader>
          {detailId && <SalespersonDetail salespersonId={detailId} />}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CommercialiSection;
