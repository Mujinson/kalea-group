import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, TrendingUp, Briefcase, MapPin, Plus, X, UserPlus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ITALIAN_REGIONS, getRegionNames } from '@/data/italianTerritories';
import { validatePassword, checkPasswordCompromised } from '@/hooks/usePasswordCheck';
import { getSalespersonBadgeStyle } from '@/lib/salespersonColors';

interface Props {
  salespersonId: string;
}

interface Salesperson {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  commission_rate: number | null;
  notes: string | null;
  user_id: string | null;
}

interface Territory {
  id: string;
  territory_type: string;
  territory_value: string;
}

interface Quote {
  id: string;
  quote_number: string | null;
  project_name: string | null;
  status: string;
  total_amount: number;
  created_at: string;
}

interface SaleSalesperson {
  id: string;
  commission_percentage: number;
  commission_amount: number | null;
}

const SalespersonDetail = ({ salespersonId }: Props) => {
  const [sp, setSp] = useState<Salesperson | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [commissions, setCommissions] = useState<SaleSalesperson[]>([]);
  const [loading, setLoading] = useState(true);

  // Territory add state
  const [addType, setAddType] = useState<'regione' | 'provincia'>('regione');
  const [addRegion, setAddRegion] = useState('');
  const [addProvince, setAddProvince] = useState('');

  // Account creation
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [spRes, terrRes, quotesRes, commRes] = await Promise.all([
        supabase.from('salespeople').select('*').eq('id', salespersonId).single(),
        supabase.from('salesperson_territories').select('*').eq('salesperson_id', salespersonId),
        supabase.from('quotes').select('*').eq('assigned_to', salespersonId).order('created_at', { ascending: false }),
        supabase.from('sale_salespeople').select('*').eq('salesperson_id', salespersonId),
      ]);
      if (spRes.data) {
        setSp(spRes.data as Salesperson);
        setAccountEmail(spRes.data.email || '');
      }
      setTerritories(terrRes.data || []);
      setQuotes(quotesRes.data || []);
      setCommissions(commRes.data || []);
      setLoading(false);
    };
    load();
  }, [salespersonId]);

  const stats = useMemo(() => {
    const draft = quotes.filter(q => q.status === 'draft').length;
    const sent = quotes.filter(q => ['sent', 'in_attesa'].includes(q.status)).length;
    const won = quotes.filter(q => ['accepted', 'vinto'].includes(q.status)).length;
    const lost = quotes.filter(q => ['rejected', 'perso'].includes(q.status)).length;
    const totalCommission = commissions.reduce((s, c) => s + (c.commission_amount || 0), 0);
    return { draft, sent, won, lost, total: quotes.length, totalCommission };
  }, [quotes, commissions]);

  const statusLabel = (s: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Bozza', variant: 'secondary' },
      sent: { label: 'Inviato', variant: 'default' },
      in_attesa: { label: 'In Attesa', variant: 'default' },
      accepted: { label: 'Vinto', variant: 'default' },
      vinto: { label: 'Vinto', variant: 'default' },
      rejected: { label: 'Perso', variant: 'destructive' },
      perso: { label: 'Perso', variant: 'destructive' },
    };
    return map[s] || { label: s, variant: 'outline' as const };
  };

  const addTerritory = async () => {
    const value = addType === 'regione' ? addRegion : addProvince;
    if (!value) { toast.error('Seleziona un territorio'); return; }

    const { error } = await supabase.from('salesperson_territories').insert({
      salesperson_id: salespersonId,
      territory_type: addType,
      territory_value: value,
    });
    if (error) {
      if (error.code === '23505') toast.error('Territorio già assegnato');
      else toast.error('Errore aggiunta territorio');
      return;
    }
    toast.success('Territorio aggiunto');
    const { data } = await supabase.from('salesperson_territories').select('*').eq('salesperson_id', salespersonId);
    setTerritories(data || []);
    setAddRegion('');
    setAddProvince('');
  };

  const removeTerritory = async (id: string) => {
    const { error } = await supabase.from('salesperson_territories').delete().eq('id', id);
    if (error) { toast.error('Errore rimozione'); return; }
    setTerritories(prev => prev.filter(t => t.id !== id));
    toast.success('Territorio rimosso');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountEmail || !accountPassword) { toast.error('Compila tutti i campi'); return; }

    const validation = validatePassword(accountPassword);
    if (!validation.valid) { toast.error(validation.message); return; }

    const { compromised, count } = await checkPasswordCompromised(accountPassword);
    if (compromised) {
      toast.error(`Password trovata in ${count.toLocaleString()} data breach. Scegli una password più sicura.`, { duration: 6000, icon: <AlertTriangle className="w-5 h-5 text-destructive" /> });
      return;
    }

    setCreatingAccount(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: accountEmail,
        password: accountPassword,
        options: { emailRedirectTo: `${window.location.origin}/admin` }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Errore creazione utente');

      // Add commerciale role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'commerciale',
      });
      if (roleError) throw roleError;

      // Link to salesperson
      const { error: linkError } = await supabase.from('salespeople')
        .update({ user_id: authData.user.id, email: accountEmail })
        .eq('id', salespersonId);
      if (linkError) throw linkError;

      toast.success('Account commerciale creato! Riceverà email di conferma.');
      setAccountDialogOpen(false);
      setSp(prev => prev ? { ...prev, user_id: authData.user!.id, email: accountEmail } : prev);
    } catch (err: any) {
      toast.error('Errore: ' + err.message);
    } finally {
      setCreatingAccount(false);
    }
  };

  // Get all provinces for the select
  const allProvinces = useMemo(() => {
    const result: { code: string; name: string; region: string }[] = [];
    ITALIAN_REGIONS.forEach(r => {
      r.provinces.forEach(p => {
        result.push({ code: p.code, name: p.name, region: r.name });
      });
    });
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  if (loading) return <p className="p-4">Caricamento...</p>;
  if (!sp) return <p className="p-4">Commerciale non trovato</p>;

  const barTotal = Math.max(stats.total, 1);

  return (
    <div className="space-y-6 mt-4">
      {/* Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={getSalespersonBadgeStyle(sp.id)}>
              {sp.first_name} {sp.last_name}
            </span>
          </CardTitle>
          {!sp.user_id && (
            <Button size="sm" variant="outline" onClick={() => setAccountDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Crea Account
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{sp.email || '-'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Telefono</span><span>{sp.phone || '-'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Provvigione accordo</span><span className="font-semibold">{sp.commission_rate ?? 0}%</span></div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account CRM</span>
            <span>{sp.user_id ? <Badge variant="default">Attivo</Badge> : <Badge variant="secondary">Non creato</Badge>}</span>
          </div>
        </CardContent>
      </Card>

      {/* Territories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4" />
            Zone Assegnate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current territories */}
          {territories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {territories.map(t => (
                <Badge key={t.id} variant="outline" className="flex items-center gap-1 px-3 py-1.5 text-sm">
                  {t.territory_type === 'regione' ? '🗺️' : '📍'} {t.territory_value}
                  <button onClick={() => removeTerritory(t.id)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add territory */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Select value={addType} onValueChange={(v: 'regione' | 'provincia') => setAddType(v)}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regione">Regione</SelectItem>
                  <SelectItem value="provincia">Provincia</SelectItem>
                </SelectContent>
              </Select>

              {addType === 'regione' ? (
                <Select value={addRegion} onValueChange={setAddRegion}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Seleziona regione" /></SelectTrigger>
                  <SelectContent>
                    {getRegionNames().map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={addProvince} onValueChange={setAddProvince}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Seleziona provincia" /></SelectTrigger>
                  <SelectContent>
                    {allProvinces.map(p => (
                      <SelectItem key={p.code} value={p.name}>{p.name} ({p.region})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button size="icon" onClick={addTerritory}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            Riepilogo Preventivi ({stats.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Bozza', count: stats.draft, color: 'bg-muted-foreground' },
            { label: 'In Attesa / Inviati', count: stats.sent, color: 'bg-blue-500' },
            { label: 'Vinti', count: stats.won, color: 'bg-green-500' },
            { label: 'Persi', count: stats.lost, color: 'bg-destructive' },
          ].map(bar => (
            <div key={bar.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{bar.label}</span>
                <span className="font-semibold">{bar.count}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${(bar.count / barTotal) * 100}%` }} />
              </div>
            </div>
          ))}

          {stats.totalCommission > 0 && (
            <div className="pt-2 border-t text-sm flex justify-between">
              <span className="text-muted-foreground">Totale provvigioni maturate</span>
              <span className="font-semibold">€ {stats.totalCommission.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotes list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Preventivi ({quotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nessun preventivo assegnato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Progetto</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map(q => {
                  const sl = statusLabel(q.status);
                  return (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs">{q.quote_number || '-'}</TableCell>
                      <TableCell>{q.project_name || '-'}</TableCell>
                      <TableCell>€ {q.total_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell><Badge variant={sl.variant}>{sl.label}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(q.created_at).toLocaleDateString('it-IT')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Account creation dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea Account CRM per {sp.first_name} {sp.last_name}</DialogTitle>
            <DialogDescription>
              Crea le credenziali di accesso al CRM. Il commerciale vedrà solo i dati delle sue zone assegnate.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={accountEmail} onChange={e => setAccountEmail(e.target.value)} placeholder="email@esempio.com" />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" value={accountPassword} onChange={e => setAccountPassword(e.target.value)} placeholder="Minimo 12 caratteri, maiuscole, numeri, simboli" />
            </div>
            <Button type="submit" className="w-full" disabled={creatingAccount}>
              {creatingAccount ? 'Creazione...' : 'Crea Account Commerciale'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalespersonDetail;
