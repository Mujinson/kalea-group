import { useEffect, useState, useCallback } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, Send, FileText, CheckCircle2, X, Trash2, Eye, Edit, Search, MoreVertical, Download } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { fetchAllRows } from '@/lib/fetchAllRows';

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
  converted_sale_id: string | null;
  created_by: string | null;
  customer?: { company_name: string | null; first_name: string | null; last_name: string | null };
}

const AdminQuotes = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staticCosts, setStaticCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const handleDataChange = useCallback(() => {
    fetchData();
  }, []);

  useRealtimeSubscription({
    tables: ['quotes', 'customers', 'sales'],
    onDataChange: handleDataChange,
  });

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
      const [quotesRes, customersRes, costsRes] = await Promise.all([
        supabase.from('quotes').select('*, customer:customers(company_name, first_name, last_name)').order('created_at', { ascending: false }),
        fetchAllRows(supabase.from('customers').select('id, company_name, first_name, last_name').order('company_name')),
        supabase.from('static_costs').select('*'),
      ]);

      setQuotes((quotesRes.data || []) as any);
      setCustomers(customersRes || []);
      setStaticCosts(costsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate COGS per sqm from static_costs
  const calculateCOGS = (productType: string) => {
    const costs = staticCosts.find(c => c.product_type === productType);
    if (!costs) return 0;
    const fob = Number(costs.fob_cost) || 0;
    const duty = Number(costs.duty_percentage) || 0;
    const importLogistics = Number(costs.import_logistics_cost) || 0;
    const internalTransport = Number(costs.internal_transport_cost) || 0;
    return fob * (1 + duty / 100) + importLogistics + internalTransport;
  };

  // Open quote for editing
  const openQuoteForEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setSelectedCustomerId(quote.customer_id || '');
    setValidUntil(quote.valid_until || '');
    setNotes(quote.notes || '');
    setVatIncluded(quote.vat_included || false);
    setItems(Array.isArray(quote.items) ? quote.items : []);
    setDialogOpen(true);
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
      
      if (editingQuote) {
        // Update existing quote
        const { error } = await supabase.from('quotes').update({
          customer_id: selectedCustomerId,
          total_amount: total,
          vat_amount: vat,
          vat_included: vatIncluded,
          valid_until: validUntil || null,
          notes: notes || null,
          items: items as any,
        }).eq('id', editingQuote.id);

        if (error) throw error;
        toast.success('Preventivo aggiornato');
      } else {
        // Create new quote
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
      }
      
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const resetForm = () => {
    setEditingQuote(null);
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

      // Calculate subtotal and unit price
      const subtotal = totalAmount - vatAmount;
      const unitPrice = totalQty > 0 ? subtotal / totalQty : 0;
      const vatRate = quote.vat_included ? 0 : 0.22;

      // Calculate COGS and margin
      const productType = firstItem?.product_type || 'MgO';
      const cogsPerSqm = calculateCOGS(productType);
      const totalCogs = cogsPerSqm * totalQty;
      const marginAmount = subtotal - totalCogs;
      const marginPercentage = subtotal > 0 ? (marginAmount / subtotal) * 100 : 0;

      // Create sale with all financial data
      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        customer_id: quote.customer_id,
        product_type: productType,
        color: firstItem?.color || null,
        quantity_sqm: totalQty,
        sale_price: unitPrice,
        vat_included: quote.vat_included,
        vat_amount: vatAmount,
        vat_rate: vatRate,
        subtotal_amount: subtotal,
        total_amount: totalAmount,
        margin_amount: marginAmount,
        margin_percentage: marginPercentage,
        notes: `Convertito da preventivo ${quote.quote_number}`,
      }).select().single();

      if (saleError) throw saleError;

      // Update quote
      await supabase.from('quotes').update({
        status: 'converted',
        converted_sale_id: saleData.id,
        accepted_date: new Date().toISOString(),
      }).eq('id', quote.id);

      // Update customer totals and margin
      const { data: custData } = await supabase.from('customers')
        .select('total_value, total_margin')
        .eq('id', quote.customer_id)
        .single();

      const newTotalValue = (Number(custData?.total_value) || 0) + subtotal;
      const newTotalMargin = (Number(custData?.total_margin) || 0) + marginAmount;
      
      await supabase.from('customers').update({
        status: 'working' as const,
        total_value: newTotalValue,
        total_margin: newTotalMargin,
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

  const handleDeleteQuote = async (quote: Quote) => {
    // Check if converted sale still exists
    if (quote.converted_sale_id) {
      const { data: sale } = await supabase.from('sales').select('id').eq('id', quote.converted_sale_id).maybeSingle();
      if (sale) {
        toast.error('Non puoi eliminare un preventivo con vendita attiva');
        return;
      }
    }
    
    if (!confirm('Sei sicuro di voler eliminare questo preventivo?')) return;
    try {
      const { error } = await supabase.from('quotes').delete().eq('id', quote.id);
      if (error) throw error;
      toast.success('Preventivo eliminato');
      fetchData();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error("Errore nell'eliminazione");
    }
  };

  const QUOTE_STATUSES = [
    { value: 'draft', label: 'Nuova', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'sent', label: 'Inviata', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'in_trattativa', label: 'In trattativa', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { value: 'accepted', label: 'Accettata', color: 'bg-teal-100 text-teal-700 border-teal-300' },
    { value: 'converted', label: 'Vinta', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 'rejected', label: 'Persa', color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'expired', label: 'Scaduta', color: 'bg-gray-100 text-gray-600 border-gray-300' },
  ];

  const getStatusBadge = (status: string) => {
    const s = QUOTE_STATUSES.find(qs => qs.value === status) || QUOTE_STATUSES[0];
    return <Badge variant="outline" className={`${s.color} text-xs font-medium`}>● {s.label}</Badge>;
  };

  const getCustomerName = (quote: Quote) => {
    if (quote.customer?.company_name) return quote.customer.company_name;
    if (quote.customer?.first_name) return `${quote.customer.first_name} ${quote.customer.last_name || ''}`;
    return 'Cliente';
  };

  const { subtotal, vat, total } = calculateTotals();

  const filteredQuotes = quotes.filter(q => {
    const customerName = getCustomerName(q).toLowerCase();
    const matchSearch = searchTerm === '' ||
      customerName.includes(searchTerm.toLowerCase()) ||
      (q.quote_number && q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statCounts = {
    total: quotes.length,
    nuove: quotes.filter(q => q.status === 'draft').length,
    inviate: quotes.filter(q => q.status === 'sent').length,
    in_trattativa: quotes.filter(q => q.status === 'in_trattativa').length,
    vinte: quotes.filter(q => q.status === 'converted' || q.status === 'accepted').length,
    perse: quotes.filter(q => q.status === 'rejected').length,
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Preventivi &gt; Lista</p>
          <h2 className="text-xl md:text-2xl font-bold">Preventivi</h2>
        </div>
        <Button onClick={() => navigate('/admin/preventivi/nuovo')}>
          <Plus className="w-4 h-4 mr-2" />Nuovo Preventivo
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Totale', count: statCounts.total, color: 'text-foreground', bg: 'bg-muted' },
          { label: 'Nuove', count: statCounts.nuove, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Inviate', count: statCounts.inviate, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'In trattativa', count: statCounts.in_trattativa, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Vinte', count: statCounts.vinte, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Perse', count: statCounts.perse, color: 'text-red-600', bg: 'bg-red-100' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${s.color}`}>{s.count}</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca per cliente o codice..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Stato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                {QUOTE_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Responsabile</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Totale</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Caricamento...</TableCell></TableRow>
              ) : filteredQuotes.length > 0 ? (
                filteredQuotes.map(quote => (
                  <TableRow
                    key={quote.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/preventivi/modifica?edit=${quote.id}`)}
                  >
                    <TableCell className="font-mono text-xs text-primary">
                      {quote.quote_number || `#${quote.id.slice(0,8)}`}
                    </TableCell>
                    <TableCell className="font-medium">{getCustomerName(quote)}</TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{quote.created_by || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(quote.created_at), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      €{(quote.total_amount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/admin/preventivi/modifica?edit=${quote.id}`); }}>
                            <Eye className="w-4 h-4 mr-2" />Apri
                          </DropdownMenuItem>
                          {quote.status === 'draft' && (
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); sendQuoteByEmail(quote); }}>
                              <Send className="w-4 h-4 mr-2" />Invia
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {QUOTE_STATUSES.filter(s => s.value !== quote.status).map(s => (
                            <DropdownMenuItem key={s.value} onClick={e => {
                              e.stopPropagation();
                              if (s.value === 'converted') {
                                convertToSale(quote);
                              } else {
                                updateQuoteStatus(quote.id, s.value);
                              }
                            }}>
                              Segna come: {s.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); handleDeleteQuote(quote); }}>
                            <Trash2 className="w-4 h-4 mr-2" />Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' ? 'Nessun preventivo trovato' : 'Nessun preventivo'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuotes;
