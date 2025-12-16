import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Trash2, User, Package, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Constants
const MGO_COLORS = ['Aurora', 'Corteccia', 'Sabbia', 'Terram', 'Velora', 'Perla', 'Silven', 'Cenere'];
const CWC_VARIANTS = ['CWC n.1', 'CWC n.2', 'CWC n.3', 'CWC n.4', 'CWC n.5', 'CWC n.6', 'CWC n.7'];

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

const PAYMENT_METHODS = [
  { value: 'carta_credito', label: 'Carta di credito' },
  { value: 'bonifico', label: 'Bonifico' },
  { value: 'contanti', label: 'Contanti' },
  { value: 'assegno', label: 'Assegno' },
];

const PAYMENT_TERMS = [
  { group: 'Anticipo + Saldo', options: [
    '30% anticipo - 70% consegna',
    '40% anticipo - 60% consegna',
    '50% anticipo - 50% consegna',
    '30% anticipo - 70% prima spedizione',
    '50% anticipo - 50% prima spedizione',
  ]},
  { group: 'Pagamento alla consegna', options: [
    '100% alla consegna',
    '100% contrassegno',
  ]},
  { group: 'Pagamento anticipato', options: [
    '100% all\'ordine',
    '100% prima produzione',
    '100% prima spedizione',
  ]},
  { group: 'Pagamento differito', options: [
    '30 giorni data fattura',
    '30 giorni data consegna',
    '60 giorni data fattura',
    '60 giorni data consegna',
    '90 giorni data fattura',
  ]},
  { group: 'Pagamenti rateizzati', options: [
    '30% anticipo - saldo 2 rate (30/60 gg)',
    '30% anticipo - saldo 3 rate mensili',
    '50% anticipo - saldo 2 rate',
    '3 rate mensili senza anticipo',
    '6 rate mensili (su approvazione)',
  ]},
  { group: 'Progetti complessi', options: [
    '30% ordine - 40% metà produzione - 30% consegna',
    '30% ordine - 50% spedizione - 20% consegna',
    '40% ordine - 40% spedizione - 20% consegna',
  ]},
];

const PAYMENT_NOTES_OPTIONS = [
  'Modalità soggetta ad approvazione Kalēa',
  'Produzione avviata solo a ricezione anticipo',
  'Merce di proprietà Kalēa fino a saldo completo',
  'Ritardi di pagamento comportano sospensione consegna',
];

const ADDITIONAL_COST_TYPES = [
  { key: 'trasporto', label: 'Trasporto', unit: 'km' },
  { key: 'tappetino', label: 'Tappetino', unit: 'mq' },
  { key: 'posa', label: 'Posa', unit: 'mq' },
  { key: 'profili', label: 'Profili', unit: 'mq' },
  { key: 'profili_giunzione', label: 'Profili di giunzione', unit: 'pz' },
  { key: 'profili_terminali', label: 'Profili terminali', unit: 'pz' },
  { key: 'battiscopa', label: 'Battiscopa', unit: 'mq' },
];

interface Sale {
  id: string;
  product_type: string;
  color: string | null;
  quantity_sqm: number;
  sale_price: number;
  channel: string;
  customer_id: string | null;
  customer_name: string | null;
  vat_included: boolean;
  vat_amount: number | null;
  payment_method: string | null;
  payment_terms: string | null;
  payment_notes: string | null;
  deposit_amount: number | null;
  deposit_date: string | null;
  balance_amount: number | null;
  balance_due_date: string | null;
  notes: string | null;
  sale_date: string;
  created_at: string;
}

interface Customer {
  id: string;
  customer_type: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
}

interface SaleItem {
  product_type: string;
  product_variant: string;
  quantity_sqm: number;
  unit_price: number;
}

interface AdditionalCost {
  cost_type: string;
  quantity: number;
  unit_price: number;
}

const AdminSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('customer');
  
  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer_type: '',
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    vat_number: '',
    pec: '',
    sdi_code: '',
  });

  const [saleItems, setSaleItems] = useState<SaleItem[]>([
    { product_type: 'MgO', product_variant: '', quantity_sqm: 0, unit_price: 0 }
  ]);
  
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  
  const [saleData, setSaleData] = useState({
    channel: 'B2B',
    sale_date: format(new Date(), 'yyyy-MM-dd'),
    vat_included: false,
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    payment_terms: '',
    payment_notes: [] as string[],
    deposit_amount: '',
    deposit_date: '',
    balance_due_date: '',
  });

  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, []);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Errore nel caricamento vendite');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, customer_type, first_name, last_name, company_name, email, phone')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const getCustomerName = (customer: Customer) => {
    if (customer.company_name) return customer.company_name;
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente';
  };

  const calculateTotals = () => {
    const itemsTotal = saleItems.reduce((sum, item) => sum + (item.quantity_sqm * item.unit_price), 0);
    const costsTotal = additionalCosts.reduce((sum, cost) => sum + (cost.quantity * cost.unit_price), 0);
    const subtotal = itemsTotal + costsTotal;
    const vatAmount = saleData.vat_included ? 0 : subtotal * 0.22;
    const total = subtotal + vatAmount;
    const totalQty = saleItems.reduce((sum, item) => sum + item.quantity_sqm, 0);
    return { itemsTotal, costsTotal, subtotal, vatAmount, total, totalQty };
  };

  const handleSubmit = async () => {
    // Validate
    if (!isNewCustomer && !selectedCustomerId) {
      toast.error('Seleziona un cliente');
      return;
    }
    if (isNewCustomer && !newCustomer.customer_type) {
      toast.error('Seleziona la tipologia cliente');
      return;
    }
    if (saleItems.every(item => !item.quantity_sqm)) {
      toast.error('Aggiungi almeno un prodotto');
      return;
    }

    try {
      let customerId = selectedCustomerId;
      let customerName = '';

      // Create new customer if needed
      if (isNewCustomer) {
        const customerInsertData = {
          customer_type: newCustomer.customer_type as "architetto" | "azienda_pubblica" | "cliente_privato" | "costruttore" | "interior_designer" | "posatore" | "rivenditore" | "showroom" | "studio_design",
          first_name: newCustomer.first_name || null,
          last_name: newCustomer.last_name || null,
          company_name: newCustomer.company_name || null,
          email: newCustomer.email || null,
          phone: newCustomer.phone || null,
          address: newCustomer.address || null,
          city: newCustomer.city || null,
          vat_number: newCustomer.vat_number || null,
          pec: newCustomer.pec || null,
          sdi_code: newCustomer.sdi_code || null,
        };

        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert(customerInsertData)
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = customerData.id;
        customerName = newCustomer.company_name || `${newCustomer.first_name} ${newCustomer.last_name}`.trim();
      } else {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) customerName = getCustomerName(customer);
      }

      const { itemsTotal, costsTotal, vatAmount, total, totalQty } = calculateTotals();
      const depositAmount = paymentData.deposit_amount ? parseFloat(paymentData.deposit_amount) : 0;
      const balanceAmount = total - depositAmount;

      // Create sale
      const saleInsertData = {
        customer_id: customerId || null,
        customer_name: customerName,
        product_type: saleItems[0]?.product_type || 'MgO',
        color: saleItems[0]?.product_variant || null,
        quantity_sqm: totalQty,
        sale_price: totalQty > 0 ? itemsTotal / totalQty : 0,
        channel: saleData.channel,
        sale_date: saleData.sale_date,
        vat_included: saleData.vat_included,
        vat_amount: vatAmount,
        payment_method: (paymentData.payment_method || null) as "assegno" | "bonifico" | "carta_credito" | "contanti" | null,
        payment_terms: paymentData.payment_terms || null,
        payment_notes: paymentData.payment_notes.join('; ') || null,
        deposit_amount: depositAmount,
        deposit_date: paymentData.deposit_date || null,
        balance_amount: balanceAmount,
        balance_due_date: paymentData.balance_due_date || null,
        notes: saleData.notes || null,
      };

      const { data: saleResult, error: saleError } = await supabase
        .from('sales')
        .insert(saleInsertData)
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const itemsToInsert = saleItems
        .filter(item => item.quantity_sqm > 0)
        .map(item => ({
          sale_id: saleResult.id,
          product_type: item.product_type,
          product_variant: item.product_variant || null,
          quantity_sqm: item.quantity_sqm,
          unit_price: item.unit_price,
          total_price: item.quantity_sqm * item.unit_price,
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      // Create additional costs
      const costsToInsert = additionalCosts
        .filter(cost => cost.quantity > 0)
        .map(cost => ({
          sale_id: saleResult.id,
          cost_type: cost.cost_type,
          quantity: cost.quantity,
          unit_price: cost.unit_price,
          total_price: cost.quantity * cost.unit_price,
          unit: ADDITIONAL_COST_TYPES.find(t => t.key === cost.cost_type)?.unit || null,
        }));

      if (costsToInsert.length > 0) {
        const { error: costsError } = await supabase.from('sale_additional_costs').insert(costsToInsert);
        if (costsError) throw costsError;
      }

      // Create payment schedule if balance exists
      if (balanceAmount > 0 && paymentData.balance_due_date) {
        const { error: scheduleError } = await supabase.from('payment_schedules').insert({
          sale_id: saleResult.id,
          amount: balanceAmount,
          due_date: paymentData.balance_due_date,
          is_paid: false,
          payment_type: 'saldo',
        });
        if (scheduleError) throw scheduleError;
      }

      toast.success('Vendita registrata con successo');
      setDialogOpen(false);
      resetForm();
      fetchSales();
      fetchCustomers();
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Errore nel salvataggio della vendita');
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setIsNewCustomer(false);
    setNewCustomer({
      customer_type: '',
      first_name: '',
      last_name: '',
      company_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      vat_number: '',
      pec: '',
      sdi_code: '',
    });
    setSaleItems([{ product_type: 'MgO', product_variant: '', quantity_sqm: 0, unit_price: 0 }]);
    setAdditionalCosts([]);
    setSaleData({
      channel: 'B2B',
      sale_date: format(new Date(), 'yyyy-MM-dd'),
      vat_included: false,
      notes: '',
    });
    setPaymentData({
      payment_method: '',
      payment_terms: '',
      payment_notes: [],
      deposit_amount: '',
      deposit_date: '',
      balance_due_date: '',
    });
    setActiveTab('customer');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa vendita?')) return;

    try {
      // Delete related records first
      await supabase.from('sale_items').delete().eq('sale_id', id);
      await supabase.from('sale_additional_costs').delete().eq('sale_id', id);
      await supabase.from('payment_schedules').delete().eq('sale_id', id);
      
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Vendita eliminata');
      fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { product_type: 'MgO', product_variant: '', quantity_sqm: 0, unit_price: 0 }]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    const updated = [...saleItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'product_type') {
      updated[index].product_variant = '';
    }
    setSaleItems(updated);
  };

  const addAdditionalCost = (costType: string) => {
    if (!additionalCosts.find(c => c.cost_type === costType)) {
      setAdditionalCosts([...additionalCosts, { cost_type: costType, quantity: 0, unit_price: 0 }]);
    }
  };

  const removeAdditionalCost = (costType: string) => {
    setAdditionalCosts(additionalCosts.filter(c => c.cost_type !== costType));
  };

  const updateAdditionalCost = (costType: string, field: 'quantity' | 'unit_price', value: number) => {
    setAdditionalCosts(additionalCosts.map(c => 
      c.cost_type === costType ? { ...c, [field]: value } : c
    ));
  };

  const togglePaymentNote = (note: string) => {
    setPaymentData(prev => ({
      ...prev,
      payment_notes: prev.payment_notes.includes(note)
        ? prev.payment_notes.filter(n => n !== note)
        : [...prev.payment_notes, note]
    }));
  };

  const totals = calculateTotals();
  const totalMq = sales.reduce((sum, s) => sum + Number(s.quantity_sqm), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendite</h2>
          <p className="text-muted-foreground">Gestisci le vendite e monitora i ricavi</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Vendita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registra Vendita</DialogTitle>
              <DialogDescription>Compila tutti i dati della vendita</DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Cliente</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Prodotti</span>
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Pagamento</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Riepilogo</span>
                </TabsTrigger>
              </TabsList>

              {/* Customer Tab */}
              <TabsContent value="customer" className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <Checkbox 
                    id="newCustomer" 
                    checked={isNewCustomer} 
                    onCheckedChange={(checked) => setIsNewCustomer(!!checked)}
                  />
                  <Label htmlFor="newCustomer">Nuovo cliente</Label>
                </div>

                {!isNewCustomer ? (
                  <div className="space-y-2">
                    <Label>Seleziona Cliente</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cerca cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {getCustomerName(customer)} - {customer.email || customer.phone || 'Nessun contatto'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipologia Cliente *</Label>
                      <Select value={newCustomer.customer_type} onValueChange={(v) => setNewCustomer({...newCustomer, customer_type: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipologia" />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOMER_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={newCustomer.first_name} onChange={(e) => setNewCustomer({...newCustomer, first_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Cognome / Ragione Sociale</Label>
                        <Input value={newCustomer.last_name} onChange={(e) => setNewCustomer({...newCustomer, last_name: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome Azienda</Label>
                      <Input value={newCustomer.company_name} onChange={(e) => setNewCustomer({...newCustomer, company_name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefono</Label>
                        <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Partita IVA</Label>
                        <Input value={newCustomer.vat_number} onChange={(e) => setNewCustomer({...newCustomer, vat_number: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Codice SDI</Label>
                        <Input value={newCustomer.sdi_code} onChange={(e) => setNewCustomer({...newCustomer, sdi_code: e.target.value})} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Canale</Label>
                    <Select value={saleData.channel} onValueChange={(v) => setSaleData({...saleData, channel: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B2B">B2B</SelectItem>
                        <SelectItem value="B2C">B2C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data Vendita</Label>
                    <Input type="date" value={saleData.sale_date} onChange={(e) => setSaleData({...saleData, sale_date: e.target.value})} />
                  </div>
                </div>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {saleItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Prodotto {index + 1}</span>
                        {saleItems.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeSaleItem(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo Prodotto</Label>
                          <Select value={item.product_type} onValueChange={(v) => updateSaleItem(index, 'product_type', v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MgO">MgO</SelectItem>
                              <SelectItem value="CWC">CWC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Variante / Colore</Label>
                          <Select value={item.product_variant} onValueChange={(v) => updateSaleItem(index, 'product_variant', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona..." />
                            </SelectTrigger>
                            <SelectContent>
                              {item.product_type === 'MgO' 
                                ? MGO_COLORS.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)
                                : CWC_VARIANTS.map(variant => <SelectItem key={variant} value={variant}>{variant}</SelectItem>)
                              }
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Quantità (mq)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={item.quantity_sqm || ''} 
                            onChange={(e) => updateSaleItem(index, 'quantity_sqm', parseFloat(e.target.value) || 0)} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Prezzo (€/mq)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={item.unit_price || ''} 
                            onChange={(e) => updateSaleItem(index, 'unit_price', parseFloat(e.target.value) || 0)} 
                          />
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        Subtotale: {formatCurrency(item.quantity_sqm * item.unit_price)}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addSaleItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Aggiungi Prodotto
                  </Button>
                </div>

                {/* Additional Costs */}
                <div className="pt-4 border-t">
                  <Label className="text-base font-medium">Costi Aggiuntivi</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ADDITIONAL_COST_TYPES.map(type => (
                      <Button 
                        key={type.key}
                        variant={additionalCosts.find(c => c.cost_type === type.key) ? "default" : "outline"}
                        size="sm"
                        onClick={() => additionalCosts.find(c => c.cost_type === type.key) 
                          ? removeAdditionalCost(type.key) 
                          : addAdditionalCost(type.key)
                        }
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                  {additionalCosts.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {additionalCosts.map(cost => {
                        const typeInfo = ADDITIONAL_COST_TYPES.find(t => t.key === cost.cost_type);
                        return (
                          <div key={cost.cost_type} className="grid grid-cols-3 gap-4 items-end">
                            <div className="space-y-1">
                              <Label className="text-xs">{typeInfo?.label}</Label>
                              <Input 
                                type="number" 
                                placeholder={`Quantità (${typeInfo?.unit})`}
                                value={cost.quantity || ''} 
                                onChange={(e) => updateAdditionalCost(cost.cost_type, 'quantity', parseFloat(e.target.value) || 0)} 
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Prezzo €/{typeInfo?.unit}</Label>
                              <Input 
                                type="number" 
                                placeholder="Prezzo"
                                value={cost.unit_price || ''} 
                                onChange={(e) => updateAdditionalCost(cost.cost_type, 'unit_price', parseFloat(e.target.value) || 0)} 
                              />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(cost.quantity * cost.unit_price)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Checkbox 
                    id="vatIncluded" 
                    checked={saleData.vat_included} 
                    onCheckedChange={(checked) => setSaleData({...saleData, vat_included: !!checked})}
                  />
                  <Label htmlFor="vatIncluded">IVA inclusa nel prezzo</Label>
                </div>
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metodo di Pagamento</Label>
                    <Select value={paymentData.payment_method} onValueChange={(v) => setPaymentData({...paymentData, payment_method: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(method => (
                          <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condizioni di Pagamento</Label>
                    <Select value={paymentData.payment_terms} onValueChange={(v) => setPaymentData({...paymentData, payment_terms: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map(group => (
                          <div key={group.group}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group.group}</div>
                            {group.options.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Note Operative</Label>
                  <div className="space-y-2">
                    {PAYMENT_NOTES_OPTIONS.map(note => (
                      <div key={note} className="flex items-center gap-2">
                        <Checkbox 
                          id={note} 
                          checked={paymentData.payment_notes.includes(note)}
                          onCheckedChange={() => togglePaymentNote(note)}
                        />
                        <Label htmlFor={note} className="text-sm font-normal">{note}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Anticipo Ricevuto (€)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={paymentData.deposit_amount} 
                      onChange={(e) => setPaymentData({...paymentData, deposit_amount: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Anticipo</Label>
                    <Input 
                      type="date" 
                      value={paymentData.deposit_date} 
                      onChange={(e) => setPaymentData({...paymentData, deposit_date: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Scadenza Saldo</Label>
                  <Input 
                    type="date" 
                    value={paymentData.balance_due_date} 
                    onChange={(e) => setPaymentData({...paymentData, balance_due_date: e.target.value})} 
                  />
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Riepilogo Vendita</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Prodotti ({totals.totalQty.toFixed(1)} mq)</span>
                      <span>{formatCurrency(totals.itemsTotal)}</span>
                    </div>
                    {totals.costsTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Costi aggiuntivi</span>
                        <span>{formatCurrency(totals.costsTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span>Subtotale</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    {!saleData.vat_included && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>IVA (22%)</span>
                        <span>{formatCurrency(totals.vatAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Totale</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                    {paymentData.deposit_amount && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>Anticipo ricevuto</span>
                          <span>- {formatCurrency(parseFloat(paymentData.deposit_amount))}</span>
                        </div>
                        <div className="flex justify-between font-bold text-orange-600">
                          <span>Saldo da incassare</span>
                          <span>{formatCurrency(totals.total - parseFloat(paymentData.deposit_amount))}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea 
                    value={saleData.notes} 
                    onChange={(e) => setSaleData({...saleData, notes: e.target.value})}
                    placeholder="Note aggiuntive sulla vendita..."
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg">
                  Salva Vendita
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totale Venduto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMq.toFixed(0)} mq</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prezzo Medio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMq > 0 ? formatCurrency(totalRevenue / totalMq) : '€0'}/mq</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Storico Vendite</CardTitle>
          <CardDescription>{sales.length} vendite registrate</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Caricamento...</p>
          ) : sales.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessuna vendita registrata</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Prodotto</TableHead>
                  <TableHead>Canale</TableHead>
                  <TableHead className="text-right">Quantità</TableHead>
                  <TableHead className="text-right">Prezzo/mq</TableHead>
                  <TableHead className="text-right">Totale</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{format(new Date(sale.sale_date), 'dd MMM yyyy', { locale: it })}</TableCell>
                    <TableCell>
                      {sale.product_type}
                      {sale.color && <span className="text-muted-foreground ml-1">({sale.color})</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${sale.channel === 'B2B' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {sale.channel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{Number(sale.quantity_sqm).toFixed(0)} mq</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(sale.sale_price))}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(sale.quantity_sqm) * Number(sale.sale_price))}</TableCell>
                    <TableCell className="text-muted-foreground">{sale.customer_name || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSales;
