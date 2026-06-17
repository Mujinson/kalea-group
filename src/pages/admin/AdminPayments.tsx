import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { CrmPageHeader } from '@/components/admin/CrmShell';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface Payment {
  id: string;
  supplier_name: string;
  total_debt: number;
  payment_amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

interface Agreement {
  id: string;
  supplier_name: string;
  total_amount: number;
  start_date: string;
  end_date: string;
  notes: string | null;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    payment_amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  const [agreementForm, setAgreementForm] = useState({
    supplier_name: '',
    total_amount: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    notes: '',
  });

  const handleDataChange = useCallback(() => {
    fetchData();
  }, []);

  useRealtimeSubscription({
    tables: ['payment_schedules', 'sales'],
    onDataChange: handleDataChange,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, agreementRes] = await Promise.all([
        supabase.from('supplier_payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('payment_agreements').select('*').maybeSingle(),
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      setPayments(paymentsRes.data || []);

      if (agreementRes.data) {
        setAgreement(agreementRes.data);
        setAgreementForm({
          supplier_name: agreementRes.data.supplier_name,
          total_amount: agreementRes.data.total_amount.toString(),
          start_date: agreementRes.data.start_date,
          end_date: agreementRes.data.end_date,
          notes: agreementRes.data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentForm.payment_amount) {
      toast.error('Inserisci l\'importo');
      return;
    }

    try {
      if (!agreement) {
        toast.error('Configura prima un accordo');
        return;
      }
      const { error } = await supabase.from('supplier_payments').insert({
        supplier_name: agreement.supplier_name,
        total_debt: agreement.total_amount,
        payment_amount: parseFloat(paymentForm.payment_amount),
        payment_date: paymentForm.payment_date,
        notes: paymentForm.notes || null,
      });

      if (error) throw error;

      toast.success('Pagamento registrato');
      setPaymentDialogOpen(false);
      setPaymentForm({
        payment_amount: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const handleAgreementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreementForm.total_amount || !agreementForm.end_date) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    try {
      const payload = {
        supplier_name: agreementForm.supplier_name,
        total_amount: parseFloat(agreementForm.total_amount),
        start_date: agreementForm.start_date,
        end_date: agreementForm.end_date,
        notes: agreementForm.notes || null,
      };

      if (agreement) {
        const { error } = await supabase
          .from('payment_agreements')
          .update(payload)
          .eq('id', agreement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('payment_agreements').insert(payload);
        if (error) throw error;
      }

      toast.success('Accordo salvato');
      setAgreementDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving agreement:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo pagamento?')) return;

    try {
      const { error } = await supabase.from('supplier_payments').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Pagamento eliminato');
      fetchData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const handleDeleteAgreement = async () => {
    if (!agreement) return;
    if (!confirm('Eliminare definitivamente questo accordo? I pagamenti registrati verranno mantenuti.')) return;
    try {
      const { error } = await supabase.from('payment_agreements').delete().eq('id', agreement.id);
      if (error) throw error;
      toast.success('Accordo eliminato');
      setAgreement(null);
      setAgreementForm({ supplier_name: '', total_amount: '', start_date: format(new Date(), 'yyyy-MM-dd'), end_date: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error deleting agreement:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.payment_amount), 0);
  const totalDebt = agreement?.total_amount || 0;
  const remaining = Math.max(0, totalDebt - totalPaid);
  const progressPercent = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;

  const daysRemaining = agreement?.end_date
    ? Math.max(0, differenceInDays(new Date(agreement.end_date), new Date()))
    : 0;

  const isUrgent = !!agreement && daysRemaining < 30 && remaining > 0;

  return (
    <div className="space-y-4">
      <CrmPageHeader breadcrumb={["CRM", "Finanza", "Pagamenti"]} title="Pagamenti Fornitore" subtitle="Accordo di pagamento differito" />
      <div className="flex items-center justify-end gap-2">
        <div className="flex gap-2">
          <Dialog open={agreementDialogOpen} onOpenChange={setAgreementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                {agreement ? 'Modifica Accordo' : 'Configura Accordo'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Accordo di Pagamento</DialogTitle>
                <DialogDescription>Configura i dettagli dell'accordo con il fornitore</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAgreementSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Fornitore</Label>
                  <Input
                    value={agreementForm.supplier_name}
                    onChange={(e) => setAgreementForm({...agreementForm, supplier_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Importo Totale (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={agreementForm.total_amount}
                    onChange={(e) => setAgreementForm({...agreementForm, total_amount: e.target.value})}
                    placeholder="89100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inizio</Label>
                    <Input
                      type="date"
                      value={agreementForm.start_date}
                      onChange={(e) => setAgreementForm({...agreementForm, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Scadenza *</Label>
                    <Input
                      type="date"
                      value={agreementForm.end_date}
                      onChange={(e) => setAgreementForm({...agreementForm, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Input
                    value={agreementForm.notes}
                    onChange={(e) => setAgreementForm({...agreementForm, notes: e.target.value})}
                    placeholder="Note aggiuntive"
                  />
                </div>
                <Button type="submit" className="w-full">Salva Accordo</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registra Pagamento</DialogTitle>
                <DialogDescription>Inserisci i dettagli del pagamento effettuato</DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Importo (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentForm.payment_amount}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_amount: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Pagamento</Label>
                  <Input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Input
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                    placeholder="Es: Bonifico, rata mensile, etc."
                  />
                </div>
                <Button type="submit" className="w-full">Registra Pagamento</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Agreement Status Card */}
      <Card className={isUrgent ? 'border-orange-500' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isUrgent && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                Stato Accordo - {agreement?.supplier_name || 'Fornitore Terni'}
              </CardTitle>
              <CardDescription>
                {agreement ? (
                  <>Dal {format(new Date(agreement.start_date), 'dd MMM yyyy', { locale: it })} al {format(new Date(agreement.end_date), 'dd MMM yyyy', { locale: it })}</>
                ) : (
                  'Configura l\'accordo per iniziare'
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
                <p className="text-sm text-muted-foreground">Debito Totale</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                <p className="text-sm text-muted-foreground">Pagato</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(remaining)}</p>
                <p className="text-sm text-muted-foreground">Residuo</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso: {progressPercent.toFixed(1)}%</span>
                <span className={isUrgent ? 'text-orange-600 font-medium' : ''}>
                  {daysRemaining} giorni rimanenti
                </span>
              </div>
              <Progress value={progressPercent} className="h-4" />
            </div>

            {isUrgent && remaining > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                <strong>Attenzione:</strong> Mancano meno di 30 giorni alla scadenza e ci sono ancora {formatCurrency(remaining)} da pagare.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <div>
        <div className="mb-3">
          <h3 className="text-lg font-semibold">Storico Pagamenti</h3>
          <p className="text-sm text-muted-foreground">{payments.length} pagamenti registrati</p>
        </div>
        <DataTable
          data={payments}
          loading={loading}
          searchPlaceholder="Cerca per note o importo…"
          searchKeys={['notes', 'payment_amount']}
          emptyTitle="Nessun pagamento"
          emptyDescription="Non ci sono pagamenti registrati."
          columns={[
            {
              key: 'payment_date',
              header: 'Data',
              sortable: true,
              accessor: (p) => new Date(p.payment_date).getTime(),
              cell: (p) => format(new Date(p.payment_date), 'dd MMM yyyy', { locale: it }),
            },
            {
              key: 'payment_amount',
              header: 'Importo',
              sortable: true,
              className: 'text-right',
              accessor: (p) => Number(p.payment_amount),
              cell: (p) => (
                <span className="font-medium text-green-600">{formatCurrency(Number(p.payment_amount))}</span>
              ),
            },
            { key: 'notes', header: 'Note', cell: (p) => p.notes || '—' },
            {
              key: 'actions',
              header: '',
              cell: (p) => (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePayment(p.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              ),
            },
          ] as DataTableColumn<Payment>[]}
        />
      </div>
    </div>
  );
};

export default AdminPayments;
