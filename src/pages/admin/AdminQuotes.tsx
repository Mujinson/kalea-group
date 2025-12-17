import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Send, FileText, CheckCircle2, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const MGO_COLORS = ['Aurora', 'Corteccia', 'Sabbia', 'Terram', 'Velora', 'Perla', 'Silven', 'Cenere'];
const CWC_VARIANTS = ['CWC-01', 'CWC-02', 'CWC-03', 'CWC-04', 'CWC-05', 'CWC-06', 'CWC-07'];

interface QuoteItem {
  id: string;
  product_type: string;
  color?: string;
  quantity_sqm: number;
  unit_price: number;
  total_price: number;
}

interface Quote {
  id: string;
  customer_id: string | null;
  quote_number: string | null;
  status: string;
  total_amount: number;
  vat_amount: number;
  vat_included: boolean;
  valid_until: string | null;
  notes: string | null;
  items: QuoteItem[];
  created_at: string;
  customer?: { company_name: string | null; first_name: string | null; last_name: string | null };
}

const AdminQuotes = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [vatIncluded, setVatIncluded] = useState(false);
  const [items, setItems] = useState<QuoteItem[]>([]);

  // New item state
  const [newItemProductType, setNewItemProductType] = useState('MgO');
  const [newItemColor, setNewItemColor] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  useEffect(() => {
    fetchData();
    
    // Pre-select customer if coming from customer detail
    const customerId = searchParams.get('customer');
    if (customerId) {
      setSelectedCustomerId(customerId);
      setDialogOpen(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quotesRes, customersRes] = await Promise.all([
        supabase.from('quotes').select('*, customer:customers(company_name, first_name, last_name)').order('created_at', { ascending: false }),
        supabase.from('customers').select('id, company_name, first_name, last_name').order('company_name'),
      ]);

      setQuotes((quotesRes.data || []) as any);
      setCustomers(customersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!newItemQty || !newItemPrice) {
      toast.error('Inserisci quantità e prezzo');
      return;
    }

    const qty = parseFloat(newItemQty);
    const price = parseFloat(newItemPrice);
    
    const item: QuoteItem = {
      id: Date.now().toString(),
      product_type: newItemProductType,
      color: newItemProductType === 'MgO' ? newItemColor : undefined,
      quantity_sqm: qty,
      unit_price: price,
      total_price: qty * price,
    };

    setItems([...items, item]);
    setNewItemQty('');
    setNewItemPrice('');
    setNewItemColor('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const vat = vatIncluded ? 0 : subtotal * 0.22;
    return { subtotal, vat, total: subtotal + vat };
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      toast.error('Seleziona un cliente');
      return;
    }
    if (items.length === 0) {
      toast.error('Aggiungi almeno un prodotto');
      return;
    }

    try {
      const { subtotal, vat, total } = calculateTotals();
      const quoteNumber = `PRV-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase.from('quotes').insert({
        customer_id: selectedCustomerId,
        quote_number: quoteNumber,
        status: 'draft',
        total_amount: total,
        vat_amount: vat,
        vat_included: vatIncluded,
        valid_until: validUntil || null,
        notes: notes || null,
        items: items as any,
        created_by: user?.email || null,
      });

      if (error) throw error;

      toast.success('Preventivo creato');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setValidUntil('');
    setNotes('');
    setVatIncluded(false);
    setItems([]);
    setNewItemProductType('MgO');
    setNewItemColor('');
    setNewItemQty('');
    setNewItemPrice('');
  };

  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'sent') {
        updates.sent_date = new Date().toISOString();
      }

      await supabase.from('quotes').update(updates).eq('id', quoteId);
      toast.success(`Stato aggiornato a ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Errore aggiornamento');
    }
  };

  const convertToSale = async (quote: Quote) => {
    if (!quote.customer_id) {
      toast.error('Preventivo senza cliente');
      return;
    }

    try {
      // Parse items and amounts safely as numbers
      const quoteItems = Array.isArray(quote.items) ? quote.items : [];
      const firstItem = quoteItems[0];
      const totalAmount = Number(quote.total_amount) || 0;
      const vatAmount = Number(quote.vat_amount) || 0;
      const totalQty = quoteItems.reduce((sum, i) => sum + (Number(i.quantity_sqm) || 0), 0);

      // Create sale
      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        customer_id: quote.customer_id,
        product_type: firstItem?.product_type || 'MgO',
        color: firstItem?.color || null,
        quantity_sqm: totalQty,
        sale_price: totalAmount,
        vat_included: quote.vat_included,
        vat_amount: vatAmount,
        notes: `Convertito da preventivo ${quote.quote_number}`,
      }).select().single();

      if (saleError) throw saleError;

      // Update quote
      await supabase.from('quotes').update({
        status: 'converted',
        converted_sale_id: saleData.id,
        accepted_date: new Date().toISOString(),
      }).eq('id', quote.id);

      // Update customer - set to "working" status since they now have a sale
      const { data: custData } = await supabase.from('customers')
        .select('total_value')
        .eq('id', quote.customer_id)
        .single();

      const newTotalValue = (Number(custData?.total_value) || 0) + totalAmount;
      
      await supabase.from('customers').update({
        status: 'working' as const,
        total_value: newTotalValue,
      }).eq('id', quote.customer_id);

      toast.success('Preventivo convertito in vendita');
      fetchData();
    } catch (error) {
      console.error('Error converting:', error);
      toast.error('Errore nella conversione');
    }
  };

  const sendQuoteByEmail = async (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customer_id);
    if (!customer) {
      toast.error('Cliente non trovato');
      return;
    }

    // For now, open mailto
    const subject = encodeURIComponent(`Preventivo ${quote.quote_number} - Kalēa`);
    const body = encodeURIComponent(
      `Gentile ${customer.company_name || customer.first_name},\n\n` +
      `In allegato trova il preventivo ${quote.quote_number} per un totale di €${quote.total_amount.toLocaleString()}.\n\n` +
      `Validità: ${quote.valid_until ? format(new Date(quote.valid_until), 'dd/MM/yyyy') : 'Da concordare'}\n\n` +
      `Cordiali saluti,\n${user?.email}`
    );

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    // Update status to sent
    await updateQuoteStatus(quote.id, 'sent');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800',
    };
    return styles[status] || styles.draft;
  };

  const getCustomerName = (quote: Quote) => {
    if (quote.customer?.company_name) return quote.customer.company_name;
    if (quote.customer?.first_name) return `${quote.customer.first_name} ${quote.customer.last_name || ''}`;
    return 'Cliente';
  };

  const { subtotal, vat, total } = calculateTotals();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Preventivi</h2>
          <p className="text-sm text-muted-foreground">Gestione preventivi e conversione in vendite</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nuovo Preventivo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuovo Preventivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Seleziona cliente" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company_name || `${c.first_name} ${c.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Validity Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valido fino a</Label>
                  <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox 
                    id="vatIncluded" 
                    checked={vatIncluded} 
                    onCheckedChange={(c) => setVatIncluded(c === true)} 
                  />
                  <Label htmlFor="vatIncluded">IVA inclusa</Label>
                </div>
              </div>

              {/* Add Product */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Aggiungi Prodotto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={newItemProductType} onValueChange={setNewItemProductType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MgO">MgO</SelectItem>
                        <SelectItem value="CWC">CWC</SelectItem>
                      </SelectContent>
                    </Select>
                    {newItemProductType === 'MgO' ? (
                      <Select value={newItemColor} onValueChange={setNewItemColor}>
                        <SelectTrigger><SelectValue placeholder="Colore" /></SelectTrigger>
                        <SelectContent>
                          {MGO_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={newItemColor} onValueChange={setNewItemColor}>
                        <SelectTrigger><SelectValue placeholder="Variante" /></SelectTrigger>
                        <SelectContent>
                          {CWC_VARIANTS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input 
                      type="number" 
                      placeholder="Quantità mq" 
                      value={newItemQty}
                      onChange={e => setNewItemQty(e.target.value)}
                    />
                    <Input 
                      type="number" 
                      placeholder="€/mq" 
                      value={newItemPrice}
                      onChange={e => setNewItemPrice(e.target.value)}
                    />
                    <Button onClick={addItem}><Plus className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>

              {/* Items List */}
              {items.length > 0 && (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded text-sm">
                      <div>
                        <span className="font-medium">{item.product_type}</span>
                        {item.color && <span className="text-muted-foreground ml-2">{item.color}</span>}
                        <span className="text-muted-foreground ml-2">• {item.quantity_sqm} mq × €{item.unit_price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">€{item.total_price.toLocaleString()}</span>
                        <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              {items.length > 0 && (
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotale</span>
                    <span>€{subtotal.toLocaleString()}</span>
                  </div>
                  {!vatIncluded && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>IVA 22%</span>
                      <span>€{vat.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Totale</span>
                    <span>€{total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Note</Label>
                <Textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Note aggiuntive..."
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">Crea Preventivo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Totale Preventivi</div>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">In attesa</div>
            <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'sent').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Convertiti</div>
            <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'converted').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Valore Totale</div>
            <div className="text-xl font-bold">
              €{quotes.reduce((sum, q) => sum + (q.total_amount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{quotes.length} preventivi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Caricamento...</p>
          ) : quotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessun preventivo</p>
          ) : (
            <div className="space-y-2">
              {quotes.map(quote => (
                <div key={quote.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{quote.quote_number || `#${quote.id.slice(0,6)}`}</span>
                        <Badge className={getStatusBadge(quote.status)}>{quote.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getCustomerName(quote)} • {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: it })}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold">€{(quote.total_amount || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                    {quote.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => sendQuoteByEmail(quote)}>
                        <Send className="w-3 h-3 mr-1" />Invia
                      </Button>
                    )}
                    {quote.status === 'sent' && (
                      <>
                        <Button size="sm" variant="default" onClick={() => convertToSale(quote)}>
                          <CheckCircle2 className="w-3 h-3 mr-1" />Converti in Vendita
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateQuoteStatus(quote.id, 'rejected')}>
                          <X className="w-3 h-3 mr-1" />Rifiutato
                        </Button>
                      </>
                    )}
                    {quote.status === 'converted' && (
                      <Badge variant="outline" className="bg-green-50">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Convertito in vendita
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuotes;
