import { useEffect, useState, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, User, Package, CreditCard, FileText, Users, Check, X, Eye, Pencil, TrendingUp } from 'lucide-react';
import { CrmPageHeader } from '@/components/admin/CrmShell';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { fetchAllRows } from '@/lib/fetchAllRows';
import { DataTable } from '@/components/admin/DataTable';

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
  ]},
  { group: 'Pagamento alla consegna', options: [
    '100% alla consegna',
    '100% contrassegno',
  ]},
  { group: 'Pagamento anticipato', options: [
    "100% all'ordine",
    '100% prima produzione',
  ]},
  { group: 'Pagamento differito', options: [
    '30 giorni data fattura',
    '60 giorni data fattura',
    '90 giorni data fattura',
  ]},
];

const ADDITIONAL_COST_TYPES = [
  { key: 'trasporto', label: 'Trasporto', unit: 'km' },
  { key: 'tappetino', label: 'Tappetino', unit: 'mq' },
  { key: 'posa', label: 'Posa', unit: 'mq' },
  { key: 'profili', label: 'Profili', unit: 'mq' },
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
  subtotal_amount: number | null;
  total_amount: number | null;
  payment_method: string | null;
  payment_terms: string | null;
  deposit_amount: number | null;
  balance_amount: number | null;
  balance_due_date: string | null;
  is_paid: boolean | null;
  paid_date: string | null;
  margin_amount: number | null;
  margin_percentage: number | null;
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

interface Salesperson {
  id: string;
  first_name: string;
  last_name: string;
  commission_rate: number | null;
  is_active: boolean | null;
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

interface SalespersonCommission {
  salesperson_id: string;
  commission_percentage: number;
}

interface StaticCost {
  product_type: string;
  fob_cost: number;
  duty_percentage: number;
  import_logistics_cost: number;
  vat_percentage: number;
}

const AdminSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [staticCosts, setStaticCosts] = useState<StaticCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
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
  const [salespersonCommissions, setSalespersonCommissions] = useState<SalespersonCommission[]>([]);
  
  const [saleData, setSaleData] = useState({
    channel: 'B2B',
    sale_date: format(new Date(), 'yyyy-MM-dd'),
    vat_included: false,
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    payment_terms: '',
    deposit_amount: '',
    deposit_date: '',
    balance_due_date: '',
    is_paid: false,
  });

  const handleDataChange = useCallback(() => {
    fetchAll();
  }, []);

  useRealtimeSubscription({
    tables: ['sales', 'customers', 'inventory', 'payment_schedules'],
    onDataChange: handleDataChange,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchSales(), fetchCustomers(), fetchSalespeople(), fetchStaticCosts()]);
    setLoading(false);
  };

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
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await fetchAllRows<Customer>(
        supabase
          .from('customers')
          .select('id, customer_type, first_name, last_name, company_name, email, phone')
          .order('created_at', { ascending: false })
      );
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSalespeople = async () => {
    try {
      const { data, error } = await supabase
        .from('salespeople')
        .select('*')
        .eq('is_active', true)
        .order('last_name');
      if (error) throw error;
      setSalespeople(data || []);
    } catch (error) {
      console.error('Error fetching salespeople:', error);
    }
  };

  const fetchStaticCosts = async () => {
    try {
      const { data, error } = await supabase.from('static_costs').select('*');
      if (error) throw error;
      setStaticCosts(data || []);
    } catch (error) {
      console.error('Error fetching static costs:', error);
    }
  };

  const getCustomerName = (customer: Customer) => {
    if (customer.company_name) return customer.company_name;
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente';
  };

  const calculateCOGS = () => {
    let totalCOGS = 0;
    for (const item of saleItems) {
      if (item.quantity_sqm > 0) {
        const costInfo = staticCosts.find(c => c.product_type === item.product_type);
        if (costInfo) {
          const baseCost = costInfo.fob_cost + costInfo.import_logistics_cost;
          const withDuty = baseCost * (1 + costInfo.duty_percentage / 100);
          totalCOGS += withDuty * item.quantity_sqm;
        }
      }
    }
    return totalCOGS;
  };

  const calculateTotals = () => {
    const itemsTotal = saleItems.reduce((sum, item) => sum + (item.quantity_sqm * item.unit_price), 0);
    const costsTotal = additionalCosts.reduce((sum, cost) => sum + (cost.quantity * cost.unit_price), 0);
    const subtotal = itemsTotal + costsTotal;
    const vatAmount = saleData.vat_included ? 0 : subtotal * 0.22;
    const total = subtotal + vatAmount;
    const totalQty = saleItems.reduce((sum, item) => sum + item.quantity_sqm, 0);
    const cogs = calculateCOGS();
    const marginAmount = itemsTotal - cogs;
    const marginPercentage = itemsTotal > 0 ? (marginAmount / itemsTotal) * 100 : 0;
    return { itemsTotal, costsTotal, subtotal, vatAmount, total, totalQty, cogs, marginAmount, marginPercentage };
  };

  const handleSubmit = async () => {
    // If editing, use update function
    if (editingSaleId) {
      await handleUpdateSale();
      return;
    }
    
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

      const { itemsTotal, costsTotal, vatAmount, total, totalQty, marginAmount, marginPercentage } = calculateTotals();
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
        deposit_amount: depositAmount,
        deposit_date: paymentData.deposit_date || null,
        balance_amount: balanceAmount,
        balance_due_date: paymentData.balance_due_date || null,
        is_paid: paymentData.is_paid,
        paid_date: paymentData.is_paid ? saleData.sale_date : null,
        margin_amount: marginAmount,
        margin_percentage: marginPercentage,
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

      // Create salesperson commissions
      if (salespersonCommissions.length > 0) {
        const commissionsToInsert = salespersonCommissions.map(sc => ({
          sale_id: saleResult.id,
          salesperson_id: sc.salesperson_id,
          commission_percentage: sc.commission_percentage,
          commission_amount: (marginAmount * sc.commission_percentage) / 100,
        }));
        const { error: commError } = await supabase.from('sale_salespeople').insert(commissionsToInsert);
        if (commError) throw commError;
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

      // AUTOMATIC INVENTORY DEDUCTION
      for (const item of saleItems) {
        if (item.quantity_sqm > 0) {
          const costInfo = staticCosts.find(c => c.product_type === item.product_type);
          const purchaseCost = costInfo ? (costInfo.fob_cost + costInfo.import_logistics_cost) * (1 + costInfo.duty_percentage / 100) : 0;
          
          const { error: invError } = await supabase.from('inventory').insert({
            product_type: item.product_type,
            color: item.product_variant || null,
            quantity_sqm: item.quantity_sqm,
            movement_type: 'OUT',
            purchase_cost: purchaseCost,
            exit_price: item.unit_price,
            sale_id_link: saleResult.id,
            is_paid: true,
            notes: `Uscita per vendita ${customerName}`,
          });
          if (invError) console.error('Inventory error:', invError);
        }
      }

      // Update customer totals
      if (customerId) {
        const { data: custData } = await supabase
          .from('customers')
          .select('total_value, total_margin')
          .eq('id', customerId)
          .single();
        
        await supabase.from('customers').update({
          total_value: (Number(custData?.total_value) || 0) + itemsTotal,
          total_margin: (Number(custData?.total_margin) || 0) + marginAmount,
          status: 'working' as const,
        }).eq('id', customerId);
      }

      toast.success('Vendita registrata - Magazzino aggiornato');
      setDialogOpen(false);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Errore nel salvataggio della vendita');
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setIsNewCustomer(false);
    setNewCustomer({ customer_type: '', first_name: '', last_name: '', company_name: '', email: '', phone: '', address: '', city: '', vat_number: '', pec: '', sdi_code: '' });
    setSaleItems([{ product_type: 'MgO', product_variant: '', quantity_sqm: 0, unit_price: 0 }]);
    setAdditionalCosts([]);
    setSalespersonCommissions([]);
    setSaleData({ channel: 'B2B', sale_date: format(new Date(), 'yyyy-MM-dd'), vat_included: false, notes: '' });
    setPaymentData({ payment_method: '', payment_terms: '', deposit_amount: '', deposit_date: '', balance_due_date: '', is_paid: false });
    setActiveTab('customer');
    setEditingSaleId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa vendita?')) return;
    try {
      // Remove references from related tables
      await supabase.from('quotes').update({ converted_sale_id: null }).eq('converted_sale_id', id);
      await supabase.from('customer_contracts').update({ sale_id: null }).eq('sale_id', id);
      await supabase.from('sale_items').delete().eq('sale_id', id);
      await supabase.from('sale_additional_costs').delete().eq('sale_id', id);
      await supabase.from('payment_schedules').delete().eq('sale_id', id);
      await supabase.from('sale_salespeople').delete().eq('sale_id', id);
      await supabase.from('inventory').delete().eq('sale_id_link', id);
      await supabase.from('variable_costs').update({ sale_id: null }).eq('sale_id', id);
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      toast.success('Vendita eliminata');
      fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error("Errore nell'eliminazione");
    }
  };

  const togglePaidStatus = async (sale: Sale) => {
    try {
      const newPaid = !sale.is_paid;
      await supabase.from('sales').update({
        is_paid: newPaid,
        paid_date: newPaid ? format(new Date(), 'yyyy-MM-dd') : null,
      }).eq('id', sale.id);
      toast.success(newPaid ? 'Vendita marcata come pagata' : 'Vendita marcata come non pagata');
      fetchSales();
    } catch (error) {
      toast.error('Errore aggiornamento stato pagamento');
    }
  };

  const viewSaleDetails = (sale: Sale) => {
    setViewingSale(sale);
    setDetailDialogOpen(true);
  };

  const editSale = async (sale: Sale) => {
    setEditingSaleId(sale.id);
    
    // Load sale data into form
    setSelectedCustomerId(sale.customer_id || '');
    setSaleData({
      channel: sale.channel,
      sale_date: sale.sale_date,
      vat_included: sale.vat_included,
      notes: sale.notes || '',
    });
    setPaymentData({
      payment_method: sale.payment_method || '',
      payment_terms: sale.payment_terms || '',
      deposit_amount: String(sale.deposit_amount || ''),
      deposit_date: '',
      balance_due_date: sale.balance_due_date || '',
      is_paid: sale.is_paid || false,
    });
    
    // Set sale items (simplified - single item from main sale)
    setSaleItems([{
      product_type: sale.product_type,
      product_variant: sale.color || '',
      quantity_sqm: sale.quantity_sqm,
      unit_price: sale.sale_price,
    }]);
    
    setDialogOpen(true);
    setActiveTab('products');
  };

  const handleUpdateSale = async () => {
    try {
      const firstItem = saleItems[0];
      const costInfo = staticCosts.find(c => c.product_type === firstItem.product_type);
      const costPerSqm = costInfo ? (costInfo.fob_cost + costInfo.import_logistics_cost) * (1 + costInfo.duty_percentage / 100) : 15.49;
      
      const subtotal = saleItems.reduce((sum, item) => sum + (item.quantity_sqm * item.unit_price), 0);
      const vatAmount = saleData.vat_included ? 0 : subtotal * 0.22;
      const total = subtotal + vatAmount;
      const totalQty = saleItems.reduce((sum, item) => sum + item.quantity_sqm, 0);
      const marginAmount = subtotal - (totalQty * costPerSqm);
      const marginPercentage = subtotal > 0 ? (marginAmount / subtotal) * 100 : 0;

      const { error } = await supabase.from('sales').update({
        product_type: firstItem.product_type,
        color: firstItem.product_variant || null,
        quantity_sqm: totalQty,
        sale_price: firstItem.unit_price,
        channel: saleData.channel,
        sale_date: saleData.sale_date,
        vat_included: saleData.vat_included,
        vat_rate: 0.22,
        subtotal_amount: subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        margin_amount: marginAmount,
        margin_percentage: marginPercentage,
        payment_method: (paymentData.payment_method || null) as "assegno" | "bonifico" | "carta_credito" | "contanti" | null,
        payment_terms: paymentData.payment_terms || null,
        is_paid: paymentData.is_paid,
        notes: saleData.notes || null,
      }).eq('id', editingSaleId);

      if (error) throw error;

      toast.success('Vendita aggiornata');
      setDialogOpen(false);
      setEditingSaleId(null);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error("Errore nell'aggiornamento della vendita");
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const addSaleItem = () => setSaleItems([...saleItems, { product_type: 'MgO', product_variant: '', quantity_sqm: 0, unit_price: 0 }]);
  const removeSaleItem = (index: number) => setSaleItems(saleItems.filter((_, i) => i !== index));
  const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    const updated = [...saleItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'product_type') updated[index].product_variant = '';
    setSaleItems(updated);
  };

  const addAdditionalCost = (costType: string) => {
    if (!additionalCosts.find(c => c.cost_type === costType)) {
      setAdditionalCosts([...additionalCosts, { cost_type: costType, quantity: 0, unit_price: 0 }]);
    }
  };
  const removeAdditionalCost = (costType: string) => setAdditionalCosts(additionalCosts.filter(c => c.cost_type !== costType));
  const updateAdditionalCost = (costType: string, field: 'quantity' | 'unit_price', value: number) => {
    setAdditionalCosts(additionalCosts.map(c => c.cost_type === costType ? { ...c, [field]: value } : c));
  };

  const addSalesperson = (id: string) => {
    if (!salespersonCommissions.find(s => s.salesperson_id === id)) {
      const sp = salespeople.find(s => s.id === id);
      setSalespersonCommissions([...salespersonCommissions, { salesperson_id: id, commission_percentage: sp?.commission_rate || 5 }]);
    }
  };
  const removeSalesperson = (id: string) => setSalespersonCommissions(salespersonCommissions.filter(s => s.salesperson_id !== id));
  const updateCommission = (id: string, percentage: number) => {
    setSalespersonCommissions(salespersonCommissions.map(s => s.salesperson_id === id ? { ...s, commission_percentage: percentage } : s));
  };

  const totals = calculateTotals();
  const totalMq = sales.reduce((sum, s) => sum + Number(s.quantity_sqm), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount || (Number(s.quantity_sqm) * Number(s.sale_price))), 0);
  const totalMargin = sales.reduce((sum, s) => sum + (Number(s.margin_amount) || 0), 0);
  const paidCount = sales.filter(s => s.is_paid).length;

  return (
    <div className="space-y-4">
      <CrmPageHeader
        breadcrumb={["CRM", "Vendite"]}
        title="Vendite"
        subtitle="Gestione vendite, commerciali e provvigioni"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-white text-[#0F172A] hover:bg-white/90"><Plus className="w-4 h-4 mr-2" />Nuova Vendita</Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSaleId ? 'Modifica Vendita' : 'Registra Vendita'}</DialogTitle>
              <DialogDescription>{editingSaleId ? 'Modifica i dati della vendita' : 'Compila tutti i dati della vendita'}</DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="customer" className="text-xs sm:text-sm"><User className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Cliente</span></TabsTrigger>
                <TabsTrigger value="products" className="text-xs sm:text-sm"><Package className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Prodotti</span></TabsTrigger>
                <TabsTrigger value="salespeople" className="text-xs sm:text-sm"><Users className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Commerciali</span></TabsTrigger>
                <TabsTrigger value="payment" className="text-xs sm:text-sm"><CreditCard className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Pagamento</span></TabsTrigger>
                <TabsTrigger value="summary" className="text-xs sm:text-sm"><FileText className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Riepilogo</span></TabsTrigger>
              </TabsList>

              {/* Customer Tab */}
              <TabsContent value="customer" className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <Checkbox id="newCustomer" checked={isNewCustomer} onCheckedChange={(checked) => setIsNewCustomer(!!checked)} />
                  <Label htmlFor="newCustomer">Nuovo cliente</Label>
                </div>
                {!isNewCustomer ? (
                  <div className="space-y-2">
                    <Label>Seleziona Cliente</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger><SelectValue placeholder="Cerca cliente..." /></SelectTrigger>
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
                        <SelectTrigger><SelectValue placeholder="Seleziona tipologia" /></SelectTrigger>
                        <SelectContent>
                          {CUSTOMER_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Nome</Label><Input value={newCustomer.first_name} onChange={(e) => setNewCustomer({...newCustomer, first_name: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Cognome</Label><Input value={newCustomer.last_name} onChange={(e) => setNewCustomer({...newCustomer, last_name: e.target.value})} /></div>
                    </div>
                    <div className="space-y-2"><Label>Nome Azienda</Label><Input value={newCustomer.company_name} onChange={(e) => setNewCustomer({...newCustomer, company_name: e.target.value})} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Email</Label><Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Telefono</Label><Input value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} /></div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Canale</Label>
                    <Select value={saleData.channel} onValueChange={(v) => setSaleData({...saleData, channel: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B2B">B2B</SelectItem>
                        <SelectItem value="B2C">B2C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Data Vendita</Label><Input type="date" value={saleData.sale_date} onChange={(e) => setSaleData({...saleData, sale_date: e.target.value})} /></div>
                </div>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4 mt-4">
                {saleItems.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Prodotto {index + 1}</span>
                      {saleItems.length > 1 && (<Button variant="ghost" size="sm" onClick={() => removeSaleItem(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={item.product_type} onValueChange={(v) => updateSaleItem(index, 'product_type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MgO">MgO</SelectItem>
                            <SelectItem value="CWC">CWC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Variante</Label>
                        <Select value={item.product_variant} onValueChange={(v) => updateSaleItem(index, 'product_variant', v)}>
                          <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                          <SelectContent>
                            {item.product_type === 'MgO' ? MGO_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>) : CWC_VARIANTS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Quantità (mq)</Label><Input type="number" step="0.01" value={item.quantity_sqm || ''} onChange={(e) => updateSaleItem(index, 'quantity_sqm', parseFloat(e.target.value) || 0)} /></div>
                      <div className="space-y-2"><Label>Prezzo (€/mq)</Label><Input type="number" step="0.01" value={item.unit_price || ''} onChange={(e) => updateSaleItem(index, 'unit_price', parseFloat(e.target.value) || 0)} /></div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">Subtotale: {formatCurrency(item.quantity_sqm * item.unit_price)}</div>
                  </div>
                ))}
                <Button variant="outline" onClick={addSaleItem} className="w-full"><Plus className="w-4 h-4 mr-2" />Aggiungi Prodotto</Button>
                
                <div className="pt-4 border-t">
                  <Label className="text-base font-medium">Costi Aggiuntivi</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ADDITIONAL_COST_TYPES.map(type => (
                      <Button key={type.key} variant={additionalCosts.find(c => c.cost_type === type.key) ? "default" : "outline"} size="sm" onClick={() => additionalCosts.find(c => c.cost_type === type.key) ? removeAdditionalCost(type.key) : addAdditionalCost(type.key)}>{type.label}</Button>
                    ))}
                  </div>
                  {additionalCosts.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {additionalCosts.map(cost => {
                        const typeInfo = ADDITIONAL_COST_TYPES.find(t => t.key === cost.cost_type);
                        return (
                          <div key={cost.cost_type} className="grid grid-cols-3 gap-4 items-end">
                            <div><Label className="text-xs">{typeInfo?.label}</Label><Input type="number" placeholder={`(${typeInfo?.unit})`} value={cost.quantity || ''} onChange={(e) => updateAdditionalCost(cost.cost_type, 'quantity', parseFloat(e.target.value) || 0)} /></div>
                            <div><Label className="text-xs">€/{typeInfo?.unit}</Label><Input type="number" value={cost.unit_price || ''} onChange={(e) => updateAdditionalCost(cost.cost_type, 'unit_price', parseFloat(e.target.value) || 0)} /></div>
                            <div className="text-sm text-muted-foreground">{formatCurrency(cost.quantity * cost.unit_price)}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Checkbox id="vatIncluded" checked={saleData.vat_included} onCheckedChange={(checked) => setSaleData({...saleData, vat_included: !!checked})} />
                  <Label htmlFor="vatIncluded">IVA inclusa</Label>
                </div>
              </TabsContent>

              {/* Salespeople Tab */}
              <TabsContent value="salespeople" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Aggiungi Commerciale</Label>
                  <Select onValueChange={addSalesperson}>
                    <SelectTrigger><SelectValue placeholder="Seleziona commerciale..." /></SelectTrigger>
                    <SelectContent>
                      {salespeople.filter(sp => !salespersonCommissions.find(sc => sc.salesperson_id === sp.id)).map(sp => (
                        <SelectItem key={sp.id} value={sp.id}>{sp.first_name} {sp.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {salespersonCommissions.length > 0 && (
                  <div className="space-y-3">
                    {salespersonCommissions.map(sc => {
                      const sp = salespeople.find(s => s.id === sc.salesperson_id);
                      return (
                        <div key={sc.salesperson_id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex-1 font-medium">{sp?.first_name} {sp?.last_name}</div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">%</Label>
                            <Input type="number" step="0.1" className="w-20" value={sc.commission_percentage} onChange={(e) => updateCommission(sc.salesperson_id, parseFloat(e.target.value) || 0)} />
                          </div>
                          <div className="text-sm text-muted-foreground w-24 text-right">
                            {formatCurrency((totals.marginAmount * sc.commission_percentage) / 100)}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeSalesperson(sc.salesperson_id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {salespersonCommissions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nessun commerciale assegnato</p>}
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metodo</Label>
                    <Select value={paymentData.payment_method} onValueChange={(v) => setPaymentData({...paymentData, payment_method: v})}>
                      <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                      <SelectContent>{PAYMENT_METHODS.map(m => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condizioni</Label>
                    <Select value={paymentData.payment_terms} onValueChange={(v) => setPaymentData({...paymentData, payment_terms: v})}>
                      <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map(g => (<div key={g.group}><div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{g.group}</div>{g.options.map(o => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</div>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Anticipo (€)</Label><Input type="number" step="0.01" value={paymentData.deposit_amount} onChange={(e) => setPaymentData({...paymentData, deposit_amount: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Data Anticipo</Label><Input type="date" value={paymentData.deposit_date} onChange={(e) => setPaymentData({...paymentData, deposit_date: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Scadenza Saldo</Label><Input type="date" value={paymentData.balance_due_date} onChange={(e) => setPaymentData({...paymentData, balance_due_date: e.target.value})} /></div>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Checkbox id="isPaid" checked={paymentData.is_paid} onCheckedChange={(checked) => setPaymentData({...paymentData, is_paid: !!checked})} />
                  <Label htmlFor="isPaid">Già pagato</Label>
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Riepilogo Vendita</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Prodotti ({totals.totalQty.toFixed(1)} mq)</span><span>{formatCurrency(totals.itemsTotal)}</span></div>
                    {totals.costsTotal > 0 && <div className="flex justify-between"><span>Costi aggiuntivi</span><span>{formatCurrency(totals.costsTotal)}</span></div>}
                    <div className="flex justify-between border-t pt-2"><span>Subtotale</span><span>{formatCurrency(totals.subtotal)}</span></div>
                    {!saleData.vat_included && <div className="flex justify-between text-muted-foreground"><span>IVA (22%)</span><span>{formatCurrency(totals.vatAmount)}</span></div>}
                    <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Totale</span><span>{formatCurrency(totals.total)}</span></div>
                    <div className="flex justify-between text-green-600 border-t pt-2"><span>Margine ({totals.marginPercentage.toFixed(1)}%)</span><span>{formatCurrency(totals.marginAmount)}</span></div>
                    {salespersonCommissions.length > 0 && (
                      <div className="border-t pt-2 space-y-1">
                        <span className="text-sm font-medium">Provvigioni:</span>
                        {salespersonCommissions.map(sc => {
                          const sp = salespeople.find(s => s.id === sc.salesperson_id);
                          return <div key={sc.salesperson_id} className="flex justify-between text-sm"><span>{sp?.first_name} {sp?.last_name} ({sc.commission_percentage}%)</span><span>{formatCurrency((totals.marginAmount * sc.commission_percentage) / 100)}</span></div>;
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="space-y-2"><Label>Note</Label><Textarea value={saleData.notes} onChange={(e) => setSaleData({...saleData, notes: e.target.value})} placeholder="Note aggiuntive..." /></div>
                <Button onClick={handleSubmit} className="w-full" size="lg">Salva Vendita</Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Venduto</p>
            <p className="text-lg font-bold">{totalMq.toFixed(0)} mq</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Fatturato</p>
            <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Margine</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalMargin)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Pagate</p>
            <p className="text-lg font-bold">{paidCount}/{sales.length}</p>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <DataTable
        data={sales}
        loading={loading}
        searchPlaceholder="Cerca per cliente, prodotto, colore…"
        searchKeys={['customer_name', 'product_type', 'color']}
        emptyTitle="Nessuna vendita"
        emptyDescription="Non sono ancora state registrate vendite."
        columns={[
          {
            key: 'sale_date',
            header: 'Data',
            sortable: true,
            accessor: (s) => new Date(s.sale_date).getTime(),
            cell: (s) => format(new Date(s.sale_date), 'dd MMM yyyy', { locale: it }),
          },
          {
            key: 'product_type',
            header: 'Prodotto',
            sortable: true,
            cell: (s) => (
              <span>
                {s.product_type}
                {s.color && <span className="text-[#8A7060] ml-1">({s.color})</span>}
              </span>
            ),
          },
          { key: 'customer_name', header: 'Cliente', sortable: true, cell: (s) => s.customer_name || '—' },
          {
            key: 'quantity_sqm',
            header: 'Quantità',
            sortable: true,
            className: 'text-right',
            accessor: (s) => Number(s.quantity_sqm),
            cell: (s) => `${Number(s.quantity_sqm).toFixed(0)} mq`,
          },
          {
            key: 'total',
            header: 'Totale fattura',
            sortable: true,
            className: 'text-right font-medium',
            accessor: (s) => Number(s.total_amount || (Number(s.quantity_sqm) * Number(s.sale_price))),
            cell: (s) => {
              const netto = Number(s.subtotal_amount ?? (Number(s.quantity_sqm) * Number(s.sale_price)));
              const iva = Number(s.vat_amount ?? (s.vat_included ? 0 : netto * 0.22));
              const totale = Number(s.total_amount ?? (netto + iva));
              return (
                <div className="leading-tight">
                  <div className="font-semibold">{formatCurrency(totale)}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatCurrency(netto)} + IVA {formatCurrency(iva)}
                  </div>
                </div>
              );
            },
          },
          {
            key: 'margin_amount',
            header: 'Margine',
            sortable: true,
            className: 'text-right text-green-600',
            accessor: (s) => Number(s.margin_amount) || 0,
            cell: (s) => formatCurrency(Number(s.margin_amount) || 0),
          },
          {
            key: 'is_paid',
            header: 'Stato',
            sortable: true,
            accessor: (s) => (s.is_paid ? 1 : 0),
            cell: (s) => (
              <Button
                variant={s.is_paid ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => { e.stopPropagation(); togglePaidStatus(s); }}
              >
                {s.is_paid ? <><Check className="w-3 h-3 mr-1" />Pagato</> : 'Non pagato'}
              </Button>
            ),
          },
          {
            key: 'actions',
            header: '',
            cell: (s) => (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={() => viewSaleDetails(s)}><Eye className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => editSale(s)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ),
          },
        ]}
      />


      {/* Sale Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dettaglio Vendita</DialogTitle>
            <DialogDescription>
              {viewingSale && format(new Date(viewingSale.sale_date), 'dd MMMM yyyy', { locale: it })}
            </DialogDescription>
          </DialogHeader>
          {viewingSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{viewingSale.customer_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Canale</Label>
                  <p className="font-medium">{viewingSale.channel}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Prodotto</Label>
                  <p className="font-medium">{viewingSale.product_type} {viewingSale.color && `(${viewingSale.color})`}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quantità</Label>
                  <p className="font-medium">{Number(viewingSale.quantity_sqm).toFixed(1)} mq</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Prezzo Unitario</Label>
                  <p className="font-medium">{formatCurrency(Number(viewingSale.sale_price))}/mq</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IVA Inclusa</Label>
                  <p className="font-medium">{viewingSale.vat_included ? 'Sì' : 'No'}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotale (mq × prezzo)</span>
                  <span className="font-medium">{formatCurrency(Number(viewingSale.quantity_sqm) * Number(viewingSale.sale_price))}</span>
                </div>
                {!viewingSale.vat_included && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>IVA (22%)</span>
                    <span>{formatCurrency(Number(viewingSale.vat_amount) || (Number(viewingSale.quantity_sqm) * Number(viewingSale.sale_price) * 0.22))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Totale</span>
                  <span>{formatCurrency(
                    viewingSale.vat_included 
                      ? Number(viewingSale.quantity_sqm) * Number(viewingSale.sale_price)
                      : (Number(viewingSale.quantity_sqm) * Number(viewingSale.sale_price)) * 1.22
                  )}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Margine ({Number(viewingSale.margin_percentage || 0).toFixed(1)}%)</span>
                  <span>{formatCurrency(Number(viewingSale.margin_amount) || 0)}</span>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Metodo Pagamento</Label>
                  <p className="font-medium">{viewingSale.payment_method || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stato</Label>
                  <Badge variant={viewingSale.is_paid ? "default" : "secondary"}>
                    {viewingSale.is_paid ? 'Pagato' : 'Non pagato'}
                  </Badge>
                </div>
              </div>

              {viewingSale.notes && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Note</Label>
                  <p className="text-sm">{viewingSale.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => { setDetailDialogOpen(false); editSale(viewingSale); }}>
                  <Pencil className="w-4 h-4 mr-2" /> Modifica
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setDetailDialogOpen(false)}>
                  Chiudi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSales;
