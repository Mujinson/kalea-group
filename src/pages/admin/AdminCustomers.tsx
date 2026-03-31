import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, Eye, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import CustomerDetailSheet from '@/components/admin/CustomerDetailSheet';
import { ITALIAN_REGIONS, getRegionNames, getProvincesForRegion, getCitiesForProvince } from '@/data/italianTerritories';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const CUSTOMER_TYPES = [
  { value: 'cliente_privato', label: 'Cliente privato' },
  { value: 'rivenditore', label: 'Rivenditore' },
  { value: 'costruttore', label: 'Costruttore' },
  { value: 'posatore', label: 'Posatore' },
  { value: 'architetto', label: 'Architetto' },
  { value: 'interior_designer', label: 'Interior designer' },
  { value: 'showroom', label: 'Showroom' },
  { value: 'studio_design', label: 'Studio di design' },
  { value: 'azienda_pubblica', label: 'Azienda pubblica' },
];

const CUSTOMER_STATUSES = [
  { value: 'opportunity', label: 'Opportunity', color: 'bg-yellow-500' },
  { value: 'signed', label: 'Signed', color: 'bg-green-500' },
  { value: 'working', label: 'Working', color: 'bg-blue-500' },
];

interface Customer {
  id: string;
  customer_type: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  province: string | null;
  region: string | null;
  country: string | null;
  vat_number: string | null;
  pec: string | null;
  sdi_code: string | null;
  notes: string | null;
  status: string | null;
  total_value: number | null;
  total_margin: number | null;
  created_at: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);
  
  const [formData, setFormData] = useState({
    customer_type: '',
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    province: '',
    region: '',
    country: 'Italia',
    vat_number: '',
    pec: '',
    sdi_code: '',
    notes: '',
  });

  const fetchLeadsCount = async () => {
    const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    setLeadsCount(count || 0);
  };

  const handleDataChange = useCallback(() => {
    fetchCustomers();
    fetchLeadsCount();
  }, []);

  useRealtimeSubscription({
    tables: ['customers', 'sales', 'leads'],
    onDataChange: handleDataChange,
  });

  useEffect(() => {
    fetchCustomers();
    fetchLeadsCount();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Errore nel caricamento clienti');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_type) {
      toast.error('Seleziona la tipologia cliente');
      return;
    }

    try {
      const insertData = {
        customer_type: formData.customer_type as any,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        company_name: formData.company_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        province: formData.province || null,
        region: formData.region || null,
        country: formData.country || null,
        vat_number: formData.vat_number || null,
        pec: formData.pec || null,
        sdi_code: formData.sdi_code || null,
        notes: formData.notes || null,
        status: 'opportunity' as const,
      };

      const { data, error } = await supabase.from('customers').insert(insertData).select().single();

      if (error) throw error;

      toast.success('Cliente creato');
      setDialogOpen(false);
      resetForm();
      fetchCustomers();
      
      // Auto-open customer detail
      if (data) {
        setSelectedCustomerId(data.id);
        setDetailOpen(true);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_type: '',
      first_name: '',
      last_name: '',
      company_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postal_code: '',
      province: '',
      region: '',
      country: 'Italia',
      vat_number: '',
      pec: '',
      sdi_code: '',
      notes: '',
    });
  };

  const getCustomerName = (customer: Customer) => {
    if (customer.company_name) return customer.company_name;
    if (customer.first_name || customer.last_name) {
      return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    }
    return 'Cliente senza nome';
  };

  const getTypeLabel = (type: string) => CUSTOMER_TYPES.find(t => t.value === type)?.label || type;
  const getStatusInfo = (status: string | null) => CUSTOMER_STATUSES.find(s => s.value === status) || CUSTOMER_STATUSES[0];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      getCustomerName(customer).toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    const matchesType = filterType === 'all' || customer.customer_type === filterType;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    const matchesRegion = filterRegion === 'all' || customer.region === filterRegion;
    
    return matchesSearch && matchesType && matchesStatus && matchesRegion;
  });

  const regions = [...new Set(customers.map(c => c.region).filter(Boolean))];
  const totalValue = customers.reduce((sum, c) => sum + (c.total_value || 0), 0);
  const totalMargin = customers.reduce((sum, c) => sum + (c.total_margin || 0), 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Clienti</h2>
          <p className="text-sm text-muted-foreground">CRM e anagrafica clienti</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nuovo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuovo Cliente</DialogTitle>
              <DialogDescription>Inserisci i dati del nuovo cliente</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipologia Cliente *</Label>
                <Select value={formData.customer_type} onValueChange={(v) => setFormData({...formData, customer_type: v})}>
                  <SelectTrigger><SelectValue placeholder="Seleziona tipologia" /></SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} placeholder="Mario" />
                </div>
                <div className="space-y-2">
                  <Label>Cognome</Label>
                  <Input value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} placeholder="Rossi" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nome Azienda</Label>
                <Input value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} placeholder="Azienda SRL" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@esempio.it" />
                </div>
                <div className="space-y-2">
                  <Label>Telefono</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+39 333 1234567" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Indirizzo</Label>
                <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Via Roma 1" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Regione</Label>
                  <Select 
                    value={formData.region} 
                    onValueChange={(v) => setFormData({...formData, region: v, province: '', city: ''})}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleziona regione" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {getRegionNames().map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Select 
                    value={formData.province} 
                    onValueChange={(v) => setFormData({...formData, province: v, city: ''})}
                    disabled={!formData.region}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleziona provincia" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {getProvincesForRegion(formData.region).map(p => (
                        <SelectItem key={p.code} value={p.code}>{p.name} ({p.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Città</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(v) => setFormData({...formData, city: v})}
                    disabled={!formData.province}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleziona città" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {getCitiesForProvince(formData.region, formData.province).map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CAP</Label>
                  <Input value={formData.postal_code} onChange={(e) => setFormData({...formData, postal_code: e.target.value})} placeholder="05100" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Partita IVA</Label>
                  <Input value={formData.vat_number} onChange={(e) => setFormData({...formData, vat_number: e.target.value})} placeholder="IT12345678901" />
                </div>
                <div className="space-y-2">
                  <Label>Codice SDI</Label>
                  <Input value={formData.sdi_code} onChange={(e) => setFormData({...formData, sdi_code: e.target.value})} placeholder="ABC1234" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>PEC</Label>
                <Input type="email" value={formData.pec} onChange={(e) => setFormData({...formData, pec: e.target.value})} placeholder="azienda@pec.it" />
              </div>

              <Button type="submit" className="w-full">Salva Cliente</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Totale Clienti</p>
            <p className="text-xl font-bold">{customers.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <span className="text-lg font-bold text-orange-600">{customers.filter(c => c.status === 'opportunity').length + leadsCount}</span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Opportunity</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Valore Totale</p>
            <p className="text-lg font-bold">€{totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Margine Totale</p>
            <p className="text-lg font-bold">€{totalMargin.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cerca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            {CUSTOMER_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Stato" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            {CUSTOMER_STATUSES.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
          </SelectContent>
        </Select>
        {regions.length > 0 && (
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Regione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              {regions.map(r => (<SelectItem key={r} value={r!}>{r}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Customer List - Mobile Cards / Desktop Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{filteredCustomers.length} clienti</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Caricamento...</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessun cliente trovato</p>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => {
                const statusInfo = getStatusInfo(customer.status);
                return (
                  <div 
                    key={customer.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => { setSelectedCustomerId(customer.id); setDetailOpen(true); }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{getCustomerName(customer)}</span>
                          <Badge variant="outline" className="text-xs shrink-0">{getTypeLabel(customer.customer_type)}</Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs shrink-0 ${
                              statusInfo.value === 'opportunity' ? 'bg-yellow-100 text-yellow-800' :
                              statusInfo.value === 'signed' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${statusInfo.color}`} />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          {customer.email && <span className="truncate">{customer.email}</span>}
                          {customer.city && <span>{customer.city}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {(customer.total_value || 0) > 0 && (
                          <div className="font-bold">€{customer.total_value?.toLocaleString()}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(customer.created_at), 'dd MMM', { locale: it })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerDetailSheet 
        customerId={selectedCustomerId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={fetchCustomers}
      />
    </div>
  );
};

export default AdminCustomers;
