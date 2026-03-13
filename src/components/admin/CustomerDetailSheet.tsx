import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  User, Phone, Mail, MapPin, Building, Euro, TrendingUp, 
  Calendar, Plus, FileText, Clock, MessageSquare, CheckCircle2,
  Upload, Download, Eye, Send, Trash2, File, Pencil, Save
} from 'lucide-react';
import { getRegionNames, getProvincesForRegion, getCitiesForProvince } from '@/data/italianTerritories';

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

interface CustomerDetailSheetProps {
  customerId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const CUSTOMER_STATUSES = [
  { value: 'opportunity', label: 'Opportunity', color: 'bg-yellow-500' },
  { value: 'signed', label: 'Signed', color: 'bg-green-500' },
  { value: 'working', label: 'Working', color: 'bg-blue-500' },
];

const CustomerDetailSheet = ({ customerId, open, onClose, onUpdate }: CustomerDetailSheetProps) => {
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [staticCosts, setStaticCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  
  // Form states
  const [newVisit, setNewVisit] = useState({ visit_date: '', visit_type: '', outcome: '', notes: '' });
  const [newReminder, setNewReminder] = useState({ title: '', reminder_date: '', description: '' });
  const [newAction, setNewAction] = useState('');
  const [newContract, setNewContract] = useState({ title: '', contract_type: '', value: '', start_date: '', notes: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customerId && open) {
      fetchAllData();
    }
  }, [customerId, open]);

  const fetchAllData = async () => {
    if (!customerId) return;
    setLoading(true);
    
    try {
      const [customerRes, salesRes, visitsRes, remindersRes, logsRes, contractsRes, quotesRes, costsRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', customerId).single(),
        supabase.from('sales').select('*').eq('customer_id', customerId).order('sale_date', { ascending: false }),
        supabase.from('customer_visits').select('*').eq('customer_id', customerId).order('visit_date', { ascending: false }),
        supabase.from('customer_reminders').select('*').eq('customer_id', customerId).order('reminder_date', { ascending: true }),
        supabase.from('customer_action_logs').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
        supabase.from('customer_contracts').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
        supabase.from('quotes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
        supabase.from('static_costs').select('*'),
      ]);

      if (customerRes.data) setCustomer(customerRes.data);
      setSales(salesRes.data || []);
      setVisits(visitsRes.data || []);
      setReminders(remindersRes.data || []);
      setActionLogs(logsRes.data || []);
      setContracts(contractsRes.data || []);
      setQuotes(quotesRes.data || []);
      setStaticCosts(costsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditData({
      customer_type: customer?.customer_type || '',
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      company_name: customer?.company_name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || '',
      postal_code: customer?.postal_code || '',
      province: customer?.province || '',
      region: customer?.region || '',
      country: customer?.country || 'Italia',
      vat_number: customer?.vat_number || '',
      pec: customer?.pec || '',
      sdi_code: customer?.sdi_code || '',
      notes: customer?.notes || '',
    });
    setIsEditing(true);
  };

  const saveCustomer = async () => {
    if (!customerId) return;
    setSaving(true);
    try {
      const updatePayload = {
        customer_type: editData.customer_type as any,
        first_name: editData.first_name || null,
        last_name: editData.last_name || null,
        company_name: editData.company_name || null,
        email: editData.email || null,
        phone: editData.phone || null,
        address: editData.address || null,
        city: editData.city || null,
        postal_code: editData.postal_code || null,
        province: editData.province || null,
        region: editData.region || null,
        country: editData.country || null,
        vat_number: editData.vat_number || null,
        pec: editData.pec || null,
        sdi_code: editData.sdi_code || null,
        notes: editData.notes || null,
      };
      const { data, error } = await supabase
        .from('customers')
        .update(updatePayload)
        .eq('id', customerId)
        .select()
        .single();
      if (error) throw error;
      // Use the returned data from DB to ensure consistency
      if (data) setCustomer(data);
      setIsEditing(false);
      onUpdate(); // refresh parent list
      toast.success('Cliente aggiornato');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const updateCustomerStatus = async (status: string) => {
    if (!customerId) return;
    try {
      await supabase.from('customers').update({ status: status as any }).eq('id', customerId);
      setCustomer({ ...customer, status });
      toast.success('Stato aggiornato');
      onUpdate();
    } catch (error) {
      toast.error('Errore aggiornamento stato');
    }
  };

  const addVisit = async () => {
    if (!customerId || !newVisit.visit_date) return;
    try {
      await supabase.from('customer_visits').insert({
        customer_id: customerId,
        visit_date: newVisit.visit_date,
        visit_type: newVisit.visit_type || null,
        outcome: newVisit.outcome || null,
        notes: newVisit.notes || null,
      });
      setNewVisit({ visit_date: '', visit_type: '', outcome: '', notes: '' });
      fetchAllData();
      toast.success('Visita aggiunta');
    } catch (error) {
      toast.error('Errore');
    }
  };

  const addReminder = async () => {
    if (!customerId || !newReminder.title || !newReminder.reminder_date) return;
    try {
      await supabase.from('customer_reminders').insert({
        customer_id: customerId,
        title: newReminder.title,
        reminder_date: newReminder.reminder_date,
        description: newReminder.description || null,
      });
      setNewReminder({ title: '', reminder_date: '', description: '' });
      fetchAllData();
      toast.success('Reminder aggiunto');
    } catch (error) {
      toast.error('Errore');
    }
  };

  const toggleReminderComplete = async (id: string, isCompleted: boolean) => {
    try {
      await supabase.from('customer_reminders').update({ 
        is_completed: !isCompleted,
        completed_date: !isCompleted ? new Date().toISOString().split('T')[0] : null
      }).eq('id', id);
      fetchAllData();
    } catch (error) {
      toast.error('Errore');
    }
  };

  const addActionLog = async () => {
    if (!customerId || !newAction) return;
    try {
      await supabase.from('customer_action_logs').insert({
        customer_id: customerId,
        action_type: 'note',
        action_description: newAction,
      });
      setNewAction('');
      fetchAllData();
      toast.success('Nota aggiunta');
    } catch (error) {
      toast.error('Errore');
    }
  };

  const addContract = async () => {
    if (!customerId || !newContract.title) return;
    try {
      const { data } = await supabase.from('customer_contracts').insert({
        customer_id: customerId,
        title: newContract.title,
        contract_type: newContract.contract_type || null,
        value: newContract.value ? parseFloat(newContract.value) : 0,
        start_date: newContract.start_date || null,
        notes: newContract.notes || null,
      }).select().single();
      
      setNewContract({ title: '', contract_type: '', value: '', start_date: '', notes: '' });
      fetchAllData();
      toast.success('Contratto aggiunto');
      
      // Auto-select for file upload
      if (data) setSelectedContractId(data.id);
    } catch (error) {
      toast.error('Errore');
    }
  };

  // File upload functions
  const handleFileUpload = async (contractId: string, file: File) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${contractId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('contracts')
        .getPublicUrl(fileName);
      
      await supabase.from('customer_contracts')
        .update({ document_url: fileName })
        .eq('id', contractId);
      
      fetchAllData();
      toast.success('File caricato');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Errore nel caricamento');
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (documentUrl: string, title: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('contracts')
        .download(documentUrl);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${documentUrl.split('.').pop()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Errore nel download');
    }
  };

  const previewFile = async (documentUrl: string) => {
    try {
      const { data } = supabase.storage
        .from('contracts')
        .getPublicUrl(documentUrl);
      
      window.open(data.publicUrl, '_blank');
    } catch (error) {
      toast.error('Errore nella preview');
    }
  };

  const sendFileByEmail = async (contract: any) => {
    if (!customer?.email) {
      toast.error('Cliente senza email');
      return;
    }
    
    // For now, open mailto with attachment mention
    const subject = encodeURIComponent(`Documento: ${contract.title}`);
    const body = encodeURIComponent(`Gentile ${customer.company_name || customer.first_name},\n\nIn allegato trova il documento "${contract.title}".\n\nCordiali saluti`);
    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`, '_blank');
    toast.success('Email aperta - allega il file manualmente');
  };

  const deleteContract = async (id: string, documentUrl?: string) => {
    try {
      if (documentUrl) {
        await supabase.storage.from('contracts').remove([documentUrl]);
      }
      await supabase.from('customer_contracts').delete().eq('id', id);
      fetchAllData();
      toast.success('Contratto eliminato');
    } catch (error) {
      toast.error('Errore eliminazione');
    }
  };

  // Delete sale
  const deleteSale = async (saleId: string, salePrice: number) => {
    if (!customerId) return;
    try {
      await supabase.from('sales').delete().eq('id', saleId);
      
      // Update customer total_value
      const newTotalValue = Math.max(0, (customer?.total_value || 0) - Number(salePrice));
      await supabase.from('customers').update({
        total_value: newTotalValue,
      }).eq('id', customerId);
      
      fetchAllData();
      onUpdate();
      toast.success('Vendita eliminata');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Errore eliminazione vendita');
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

  // Convert quote to sale
  const convertQuoteToSale = async (quote: any) => {
    if (!customerId) return;
    try {
      // Parse items safely
      const items = Array.isArray(quote.items) ? quote.items : [];
      const totalAmount = Number(quote.total_amount) || 0;
      const vatAmount = Number(quote.vat_amount) || 0;
      const totalQty = items.reduce((sum: number, i: any) => sum + (Number(i.quantity_sqm) || 0), 0);
      
      // Calculate subtotal and unit price
      const subtotal = totalAmount - vatAmount;
      const unitPrice = totalQty > 0 ? subtotal / totalQty : 0;
      const vatRate = quote.vat_included ? 0 : 0.22;

      // Calculate COGS and margin
      const productType = items[0]?.product_type || 'MgO';
      const cogsPerSqm = calculateCOGS(productType);
      const totalCogs = cogsPerSqm * totalQty;
      const marginAmount = subtotal - totalCogs;
      const marginPercentage = subtotal > 0 ? (marginAmount / subtotal) * 100 : 0;
      
      // Create sale from quote with all financial data
      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        customer_id: customerId,
        customer_name: customer?.company_name || `${customer?.first_name} ${customer?.last_name}`,
        product_type: productType,
        color: items[0]?.color || null,
        quantity_sqm: totalQty,
        sale_price: unitPrice,
        vat_included: quote.vat_included || false,
        vat_amount: vatAmount,
        vat_rate: vatRate,
        subtotal_amount: subtotal,
        total_amount: totalAmount,
        margin_amount: marginAmount,
        margin_percentage: marginPercentage,
        notes: `Convertito da preventivo ${quote.quote_number || quote.id}`,
      }).select().single();

      if (saleError) throw saleError;

      // Update quote status
      await supabase.from('quotes').update({
        status: 'converted',
        converted_sale_id: saleData.id,
        accepted_date: new Date().toISOString(),
      }).eq('id', quote.id);
      
      // Update customer totals and margin
      const newTotalValue = Number(customer?.total_value || 0) + subtotal;
      const newTotalMargin = Number(customer?.total_margin || 0) + marginAmount;
      await supabase.from('customers').update({
        status: 'working' as const,
        total_value: newTotalValue,
        total_margin: newTotalMargin,
      }).eq('id', customerId);

      fetchAllData();
      onUpdate();
      toast.success('Preventivo convertito in vendita');
    } catch (error) {
      console.error('Error converting quote:', error);
      toast.error('Errore nella conversione');
    }
  };

  if (!customer) return null;

  const getCustomerName = () => {
    if (customer.company_name) return customer.company_name;
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente';
  };

  const statusInfo = CUSTOMER_STATUSES.find(s => s.value === customer.status) || CUSTOMER_STATUSES[0];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">{getCustomerName()}</SheetTitle>
            <Select value={customer.status || 'opportunity'} onValueChange={updateCustomerStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">Caricamento...</div>
        ) : (
          <div className="py-4 space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Valore Totale</span>
                  </div>
                  <div className="text-lg font-bold">€{(customer.total_value || 0).toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Margine Generato</span>
                  </div>
                  <div className="text-lg font-bold">€{(customer.total_margin || 0).toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info / Edit Form */}
            <Card>
              <CardContent className="p-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Tipologia *</Label>
                      <Select value={editData.customer_type} onValueChange={(v) => setEditData({...editData, customer_type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CUSTOMER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome</Label>
                        <Input value={editData.first_name} onChange={e => setEditData({...editData, first_name: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Cognome</Label>
                        <Input value={editData.last_name} onChange={e => setEditData({...editData, last_name: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Azienda</Label>
                      <Input value={editData.company_name} onChange={e => setEditData({...editData, company_name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Email</Label>
                        <Input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Telefono</Label>
                        <Input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Indirizzo</Label>
                      <Input value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Regione</Label>
                        <Select value={editData.region} onValueChange={(v) => setEditData({...editData, region: v, province: '', city: ''})}>
                          <SelectTrigger><SelectValue placeholder="Regione" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {getRegionNames().map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Provincia</Label>
                        <Select value={editData.province} onValueChange={(v) => setEditData({...editData, province: v, city: ''})} disabled={!editData.region}>
                          <SelectTrigger><SelectValue placeholder="Provincia" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {getProvincesForRegion(editData.region).map(p => <SelectItem key={p.code} value={p.code}>{p.name} ({p.code})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Città</Label>
                        <Select value={editData.city} onValueChange={(v) => setEditData({...editData, city: v})} disabled={!editData.province}>
                          <SelectTrigger><SelectValue placeholder="Città" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {getCitiesForProvince(editData.region, editData.province).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">CAP</Label>
                        <Input value={editData.postal_code} onChange={e => setEditData({...editData, postal_code: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">P.IVA</Label>
                        <Input value={editData.vat_number} onChange={e => setEditData({...editData, vat_number: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Codice SDI</Label>
                        <Input value={editData.sdi_code} onChange={e => setEditData({...editData, sdi_code: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">PEC</Label>
                      <Input type="email" value={editData.pec} onChange={e => setEditData({...editData, pec: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Note</Label>
                      <Textarea value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} rows={3} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveCustomer} disabled={saving} className="flex-1">
                        <Save className="w-3 h-3 mr-1" />{saving ? 'Salvataggio...' : 'Salva'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Annulla</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {CUSTOMER_TYPES.find(t => t.value === customer.customer_type)?.label || customer.customer_type}
                      </span>
                      <Button size="sm" variant="ghost" onClick={startEditing}>
                        <Pencil className="w-3 h-3 mr-1" />Modifica
                      </Button>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {customer.email}</div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {customer.phone}</div>
                    )}
                    {(customer.address || customer.city) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> 
                        {[customer.address, customer.city, customer.province, customer.region].filter(Boolean).join(', ')}
                      </div>
                    )}
                    {customer.vat_number && (
                      <div className="flex items-center gap-2"><Building className="w-4 h-4" /> P.IVA: {customer.vat_number}</div>
                    )}
                    {customer.pec && (
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> PEC: {customer.pec}</div>
                    )}
                    {customer.sdi_code && (
                      <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> SDI: {customer.sdi_code}</div>
                    )}
                    {customer.notes && (
                      <div className="flex items-start gap-2 pt-2 border-t"><MessageSquare className="w-4 h-4 mt-0.5" /> <span className="text-muted-foreground">{customer.notes}</span></div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="sales" className="text-xs">Vendite</TabsTrigger>
                <TabsTrigger value="quotes" className="text-xs">Preventivi</TabsTrigger>
                <TabsTrigger value="visits" className="text-xs">Visite</TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs">Reminder</TabsTrigger>
                <TabsTrigger value="actions" className="text-xs">Log</TabsTrigger>
                <TabsTrigger value="contracts" className="text-xs">Contratti</TabsTrigger>
              </TabsList>

              {/* Sales Tab */}
              <TabsContent value="sales" className="space-y-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => window.location.href = '/admin/vendite'}>
                  <Plus className="w-3 h-3 mr-1" />Aggiungi Vendita
                </Button>
                {sales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nessuna vendita</p>
                ) : (
                  sales.map(sale => (
                    <Card key={sale.id}>
                      <CardContent className="p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{sale.product_type} {sale.color && `- ${sale.color}`}</span>
                            <div className="text-muted-foreground text-xs mt-1">
                              {sale.quantity_sqm} mq • {format(new Date(sale.sale_date), 'dd/MM/yyyy')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">€{Number(sale.sale_price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteSale(sale.id, sale.sale_price || 0); }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Quotes Tab */}
              <TabsContent value="quotes" className="space-y-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => window.location.href = `/admin/preventivi/nuovo?customer=${customerId}`}>
                  <Plus className="w-3 h-3 mr-1" />Crea Preventivo
                </Button>
                {quotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nessun preventivo</p>
                ) : (
                  quotes.map(quote => (
                    <Card key={quote.id}>
                      <CardContent className="p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{quote.quote_number || `#${quote.id.slice(0,6)}`}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{quote.status}</Badge>
                          </div>
                          <span className="font-bold">€{(quote.total_amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(quote.created_at), 'dd/MM/yyyy')}
                          </span>
                          {quote.status === 'sent' && (
                            <Button size="sm" variant="default" onClick={() => convertQuoteToSale(quote)}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />Converti in Vendita
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Visits Tab */}
              <TabsContent value="visits" className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    type="date" 
                    value={newVisit.visit_date}
                    onChange={e => setNewVisit({...newVisit, visit_date: e.target.value})}
                  />
                  <Input 
                    placeholder="Tipo visita"
                    value={newVisit.visit_type}
                    onChange={e => setNewVisit({...newVisit, visit_type: e.target.value})}
                  />
                </div>
                <Input 
                  placeholder="Esito"
                  value={newVisit.outcome}
                  onChange={e => setNewVisit({...newVisit, outcome: e.target.value})}
                />
                <Button size="sm" onClick={addVisit}><Plus className="w-3 h-3 mr-1" />Aggiungi Visita</Button>
                
                <div className="space-y-2 mt-4">
                  {visits.map(visit => (
                    <Card key={visit.id}>
                      <CardContent className="p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{visit.visit_type || 'Visita'}</span>
                          <span className="text-muted-foreground">{format(new Date(visit.visit_date), 'dd/MM/yyyy')}</span>
                        </div>
                        {visit.outcome && <p className="text-xs text-muted-foreground mt-1">{visit.outcome}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Reminders Tab */}
              <TabsContent value="reminders" className="space-y-3">
                <Input 
                  placeholder="Titolo reminder"
                  value={newReminder.title}
                  onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                />
                <Input 
                  type="date" 
                  value={newReminder.reminder_date}
                  onChange={e => setNewReminder({...newReminder, reminder_date: e.target.value})}
                />
                <Button size="sm" onClick={addReminder}><Plus className="w-3 h-3 mr-1" />Aggiungi Reminder</Button>
                
                <div className="space-y-2 mt-4">
                  {reminders.map(reminder => (
                    <Card key={reminder.id} className={reminder.is_completed ? 'opacity-50' : ''}>
                      <CardContent className="p-3 text-sm flex items-center justify-between">
                        <div>
                          <span className={`font-medium ${reminder.is_completed ? 'line-through' : ''}`}>{reminder.title}</span>
                          <div className="text-xs text-muted-foreground">{format(new Date(reminder.reminder_date), 'dd/MM/yyyy')}</div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => toggleReminderComplete(reminder.id, reminder.is_completed)}
                        >
                          <CheckCircle2 className={`w-5 h-5 ${reminder.is_completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Action Log Tab */}
              <TabsContent value="actions" className="space-y-3">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Aggiungi nota..."
                    value={newAction}
                    onChange={e => setNewAction(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addActionLog()}
                  />
                  <Button size="sm" onClick={addActionLog}><Plus className="w-3 h-3" /></Button>
                </div>
                
                <div className="space-y-2 mt-4">
                  {actionLogs.map(log => (
                    <Card key={log.id}>
                      <CardContent className="p-3 text-sm">
                        <p>{log.action_description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Contracts Tab with File Upload */}
              <TabsContent value="contracts" className="space-y-3">
                <Input 
                  placeholder="Titolo contratto"
                  value={newContract.title}
                  onChange={e => setNewContract({...newContract, title: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newContract.contract_type} onValueChange={v => setNewContract({...newContract, contract_type: v})}>
                    <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventivo">Preventivo firmato</SelectItem>
                      <SelectItem value="contratto">Contratto</SelectItem>
                      <SelectItem value="documento">Documento lavori</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number"
                    placeholder="Valore €"
                    value={newContract.value}
                    onChange={e => setNewContract({...newContract, value: e.target.value})}
                  />
                </div>
                <Button size="sm" onClick={addContract}><Plus className="w-3 h-3 mr-1" />Aggiungi Contratto</Button>
                
                <div className="space-y-2 mt-4">
                  {contracts.map(contract => (
                    <Card key={contract.id}>
                      <CardContent className="p-3 text-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{contract.title}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{contract.status || 'in_corso'}</Badge>
                          </div>
                          {contract.value > 0 && <span className="font-bold">€{contract.value.toLocaleString()}</span>}
                        </div>
                        {contract.contract_type && <p className="text-xs text-muted-foreground">{contract.contract_type}</p>}
                        
                        {/* File actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          {contract.document_url ? (
                            <>
                              <Button size="sm" variant="outline" onClick={() => previewFile(contract.document_url)}>
                                <Eye className="w-3 h-3 mr-1" />Preview
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => downloadFile(contract.document_url, contract.title)}>
                                <Download className="w-3 h-3 mr-1" />Scarica
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => sendFileByEmail(contract)}>
                                <Send className="w-3 h-3 mr-1" />Email
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(contract.id, file);
                                }}
                              />
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedContractId(contract.id);
                                  fileInputRef.current?.click();
                                }}
                                disabled={uploading}
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                {uploading ? 'Caricamento...' : 'Carica file'}
                              </Button>
                            </div>
                          )}
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteContract(contract.id, contract.document_url)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CustomerDetailSheet;
