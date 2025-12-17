import { useState, useEffect } from 'react';
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
  Calendar, Plus, FileText, Clock, MessageSquare, CheckCircle2
} from 'lucide-react';

interface CustomerDetailSheetProps {
  customerId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const CUSTOMER_STATUSES = [
  { value: 'lead', label: 'Lead', color: 'bg-yellow-500' },
  { value: 'attivo', label: 'Attivo', color: 'bg-green-500' },
  { value: 'inattivo', label: 'Inattivo', color: 'bg-gray-500' },
];

const CustomerDetailSheet = ({ customerId, open, onClose, onUpdate }: CustomerDetailSheetProps) => {
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newVisit, setNewVisit] = useState({ visit_date: '', visit_type: '', outcome: '', notes: '' });
  const [newReminder, setNewReminder] = useState({ title: '', reminder_date: '', description: '' });
  const [newAction, setNewAction] = useState('');
  const [newContract, setNewContract] = useState({ title: '', contract_type: '', value: '', start_date: '', notes: '' });

  useEffect(() => {
    if (customerId && open) {
      fetchAllData();
    }
  }, [customerId, open]);

  const fetchAllData = async () => {
    if (!customerId) return;
    setLoading(true);
    
    try {
      const [customerRes, salesRes, visitsRes, remindersRes, logsRes, contractsRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', customerId).single(),
        supabase.from('sales').select('*').eq('customer_id', customerId).order('sale_date', { ascending: false }),
        supabase.from('customer_visits').select('*').eq('customer_id', customerId).order('visit_date', { ascending: false }),
        supabase.from('customer_reminders').select('*').eq('customer_id', customerId).order('reminder_date', { ascending: true }),
        supabase.from('customer_action_logs').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
        supabase.from('customer_contracts').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
      ]);

      if (customerRes.data) setCustomer(customerRes.data);
      setSales(salesRes.data || []);
      setVisits(visitsRes.data || []);
      setReminders(remindersRes.data || []);
      setActionLogs(logsRes.data || []);
      setContracts(contractsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      await supabase.from('customer_contracts').insert({
        customer_id: customerId,
        title: newContract.title,
        contract_type: newContract.contract_type || null,
        value: newContract.value ? parseFloat(newContract.value) : 0,
        start_date: newContract.start_date || null,
        notes: newContract.notes || null,
      });
      setNewContract({ title: '', contract_type: '', value: '', start_date: '', notes: '' });
      fetchAllData();
      toast.success('Contratto aggiunto');
    } catch (error) {
      toast.error('Errore');
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
            <Select value={customer.status || 'lead'} onValueChange={updateCustomerStatus}>
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

            {/* Contact Info */}
            <Card>
              <CardContent className="p-3 space-y-2 text-sm">
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
              </CardContent>
            </Card>

            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="sales" className="text-xs">Vendite</TabsTrigger>
                <TabsTrigger value="visits" className="text-xs">Visite</TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs">Reminder</TabsTrigger>
                <TabsTrigger value="actions" className="text-xs">Log</TabsTrigger>
                <TabsTrigger value="contracts" className="text-xs">Contratti</TabsTrigger>
              </TabsList>

              {/* Sales Tab */}
              <TabsContent value="sales" className="space-y-2">
                {sales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nessuna vendita</p>
                ) : (
                  sales.map(sale => (
                    <Card key={sale.id}>
                      <CardContent className="p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{sale.product_type} {sale.color && `- ${sale.color}`}</span>
                          <span className="font-bold">€{sale.sale_price?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-xs mt-1">
                          <span>{sale.quantity_sqm} mq</span>
                          <span>{format(new Date(sale.sale_date), 'dd/MM/yyyy')}</span>
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

              {/* Contracts Tab */}
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
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="contratto">Contratto</SelectItem>
                      <SelectItem value="documento">Documento</SelectItem>
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
                      <CardContent className="p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{contract.title}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{contract.status || 'in_corso'}</Badge>
                          </div>
                          {contract.value > 0 && <span className="font-bold">€{contract.value.toLocaleString()}</span>}
                        </div>
                        {contract.contract_type && <p className="text-xs text-muted-foreground mt-1">{contract.contract_type}</p>}
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
