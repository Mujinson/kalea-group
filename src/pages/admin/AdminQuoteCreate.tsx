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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Save, X, Search, Plus, Trash2, Package } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PRODUCT_CATALOG, CatalogProduct } from '@/data/quoteProducts';

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

const UNITS = ['Metro quadro', 'Metro lineare', 'Pezzo', 'Sacco', 'Kg', 'Confezione'];

const MGO_COLORS = ['Aurora', 'Corteccia', 'Sabbia', 'Terram', 'Velora', 'Perla', 'Silven', 'Cenere'];

interface LineItem {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  price: number;
  quantity: number;
  unit: string;
  discount: number;
  total: number;
}

// "Nuovo" dialog state
type NewItemDialogState = {
  open: boolean;
  target: 'article' | 'accessory' | 'service';
  selectedProduct: CatalogProduct | null;
};

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

const emptyItem = (): LineItem => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  code: '', name: '', description: '', color: '', price: 0, quantity: 0, unit: 'Metro quadro', discount: 0, total: 0,
});

const fromCatalog = (p: CatalogProduct): LineItem => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  code: p.code, name: p.name, description: '', color: '', price: p.defaultPrice, quantity: 1, unit: p.defaultUnit, discount: 0, total: p.defaultPrice,
});

const calcTotal = (item: LineItem) => {
  const sub = item.price * item.quantity;
  return sub - (sub * item.discount / 100);
};

const AdminQuoteCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAdminAuth();
  const editId = searchParams.get('edit');
  const preselectedCustomerId = searchParams.get('customer');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Catalog dialog
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogTarget, setCatalogTarget] = useState<'article' | 'accessory' | 'service'>('article');
  const [catalogSearch, setCatalogSearch] = useState('');

  // "Nuovo" dialog (Geopietra-style)
  const [newItemDialog, setNewItemDialog] = useState<NewItemDialogState>({
    open: false, target: 'article', selectedProduct: null,
  });
  const [newItemCatalogOpen, setNewItemCatalogOpen] = useState(false);
  const [newItemCatalogSearch, setNewItemCatalogSearch] = useState('');

  // Form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState('draft');
  const [assignedTo, setAssignedTo] = useState('');
  const [tipologia, setTipologia] = useState('');
  const [projectName, setProjectName] = useState('');
  const [subject, setSubject] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Site address
  const [siteCountry, setSiteCountry] = useState('Italia');
  const [siteAddress, setSiteAddress] = useState('');
  const [sitePostalCode, setSitePostalCode] = useState('');
  const [siteCity, setSiteCity] = useState('');
  const [siteProvince, setSiteProvince] = useState('');

  // Conditions
  const [transportMethod, setTransportMethod] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [vatRate, setVatRate] = useState('0.22');
  const [paymentTermsText, setPaymentTermsText] = useState('');
  const [notes, setNotes] = useState('');

  // Line items
  const [articles, setArticles] = useState<LineItem[]>([]);
  const [accessories, setAccessories] = useState<LineItem[]>([]);
  const [services, setServices] = useState<LineItem[]>([]);

  // Totals
  const [discountPercent, setDiscountPercent] = useState(0);
  const [hidePrices, setHidePrices] = useState(false);
  const [agreedTotal, setAgreedTotal] = useState('');

  useEffect(() => { fetchInitialData(); }, []);
  useEffect(() => { if (editId) loadQuote(editId); }, [editId]);

  const fetchInitialData = async () => {
    const [custRes, spRes] = await Promise.all([
      supabase.from('customers').select('id, company_name, first_name, last_name, address, city, province, postal_code, region, country, email, phone').order('company_name'),
      supabase.from('salespeople').select('*').eq('is_active', true).order('first_name'),
    ]);
    const custList = custRes.data || [];
    setCustomers(custList);
    setSalespeople(spRes.data || []);

    const custId = preselectedCustomerId;
    if (custId) {
      const c = custList.find(c => c.id === custId);
      if (c) { setSelectedCustomerId(c.id); setSelectedCustomer(c); }
    }
  };

  const loadQuote = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('quotes').select('*').eq('id', id).single();
    if (error || !data) { toast.error('Preventivo non trovato'); navigate('/admin/preventivi'); return; }

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

    const items = data.items as any;
    if (items) {
      setArticles(items.articles || []);
      setAccessories(items.accessories || []);
      setServices(items.services || []);
      setDiscountPercent(items.discountPercent || 0);
      setHidePrices(items.hidePrices || false);
      setAgreedTotal(items.agreedTotal || '');
    }

    if (data.customer_id) {
      const { data: cust } = await supabase.from('customers')
        .select('id, company_name, first_name, last_name, address, city, province, postal_code, region, country, email, phone')
        .eq('id', data.customer_id).single();
      if (cust) setSelectedCustomer(cust);
    }
    setLoading(false);
  };

  const clearCustomer = () => { setSelectedCustomerId(''); setSelectedCustomer(null); };
  const getCustomerName = (c: Customer) => c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Senza nome';

  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true;
    return getCustomerName(c).toLowerCase().includes(customerSearch.toLowerCase());
  });

  const updateItem = (list: LineItem[], setList: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string, field: keyof LineItem, value: any) => {
    setList(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      updated.total = calcTotal(updated);
      return updated;
    }));
  };

  const removeItem = (_list: LineItem[], setList: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string) => {
    setList(prev => prev.filter(i => i.id !== id));
  };

  // Catalog helpers
  const openCatalog = (target: 'article' | 'accessory' | 'service') => {
    setCatalogTarget(target);
    setCatalogSearch('');
    setCatalogOpen(true);
  };

  const addFromCatalog = (product: CatalogProduct) => {
    const newItem = fromCatalog(product);
    if (catalogTarget === 'article') setArticles(prev => [...prev, newItem]);
    else if (catalogTarget === 'accessory') setAccessories(prev => [...prev, newItem]);
    else setServices(prev => [...prev, newItem]);
    setCatalogOpen(false);
  };

  // "Nuovo" dialog helpers
  const openNewItemDialog = (target: 'article' | 'accessory' | 'service') => {
    setNewItemDialog({ open: true, target, selectedProduct: null });
    setNewItemCatalogSearch('');
  };

  const saveNewItem = () => {
    const p = newItemDialog.selectedProduct;
    if (!p) { toast.error('Seleziona un prodotto dal catalogo'); return; }
    const newItem = fromCatalog(p);
    if (newItemDialog.target === 'article') setArticles(prev => [...prev, newItem]);
    else if (newItemDialog.target === 'accessory') setAccessories(prev => [...prev, newItem]);
    else setServices(prev => [...prev, newItem]);
    setNewItemDialog({ open: false, target: 'article', selectedProduct: null });
  };

  const newItemFilteredCatalog = PRODUCT_CATALOG.filter(p => {
    if (p.category !== newItemDialog.target) return false;
    if (!newItemCatalogSearch) return true;
    return p.name.toLowerCase().includes(newItemCatalogSearch.toLowerCase()) || p.code.toLowerCase().includes(newItemCatalogSearch.toLowerCase());
  });

  const filteredCatalog = PRODUCT_CATALOG.filter(p => {
    if (p.category !== catalogTarget) return false;
    if (!catalogSearch) return true;
    return p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || p.code.toLowerCase().includes(catalogSearch.toLowerCase());
  });

  // Totals
  const articlesTotal = articles.reduce((s, i) => s + calcTotal(i), 0);
  const accessoriesTotal = accessories.reduce((s, i) => s + calcTotal(i), 0);
  const servicesTotal = services.reduce((s, i) => s + calcTotal(i), 0);
  const subtotal = articlesTotal + accessoriesTotal + servicesTotal;
  const discountAmount = subtotal * discountPercent / 100;
  const afterDiscount = subtotal - discountAmount;
  const vatAmount = afterDiscount * parseFloat(vatRate);
  const grandTotal = afterDiscount + vatAmount;

  const handleSave = async () => {
    if (!selectedCustomerId) { toast.error('Seleziona un cliente'); return; }
    setSaving(true);
    try {
      const itemsJson = {
        articles, accessories, services,
        discountPercent, hidePrices,
        agreedTotal: agreedTotal || null,
      };

      const payload: any = {
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
        items: itemsJson,
        total_amount: grandTotal,
        vat_amount: vatAmount,
        vat_included: false,
      };

      if (editId) {
        const { error } = await supabase.from('quotes').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Preventivo aggiornato');
      } else {
        payload.quote_number = `PRV-${Date.now().toString().slice(-6)}`;
        const { error } = await supabase.from('quotes').insert(payload);
        if (error) throw error;
        toast.success('Preventivo creato');
      }
      navigate('/admin/preventivi');
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Errore nel salvataggio');
    } finally { setSaving(false); }
  };

  const renderLineTable = (
    title: string,
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    sectionTotal: number,
    catalogCategory: 'article' | 'accessory' | 'service',
  ) => (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => openCatalog(catalogCategory)}>
              <Package className="w-4 h-4 mr-1" />Catalogo
            </Button>
            <Button size="sm" onClick={() => setItems(prev => [...prev, emptyItem()])}>
              <Plus className="w-4 h-4 mr-1" />Nuovo
            </Button>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nessun elemento. Clicca "Catalogo" o "Nuovo" per aggiungere.</p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Codice</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-28">Tonalità</TableHead>
                    <TableHead className="w-24 text-right">Prezzo</TableHead>
                    <TableHead className="w-20 text-right">Qtà</TableHead>
                    <TableHead className="w-28">Unità</TableHead>
                    <TableHead className="w-20 text-right">Sconto</TableHead>
                    <TableHead className="w-28 text-right">Totale</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input value={item.code} onChange={e => updateItem(items, setItems, item.id, 'code', e.target.value)} className="h-8 text-xs" />
                      </TableCell>
                      <TableCell>
                        <Input value={item.name} onChange={e => updateItem(items, setItems, item.id, 'name', e.target.value)} className="h-8 text-xs" placeholder="Nome prodotto" />
                      </TableCell>
                      <TableCell>
                        <Select value={item.color} onValueChange={v => updateItem(items, setItems, item.id, 'color', v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            {MGO_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={item.price || ''} onChange={e => updateItem(items, setItems, item.id, 'price', parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={item.quantity || ''} onChange={e => updateItem(items, setItems, item.id, 'quantity', parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right" />
                      </TableCell>
                      <TableCell>
                        <Select value={item.unit} onValueChange={v => updateItem(items, setItems, item.id, 'unit', v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input type="number" value={item.discount || ''} onChange={e => updateItem(items, setItems, item.id, 'discount', parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right w-16" />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        €{calcTotal(item).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(items, setItems, item.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end pt-3 border-t mt-3">
              <div className="text-sm">
                <span className="text-muted-foreground mr-2">Riepilogo</span>
                <span className="font-semibold">€{sectionTotal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  if (loading) return <div className="flex items-center justify-center h-96">Caricamento...</div>;

  return (
    <div>
      {/* Top bar */}
      <div className="bg-background border-b px-4 py-3 flex items-center justify-between -m-3 md:-m-6 mb-4 md:mb-6 px-3 md:px-6">
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

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main content */}
          <div className="space-y-4">
            {/* Cliente */}
            <Card>
              <CardContent className="p-4 md:p-6">
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
                          <Input placeholder="Cerca cliente..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-10" />
                        </div>
                        <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                          {filteredCustomers.slice(0, 10).map(c => (
                            <button key={c.id} onClick={() => { setSelectedCustomerId(c.id); setSelectedCustomer(c); setCustomerSearch(''); }}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
                              <span className="font-medium">{getCustomerName(c)}</span>
                              {c.city && <span className="text-muted-foreground ml-2">— {c.city}</span>}
                            </button>
                          ))}
                          {filteredCustomers.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Nessun cliente trovato</p>}
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
              <CardContent className="p-4 md:p-6 space-y-4">
                <h3 className="text-lg font-semibold">Offerta</h3>
                <Separator />
                <div className="space-y-2">
                  <Label>Nome progetto</Label>
                  <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Es. Villa Nordica, Hotel Centro..." />
                </div>
                <div className="space-y-2">
                  <Label>Oggetto offerta</Label>
                  <Textarea value={subject} onChange={e => setSubject(e.target.value)} placeholder="Descrizione dell'offerta..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Valido fino a</Label>
                  <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-48" />
                </div>
              </CardContent>
            </Card>

            {/* Indirizzo cantiere */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
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

            {/* Articoli */}
            {renderLineTable('Articoli', articles, setArticles, articlesTotal, 'article')}

            {/* Accessori */}
            {renderLineTable('Accessori', accessories, setAccessories, accessoriesTotal, 'accessory')}

            {/* Servizi */}
            {renderLineTable('Servizi', services, setServices, servicesTotal, 'service')}

            {/* Totals Section */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h3 className="text-lg font-semibold">Riepilogo economico</h3>
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Subtotale</Label>
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                      <span className="text-muted-foreground text-sm">€</span>
                      <span className="font-medium">{subtotal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Sconto globale</Label>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={discountPercent || ''} onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)} className="h-10" />
                      <span className="text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Totale (IVA incl.)</Label>
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                      <span className="text-muted-foreground text-sm">€</span>
                      <span className="font-semibold">{grandTotal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Totale concordato</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">€</span>
                      <Input type="number" value={agreedTotal} onChange={e => setAgreedTotal(e.target.value)} placeholder={grandTotal.toFixed(2)} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Switch checked={hidePrices} onCheckedChange={setHidePrices} />
                  <div>
                    <Label className="text-sm font-medium">Nascondi prezzi</Label>
                    <p className="text-xs text-muted-foreground">Nascondi il prezzo di prodotti e accessori nel documento PDF</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Condizioni */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
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
                    <Label>Aliquota IVA</Label>
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
                  <Textarea value={paymentTermsText} onChange={e => setPaymentTermsText(e.target.value)} placeholder="Es. 30% anticipo, saldo alla consegna..." rows={3} />
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h3 className="text-lg font-semibold">Note interne</h3>
                <Separator />
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note visibili solo internamente..." rows={3} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
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

      {/* Product Catalog Dialog */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Catalogo {catalogTarget === 'article' ? 'Articoli' : catalogTarget === 'accessory' ? 'Accessori' : 'Servizi'}
            </DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cerca nel catalogo..." value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="overflow-y-auto max-h-[50vh] divide-y rounded-lg border">
            {filteredCatalog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nessun prodotto trovato</p>
            ) : (
              filteredCatalog.map(p => (
                <button key={p.code} onClick={() => addFromCatalog(p)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{p.code}</span>
                      <span className="font-medium text-sm truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{p.defaultUnit}</span>
                      {p.hasColor && <span className="text-xs text-muted-foreground">• Con tonalità</span>}
                    </div>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">€{p.defaultPrice.toFixed(2)}</span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuoteCreate;
