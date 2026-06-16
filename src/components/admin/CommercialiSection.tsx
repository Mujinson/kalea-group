import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { UserPlus, Trash2, Pencil, Eye, Briefcase, KeyRound } from 'lucide-react';
import SalespersonDetail from './SalespersonDetail';
import { getSalespersonBadgeStyle } from '@/lib/salespersonColors';

type Role = 'commerciale' | 'operaio' | 'ibrido' | 'admin';

interface UserRow {
  // unified row: comes from salespeople OR workers
  source: 'salespeople' | 'workers';
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  commission_rate?: number | null;
  is_commission_earner?: boolean | null;
  role: Role;
}

const CommercialiSection = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    role: 'commerciale' as Role,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    is_commission_earner: false,
    commission_rate: '0',
    hourly_cost: '0',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    // 1. salespeople (active)
    const { data: sp } = await supabase
      .from('salespeople')
      .select('id,user_id,first_name,last_name,email,phone,commission_rate,is_commission_earner')
      .eq('is_active', true)
      .order('last_name');

    // 2. workers (not deleted)
    const { data: wk } = await supabase
      .from('workers')
      .select('id,user_id,first_name,last_name,email,phone,role,status')
      .is('deleted_at', null)
      .order('last_name');

    // 3. roles map
    const { data: roles } = await supabase.from('user_roles').select('user_id,role');
    const rolesByUser = new Map<string, string[]>();
    (roles || []).forEach((r: any) => {
      const arr = rolesByUser.get(r.user_id) || [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    });

    const rowsSp: UserRow[] = (sp || []).map((s: any) => {
      const rs = s.user_id ? rolesByUser.get(s.user_id) || [] : [];
      const role: Role = rs.includes('admin') ? 'admin'
        : rs.includes('ibrido') ? 'ibrido'
        : 'commerciale';
      return { source: 'salespeople', ...s, role };
    });

    // Workers that are NOT also in salespeople (avoid duplicates for ibrido)
    const spUserIds = new Set((sp || []).map((s: any) => s.user_id).filter(Boolean));
    const rowsWk: UserRow[] = (wk || [])
      .filter((w: any) => !w.user_id || !spUserIds.has(w.user_id))
      .map((w: any) => {
        const rs = w.user_id ? rolesByUser.get(w.user_id) || [] : [];
        const role: Role = rs.includes('admin') ? 'admin'
          : rs.includes('ibrido') ? 'ibrido'
          : 'operaio';
        return {
          source: 'workers',
          id: w.id,
          user_id: w.user_id,
          first_name: w.first_name,
          last_name: w.last_name,
          email: w.email,
          phone: w.phone,
          commission_rate: 0,
          is_commission_earner: false,
          role,
        };
      });

    setUsers([...rowsSp, ...rowsWk]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      role: 'commerciale', first_name: '', last_name: '', email: '',
      phone: '', password: '', is_commission_earner: false,
      commission_rate: '0', hourly_cost: '0',
    });
    setDialogOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setForm({
      role: u.role,
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      is_commission_earner: !!u.is_commission_earner,
      commission_rate: String(u.commission_rate ?? 0),
      hourly_cost: '0',
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) {
      toast.error('Nome e cognome sono obbligatori');
      return;
    }
    setSaving(true);

    try {
      if (editing) {
        // Update existing
        if (editing.source === 'salespeople') {
          await supabase.from('salespeople').update({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email || null,
            phone: form.phone || null,
            commission_rate: parseFloat(form.commission_rate) || 0,
            is_commission_earner: form.is_commission_earner,
          }).eq('id', editing.id);
        } else {
          await supabase.from('workers').update({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email || null,
            phone: form.phone || null,
          }).eq('id', editing.id);
        }
        toast.success('Utente aggiornato');
      } else {
        // CREATE: requires email + password
        if (!form.email || !form.password) {
          toast.error('Email e password sono obbligatori per il nuovo accesso');
          setSaving(false);
          return;
        }
        if (form.password.length < 8) {
          toast.error('Password minimo 8 caratteri');
          setSaving(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('admin-create-user', {
          body: {
            email: form.email,
            password: form.password,
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone || null,
            role: form.role,
            is_commission_earner: form.is_commission_earner,
            commission_rate: parseFloat(form.commission_rate) || 0,
            hourly_cost: parseFloat(form.hourly_cost) || 0,
          },
        });
        if (error || (data as any)?.error) {
          toast.error('Errore creazione: ' + ((data as any)?.error || error?.message));
          setSaving(false);
          return;
        }
        toast.success('Utente creato — può ora accedere con la sua email');
      }

      setDialogOpen(false);
      fetchAll();
    } catch (err: any) {
      toast.error('Errore: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: UserRow) => {
    if (!confirm(`Disattivare ${u.first_name} ${u.last_name}? L'account NON viene eliminato, può essere riattivato.`)) return;
    if (u.source === 'salespeople') {
      await supabase.from('salespeople').update({ is_active: false }).eq('id', u.id);
    } else {
      await supabase.from('workers').update({ deleted_at: new Date().toISOString() }).eq('id', u.id);
    }
    toast.success('Utente disattivato');
    fetchAll();
  };

  const roleLabel = (r: Role) => ({
    admin: 'Admin',
    commerciale: 'Commerciale',
    operaio: 'Operaio',
    ibrido: 'Ibrido',
  }[r]);

  const roleBadgeBg = (r: Role) => ({
    admin: '#1E1B4B',
    commerciale: '#3B82F6',
    operaio: '#8B6F4E',
    ibrido: '#9333EA',
  }[r]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Gestione Utenti
            </CardTitle>
            <CardDescription>Crea nuovi accessi (commerciali, operai, ibridi) e gestisci la rete vendita</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <UserPlus className="w-4 h-4 mr-2" />
                Nuovo Utente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? 'Modifica Utente' : 'Nuovo Utente'}</DialogTitle>
                <DialogDescription>
                  {editing
                    ? 'Modifica i dati. Per cambiare la password, l\'utente deve farlo dal suo profilo.'
                    : 'Crea un nuovo accesso al CRM. L\'utente potrà loggarsi subito con email e password.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                {!editing && (
                  <div className="space-y-2">
                    <Label>Ruolo *</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v: Role) => setForm(p => ({
                        ...p, role: v,
                        is_commission_earner: v === 'ibrido' ? true : p.is_commission_earner,
                      }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commerciale">Commerciale — vende, vede solo i suoi</SelectItem>
                        <SelectItem value="operaio">Operaio — vede solo i cantieri assegnati</SelectItem>
                        <SelectItem value="ibrido">Ibrido — operaio + commerciale + commissioni</SelectItem>
                        <SelectItem value="admin">Admin — accesso completo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cognome *</Label>
                    <Input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email {!editing && '*'}</Label>
                  <Input
                    type="email"
                    value={form.email}
                    disabled={!!editing}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telefono</Label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>

                {!editing && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4" /> Password temporanea *
                    </Label>
                    <Input
                      type="text"
                      value={form.password}
                      placeholder="Minimo 8 caratteri"
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      L'utente potrà cambiarla dal suo profilo dopo il primo accesso.
                    </p>
                  </div>
                )}

                {(form.role === 'commerciale' || form.role === 'ibrido') && (
                  <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Percettore commissioni</Label>
                      <Switch
                        checked={form.is_commission_earner}
                        onCheckedChange={(v) => setForm(p => ({ ...p, is_commission_earner: v }))}
                      />
                    </div>
                    {form.is_commission_earner && (
                      <div className="space-y-2">
                        <Label>Percentuale commissione (%)</Label>
                        <Input
                          type="number" step="0.1" min="0" max="100"
                          value={form.commission_rate}
                          onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Calcolata automaticamente sul netto materiale (esclusa la posa) quando un preventivo viene accettato.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!editing && (form.role === 'operaio' || form.role === 'ibrido') && (
                  <div className="space-y-2">
                    <Label>Costo orario (€/h)</Label>
                    <Input
                      type="number" step="0.5" min="0"
                      value={form.hourly_cost}
                      onChange={e => setForm(p => ({ ...p, hourly_cost: e.target.value }))}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Salvataggio…' : editing ? 'Salva Modifiche' : 'Crea Utente e Accesso'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Caricamento...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessun utente configurato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Commissione</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={`${u.source}-${u.id}`}>
                    <TableCell>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={u.source === 'salespeople'
                          ? getSalespersonBadgeStyle(u.id)
                          : { background: '#F0EDE7', color: '#1E1B4B' }}
                      >
                        {u.first_name} {u.last_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: roleBadgeBg(u.role) }}
                      >
                        {roleLabel(u.role)}
                      </span>
                    </TableCell>
                    <TableCell>{u.email || '-'}</TableCell>
                    <TableCell>{u.phone || '-'}</TableCell>
                    <TableCell>
                      {u.is_commission_earner
                        ? <span className="text-green-700 font-medium">{u.commission_rate ?? 0}%</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {u.source === 'salespeople' && (
                          <Button variant="ghost" size="icon" onClick={() => setDetailId(u.id)} title="Dettaglio">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(u)} title="Modifica">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(u)} title="Disattiva">
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
