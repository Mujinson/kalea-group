import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Save, X, Search } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getRegionNames, getProvincesForRegion, getCitiesForProvince } from '@/data/italianTerritories';

const QUOTE_STATUSES = [
  { value: 'draft', label: 'Bozza' },
  { value: 'sent', label: 'Inviato' },
  { value: 'accepted', label: 'Accettato' },
  { value: 'rejected', label: 'Rifiutato' },
];

const TIPOLOGIE = [
  { value: 'residenziale', label: 'Residenziale' },
  { value: 'commerciale', label: 'Commerciale' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'uffici', label: 'Uffici' },
  { value: 'retail', label: 'Retail' },
  { value: 'sanitario', label: 'Sanitario' },
];

const TRANSPORT_METHODS = [
  { value: 'corriere', label: 'Corriere' },
  { value: 'ritiro', label: 'Ritiro in sede' },
  { value: 'consegna_diretta', label: 'Consegna diretta' },
  { value: 'spedizioniere', label: 'Spedizioniere' },
];

const PAYMENT_TYPES = [
  { value: 'bonifico', label: 'Bonifico bancario' },
  { value: 'carta_credito', label: 'Carta di credito' },
  { value: 'assegno', label: 'Assegno' },
  { value: 'contanti', label: 'Contanti' },
  { value: 'riba', label: 'RiBa' },
];

const VAT_RATES = [
  { value: '0.22', label: '22%' },
  { value: '0.10', label: '10%' },
  { value: '0.04', label: '4%' },
  { value: '0', label: 'Esente' },
];

interface Customer {
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  region: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
}

const AdminQuoteCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAdminAuth();
  const editId = searchParams.get('edit');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState('draft');
  const [assignedTo, setAssignedTo] = useState('');
  const [tipologia, setTipologia] = useState('');

  // Offerta
  const [projectName, setProjectName] = useState('');
  const [subject, setSubject] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Indirizzo cantiere
  const [siteCountry, setSiteCountry] = useState('Italia');
  const [siteAddress, setSiteAddress] = useState('');
  const [sitePostalCode, setSitePostalCode] = useState('');
  const [siteCity, setSiteCity] = useState('');
  const [siteProvince, setSiteProvince] = useState('');
  const [siteRegion, setSiteRegion] = useState('');

  // Condizioni
  const [transportMethod, setTransportMethod] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [vatRate, setVatRate] = useState('0.22');
  const [paymentTermsText, setPaymentTermsText] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (editId) {
      loadQuote(editId);
    }
  }, [editId]);

  const fetchInitialData = async () => {
    const [custRes, spRes] = await Promise.all([
      supabase.from('customers').select('id, company_name, first_name, last_name, address, city, province, postal_code, region, country, email, phone').order('company_name'),
      supabase.from('salespeople').select('*').eq('is_active', true).order('first_name'),
    ]);
    setCustomers(custRes.data || []);
    setSalespeople(spRes.data || []);

    // Pre-select customer if from URL
    const custParam = searchParams.get('customer');
    if (custParam) {
      selectCustomer(custParam, custRes.data || []);
    }
  };

  const loadQuote = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('quotes').select('*').eq('id', id).single();
    if (error || !data) {
      toast.error('Preventivo non trovato');
      navigate('/admin/preventivi');
      return;
    }
    // Populate form
    setSelectedCustomerId(data.customer_id || '');
    setStatus(data.status || 'draft');
    setAssignedTo(data.assigned_to || '');
    setTipologia(data.tipologia || '');
    setProjectName(data.project_name || '');
    setSubject(data.subject || '');
    setValidUntil(data.valid_until || '');
    setSiteCountry(data.site_country || 'Italia');
    setSiteAddress(data.site_address || '');
    setSitePostalCode(data.site_postal_code || '');
    setSiteCity(data.site_city || '');
    setSiteProvince(data.site_province || '');
    setTransportMethod(data.transport_method || '');
    setDeliveryTime(data.delivery_time || '');
    setPaymentType(data.payment_type || '');
    setVatRate(String(data.vat_rate ?? '0.22'));
    setPaymentTermsText(data.payment_terms_text || '');
    setNotes(data.notes || '');

    // Select customer
    if (data.customer_id) {
      const { data: cust } = await supabase.from('customers')
        .select('id, company_name, first_name, last_name, address, city, province, postal_code, region, country, email, phone')
        .eq('id', data.customer_id).single();
      if (cust) setSelectedCustomer(cust);
    }
    setLoading(false);
  };

  const selectCustomer = (id: string, custList?: Customer[]) => {
    const list = custList || customers;
    const c = list.find(c => c.id === id);
    if (c) {
      setSelectedCustomerId(c.id);
      setSelectedCustomer(c);
    }
  };

  const clearCustomer = () => {
    setSelectedCustomerId('');
    setSelectedCustomer(null);
  };

  const getCustomerName = (c: Customer) => {
    if (c.company_name) return c.company_name;
    return `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Senza nome';
  };

  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true;
    const name = getCustomerName(c).toLowerCase();
    return name.includes(customerSearch.toLowerCase());
  });

  const handleSave = async () => {
    if (!selectedCustomerId) {
      toast.error('Seleziona un cliente');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customer_id: selectedCustomerId,
        status,
        assigned_to: assignedTo || null,
        tipologia: tipologia || null,
        project_name: projectName || null,
        subject: subject || null,
        valid_until: validUntil || null,
        site_country: siteCountry || null,
        site_address: siteAddress || null,
        site_postal_code: sitePostalCode || null,
        site_city: siteCity || null,
        site_province: siteProvince || null,
        transport_method: transportMethod || null,
        delivery_time: deliveryTime || null,
        payment_type: paymentType || null,
        vat_rate: parseFloat(vatRate) || 0.22,
        payment_terms_text: paymentTermsText || null,
        notes: notes || null,
        created_by: user?.email || null,
      };

      if (editId) {
        const { error } = await supabase.from('quotes').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Preventivo aggiornato');
      } else {
        const quoteNumber = `PRV-${Date.now().toString().slice(-6)}`;
        const { error } = await supabase.from('quotes').insert({
          ...payload,
          quote_number: quoteNumber,
          total_amount: 0,
        });
        if (error) throw error;
        toast.success('Preventivo creato');
      }
      navigate('/admin/preventivi');
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Caricamento...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/preventivi')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{editId ? 'Modifica Preventivo' : 'Nuovo Preventivo'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/preventivi')}>Annulla</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />{saving ? 'Salvataggio...' : 'Salva'}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main content - Left */}
          <div className="space-y-6">
            {/* Cliente */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold">Cliente <span className="text-destructive">*</span></Label>
                    {selectedCustomer ? (
                      <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{getCustomerName(selectedCustomer)}</p>
                            {selectedCustomer.address && <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>}
                            {(selectedCustomer.postal_code || selectedCustomer.city) && (
                              <p className="text-sm text-muted-foreground">
                                {[selectedCustomer.postal_code, selectedCustomer.city, selectedCustomer.province ? `(${selectedCustomer.province})` : null].filter(Boolean).join(' ')}
                              </p>
                            )}
                            {selectedCustomer.country && <p className="text-sm text-muted-foreground">{selectedCustomer.country}</p>}
                          </div>
                          <Button variant="ghost" size="icon" onClick={clearCustomer} className="h-6 w-6">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Cerca cliente..."
                            value={customerSearch}
                            onChange={e => setCustomerSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                          {filteredCustomers.slice(0, 10).map(c => (
                            <button
                              key={c.id}
                              onClick={() => { selectCustomer(c.id); setCustomerSearch(''); }}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors text-sm"
                            >
                              <span className="font-medium">{getCustomerName(c)}</span>
                              {c.city && <span className="text-muted-foreground ml-2">— {c.city}</span>}
                            </button>
                          ))}
                          {filteredCustomers.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-3">Nessun cliente trovato</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Lead</Label>
                    <p className="text-sm text-muted-foreground mt-2">Nessun elemento selezionato.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offerta */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Offerta</h3>
                <Separator />
                <div className="space-y-2">
                  <Label>Nome progetto</Label>
                  <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Es. Villa Nordica, Hotel Centro..." />
                </div>
                <div className="space-y-2">
                  <Label>Oggetto offerta</Label>
                  <Textarea value={subject} onChange={e => setSubject(e.target.value)} placeholder="Descrizione dell'offerta..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Valido fino a</Label>
                  <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-48" />
                </div>
              </CardContent>
            </Card>

            {/* Indirizzo cantiere */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Indirizzo cantiere</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Paese <span className="text-destructive">*</span></Label>
                    <Select value={siteCountry} onValueChange={setSiteCountry}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Italia">Italia</SelectItem>
                        <SelectItem value="Germania">Germania</SelectItem>
                        <SelectItem value="Francia">Francia</SelectItem>
                        <SelectItem value="Svizzera">Svizzera</SelectItem>
                        <SelectItem value="Austria">Austria</SelectItem>
                        <SelectItem value="Altro">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Indirizzo</Label>
                    <Input value={siteAddress} onChange={e => setSiteAddress(e.target.value)} placeholder="Via Roma 1" />
                  </div>
                </div>
                <div className="grid grid-cols-[100px_1fr_100px] gap-4">
                  <div className="space-y-2">
                    <Label>CAP</Label>
                    <Input value={sitePostalCode} onChange={e => setSitePostalCode(e.target.value)} placeholder="25078" />
                  </div>
                  <div className="space-y-2">
                    <Label>Città</Label>
                    <Input value={siteCity} onChange={e => setSiteCity(e.target.value)} placeholder="Brescia" />
                  </div>
                  <div className="space-y-2">
                    <Label>Provincia</Label>
                    <Input value={siteProvince} onChange={e => setSiteProvince(e.target.value)} placeholder="BS" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Condizioni */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Condizioni</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metodo di trasporto</Label>
                    <Input value={transportMethod} onChange={e => setTransportMethod(e.target.value)} placeholder="Corriere, ritiro..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempi di consegna</Label>
                    <Input value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} placeholder="10-15 giorni lavorativi" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo di pagamento</Label>
                    <Select value={paymentType} onValueChange={setPaymentType}>
                      <SelectTrigger><SelectValue placeholder="Seleziona un'opzione" /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TYPES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Aliquota IVA predefinita <span className="text-destructive">*</span></Label>
                    <Select value={vatRate} onValueChange={setVatRate}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VAT_RATES.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Termini di pagamento</Label>
                  <Textarea value={paymentTermsText} onChange={e => setPaymentTermsText(e.target.value)} placeholder="Es. 30% anticipo, saldo alla consegna..." rows={4} />
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Note interne</h3>
                <Separator />
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note visibili solo internamente..." rows={3} />
              </CardContent>
            </Card>

            {/* Placeholder for future sections */}
            <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
              Le sezioni <strong>Prodotti</strong>, <strong>Accessori</strong> e <strong>Servizi</strong> verranno aggiunte nella prossima fase.
            </div>
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Stato <span className="text-destructive">*</span></Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUOTE_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tipologia</Label>
                  <Select value={tipologia} onValueChange={setTipologia}>
                    <SelectTrigger><SelectValue placeholder="Seleziona un'opzione" /></SelectTrigger>
                    <SelectContent>
                      {TIPOLOGIE.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Responsabile <span className="text-destructive">*</span></Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger><SelectValue placeholder="Seleziona un'opzione" /></SelectTrigger>
                    <SelectContent>
                      {salespeople.map(s => (
                        <SelectItem key={s.id} value={`${s.first_name} ${s.last_name}`}>
                          {s.first_name} {s.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuoteCreate;
