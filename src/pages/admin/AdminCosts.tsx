import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  Euro,
  Calendar,
  User,
  Edit2
} from 'lucide-react';

// Types
interface FixedCost {
  id: string;
  description: string;
  category: string;
  amount: number;
  frequency: string;
  cost_date: string;
  is_paid: boolean;
  paid_date: string | null;
  notes: string | null;
  person_name: string | null;
  created_at: string;
}

interface VariableCost {
  id: string;
  description: string;
  category: string;
  amount: number;
  frequency: string;
  cost_date: string;
  is_paid: boolean;
  paid_date: string | null;
  notes: string | null;
  customer_id: string | null;
  sale_id: string | null;
  salesperson_id: string | null;
  created_at: string;
}

interface StockValuation {
  id: string;
  description: string;
  total_value: number;
  notes: string | null;
  last_updated: string;
}

interface StaticCost {
  id: string;
  product_type: string;
  fob_cost: number;
  duty_percentage: number;
  vat_percentage: number;
  import_logistics_cost: number;
  internal_transport_cost: number | null;
}

const FIXED_COST_CATEGORIES = [
  { value: 'stipendi', label: 'Stipendi' },
  { value: 'affitto_magazzino', label: 'Affitto Magazzino' },
  { value: 'utenze', label: 'Utenze (luce, acqua, gas, internet)' },
  { value: 'software_saas', label: 'Software / SaaS' },
  { value: 'assicurazioni', label: 'Assicurazioni' },
  { value: 'spese_bancarie', label: 'Spese Bancarie' },
  { value: 'altri_costi_fissi', label: 'Altri Costi Fissi' },
];

const VARIABLE_COST_CATEGORIES = [
  { value: 'trasporti', label: 'Trasporti' },
  { value: 'logistica', label: 'Logistica' },
  { value: 'campionature', label: 'Campionature' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'spese_commerciali', label: 'Spese Commerciali' },
  { value: 'altri', label: 'Altri' },
];

const FREQUENCIES = [
  { value: 'mensile', label: 'Mensile' },
  { value: 'trimestrale', label: 'Trimestrale' },
  { value: 'annuale', label: 'Annuale' },
  { value: 'una_tantum', label: 'Una Tantum' },
];

const AdminCosts = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fissi');
  const [loading, setLoading] = useState(true);
  
  // Fixed Costs State
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [fixedCostDialog, setFixedCostDialog] = useState(false);
  const [editingFixedCost, setEditingFixedCost] = useState<FixedCost | null>(null);
  const [fixedCostForm, setFixedCostForm] = useState({
    description: '',
    category: '',
    amount: '',
    frequency: 'mensile',
    cost_date: new Date().toISOString().split('T')[0],
    is_paid: false,
    paid_date: '',
    notes: '',
    person_name: '',
  });

  // Variable Costs State
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>([]);
  const [variableCostDialog, setVariableCostDialog] = useState(false);
  const [editingVariableCost, setEditingVariableCost] = useState<VariableCost | null>(null);
  const [variableCostForm, setVariableCostForm] = useState({
    description: '',
    category: '',
    amount: '',
    frequency: 'una_tantum',
    cost_date: new Date().toISOString().split('T')[0],
    is_paid: false,
    paid_date: '',
    notes: '',
  });

  // Stock Valuation State
  const [stockValuation, setStockValuation] = useState<StockValuation | null>(null);
  const [stockDialog, setStockDialog] = useState(false);
  const [stockForm, setStockForm] = useState({ total_value: '', notes: '' });

  // Static Costs State (COGS)
  const [staticCosts, setStaticCosts] = useState<StaticCost[]>([]);
  const [staticCostDialog, setStaticCostDialog] = useState(false);
  const [editingStaticCost, setEditingStaticCost] = useState<StaticCost | null>(null);
  const [staticCostForm, setStaticCostForm] = useState({
    product_type: 'MgO',
    fob_cost: '',
    duty_percentage: '1.7',
    vat_percentage: '22',
    import_logistics_cost: '0.49',
    internal_transport_cost: '',
  });

  const handleDataChange = useCallback(() => {
    fetchAllData();
  }, []);

  useRealtimeSubscription({
    tables: ['fixed_costs', 'variable_costs'],
    onDataChange: handleDataChange,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchFixedCosts(),
      fetchVariableCosts(),
      fetchStockValuation(),
      fetchStaticCosts(),
    ]);
    setLoading(false);
  };

  const fetchFixedCosts = async () => {
    const { data, error } = await supabase
      .from('fixed_costs')
      .select('*')
      .order('cost_date', { ascending: false });
    if (!error) setFixedCosts(data || []);
  };

  const fetchVariableCosts = async () => {
    const { data, error } = await supabase
      .from('variable_costs')
      .select('*')
      .order('cost_date', { ascending: false });
    if (!error) setVariableCosts(data || []);
  };

  const fetchStockValuation = async () => {
    const { data } = await supabase
      .from('stock_valuation')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (data) {
      setStockValuation(data);
      setStockForm({ total_value: data.total_value?.toString() || '', notes: data.notes || '' });
    }
  };

  const fetchStaticCosts = async () => {
    const { data } = await supabase
      .from('static_costs')
      .select('*')
      .order('product_type');
    if (data) setStaticCosts(data);
  };

  // Fixed Cost CRUD
  const handleFixedCostSubmit = async () => {
    const payload = {
      description: fixedCostForm.description,
      category: fixedCostForm.category as 'stipendi' | 'affitto_magazzino' | 'utenze' | 'software_saas' | 'assicurazioni' | 'spese_bancarie' | 'altri_costi_fissi',
      amount: parseFloat(fixedCostForm.amount),
      frequency: fixedCostForm.frequency as 'mensile' | 'trimestrale' | 'annuale' | 'una_tantum',
      cost_date: fixedCostForm.cost_date,
      is_paid: fixedCostForm.is_paid,
      paid_date: fixedCostForm.is_paid && fixedCostForm.paid_date ? fixedCostForm.paid_date : null,
      notes: fixedCostForm.notes || null,
      person_name: fixedCostForm.person_name || null,
    };

    const { error } = editingFixedCost
      ? await supabase.from('fixed_costs').update(payload).eq('id', editingFixedCost.id)
      : await supabase.from('fixed_costs').insert([payload]);

    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Successo', description: editingFixedCost ? 'Costo aggiornato' : 'Costo aggiunto' });
      setFixedCostDialog(false);
      resetFixedCostForm();
      fetchFixedCosts();
    }
  };

  const deleteFixedCost = async (id: string) => {
    if (!confirm('Eliminare questo costo?')) return;
    await supabase.from('fixed_costs').delete().eq('id', id);
    fetchFixedCosts();
  };

  const resetFixedCostForm = () => {
    setFixedCostForm({
      description: '', category: '', amount: '', frequency: 'mensile',
      cost_date: new Date().toISOString().split('T')[0], is_paid: false,
      paid_date: '', notes: '', person_name: '',
    });
    setEditingFixedCost(null);
  };

  const editFixedCost = (cost: FixedCost) => {
    setEditingFixedCost(cost);
    setFixedCostForm({
      description: cost.description, category: cost.category, amount: cost.amount.toString(),
      frequency: cost.frequency, cost_date: cost.cost_date, is_paid: cost.is_paid,
      paid_date: cost.paid_date || '', notes: cost.notes || '', person_name: cost.person_name || '',
    });
    setFixedCostDialog(true);
  };

  // Variable Cost CRUD
  const handleVariableCostSubmit = async () => {
    const payload = {
      description: variableCostForm.description,
      category: variableCostForm.category as 'trasporti' | 'logistica' | 'campionature' | 'marketing' | 'spese_commerciali' | 'altri',
      amount: parseFloat(variableCostForm.amount),
      frequency: variableCostForm.frequency as 'mensile' | 'trimestrale' | 'annuale' | 'una_tantum',
      cost_date: variableCostForm.cost_date,
      is_paid: variableCostForm.is_paid,
      paid_date: variableCostForm.is_paid && variableCostForm.paid_date ? variableCostForm.paid_date : null,
      notes: variableCostForm.notes || null,
    };

    const { error } = editingVariableCost
      ? await supabase.from('variable_costs').update(payload).eq('id', editingVariableCost.id)
      : await supabase.from('variable_costs').insert([payload]);

    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Successo', description: editingVariableCost ? 'Costo aggiornato' : 'Costo aggiunto' });
      setVariableCostDialog(false);
      resetVariableCostForm();
      fetchVariableCosts();
    }
  };

  const deleteVariableCost = async (id: string) => {
    if (!confirm('Eliminare questo costo?')) return;
    await supabase.from('variable_costs').delete().eq('id', id);
    fetchVariableCosts();
  };

  const resetVariableCostForm = () => {
    setVariableCostForm({
      description: '', category: '', amount: '', frequency: 'una_tantum',
      cost_date: new Date().toISOString().split('T')[0], is_paid: false, paid_date: '', notes: '',
    });
    setEditingVariableCost(null);
  };

  const editVariableCost = (cost: VariableCost) => {
    setEditingVariableCost(cost);
    setVariableCostForm({
      description: cost.description, category: cost.category, amount: cost.amount.toString(),
      frequency: cost.frequency, cost_date: cost.cost_date, is_paid: cost.is_paid,
      paid_date: cost.paid_date || '', notes: cost.notes || '',
    });
    setVariableCostDialog(true);
  };

  // Stock Valuation Update
  const handleStockUpdate = async () => {
    if (!stockValuation) return;
    const { error } = await supabase
      .from('stock_valuation')
      .update({ total_value: parseFloat(stockForm.total_value), notes: stockForm.notes || null, last_updated: new Date().toISOString().split('T')[0] })
      .eq('id', stockValuation.id);
    if (!error) {
      toast({ title: 'Successo', description: 'Valore stock aggiornato' });
      setStockDialog(false);
      fetchStockValuation();
    }
  };

  // Static Cost (COGS) CRUD
  const handleStaticCostSubmit = async () => {
    const payload = {
      product_type: staticCostForm.product_type,
      fob_cost: parseFloat(staticCostForm.fob_cost),
      duty_percentage: parseFloat(staticCostForm.duty_percentage),
      vat_percentage: parseFloat(staticCostForm.vat_percentage),
      import_logistics_cost: parseFloat(staticCostForm.import_logistics_cost),
      internal_transport_cost: staticCostForm.internal_transport_cost ? parseFloat(staticCostForm.internal_transport_cost) : null,
    };

    const { error } = editingStaticCost
      ? await supabase.from('static_costs').update(payload).eq('id', editingStaticCost.id)
      : await supabase.from('static_costs').insert([payload]);

    if (!error) {
      toast({ title: 'Successo', description: 'Costi prodotto salvati' });
      setStaticCostDialog(false);
      resetStaticCostForm();
      fetchStaticCosts();
    }
  };

  const deleteStaticCost = async (id: string) => {
    if (!confirm('Eliminare?')) return;
    await supabase.from('static_costs').delete().eq('id', id);
    fetchStaticCosts();
  };

  const resetStaticCostForm = () => {
    setStaticCostForm({ product_type: 'MgO', fob_cost: '', duty_percentage: '1.7', vat_percentage: '22', import_logistics_cost: '0.49', internal_transport_cost: '' });
    setEditingStaticCost(null);
  };

  const editStaticCost = (cost: StaticCost) => {
    setEditingStaticCost(cost);
    setStaticCostForm({
      product_type: cost.product_type, fob_cost: cost.fob_cost.toString(),
      duty_percentage: cost.duty_percentage.toString(), vat_percentage: cost.vat_percentage.toString(),
      import_logistics_cost: cost.import_logistics_cost.toString(),
      internal_transport_cost: cost.internal_transport_cost?.toString() || '',
    });
    setStaticCostDialog(true);
  };

  const calculateCOGS = (cost: StaticCost) => {
    const fob = Number(cost.fob_cost);
    return fob + (fob * Number(cost.duty_percentage) / 100) + Number(cost.import_logistics_cost) + (Number(cost.internal_transport_cost) || 0);
  };

  // Helpers
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  const getCategoryLabel = (value: string, categories: { value: string; label: string }[]) => categories.find(c => c.value === value)?.label || value;
  const getFrequencyLabel = (value: string) => FREQUENCIES.find(f => f.value === value)?.label || value;

  // Totals
  const totalFixedCosts = fixedCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalVariableCosts = variableCosts.reduce((sum, c) => sum + c.amount, 0);
  const unpaidTotal = fixedCosts.filter(c => !c.is_paid).reduce((sum, c) => sum + c.amount, 0) + variableCosts.filter(c => !c.is_paid).reduce((sum, c) => sum + c.amount, 0);

  if (loading) return <div className="flex items-center justify-center h-64">Caricamento...</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">Gestione Costi</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Costi Fissi</p>
              <p className="text-sm md:text-lg font-bold">{formatCurrency(totalFixedCosts)}</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Costi Variabili</p>
              <p className="text-sm md:text-lg font-bold">{formatCurrency(totalVariableCosts)}</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-yellow-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Da Pagare</p>
              <p className="text-sm md:text-lg font-bold">{formatCurrency(unpaidTotal)}</p>
            </div>
          </div>
        </CardContent></Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStockDialog(true)}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Stock Terni</p>
                <p className="text-sm md:text-lg font-bold">{formatCurrency(stockValuation?.total_value || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 h-auto">
          <TabsTrigger value="fissi" className="text-xs md:text-sm py-2">Costi Fissi</TabsTrigger>
          <TabsTrigger value="variabili" className="text-xs md:text-sm py-2">Costi Variabili</TabsTrigger>
          <TabsTrigger value="cogs" className="text-xs md:text-sm py-2">COGS Prodotto</TabsTrigger>
        </TabsList>

        {/* Fixed Costs Tab */}
        <TabsContent value="fissi" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm md:text-base">Costi Fissi</h3>
            <Dialog open={fixedCostDialog} onOpenChange={(open) => { setFixedCostDialog(open); if (!open) resetFixedCostForm(); }}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Aggiungi</Button></DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingFixedCost ? 'Modifica' : 'Nuovo'} Costo Fisso</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Descrizione *</Label><Input value={fixedCostForm.description} onChange={(e) => setFixedCostForm({ ...fixedCostForm, description: e.target.value })} /></div>
                  <div><Label>Categoria *</Label>
                    <Select value={fixedCostForm.category} onValueChange={(v) => setFixedCostForm({ ...fixedCostForm, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                      <SelectContent>{FIXED_COST_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {fixedCostForm.category === 'stipendi' && <div><Label>Nome Persona</Label><Input value={fixedCostForm.person_name} onChange={(e) => setFixedCostForm({ ...fixedCostForm, person_name: e.target.value })} /></div>}
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Importo (€) *</Label><Input type="number" step="0.01" value={fixedCostForm.amount} onChange={(e) => setFixedCostForm({ ...fixedCostForm, amount: e.target.value })} /></div>
                    <div><Label>Frequenza</Label>
                      <Select value={fixedCostForm.frequency} onValueChange={(v) => setFixedCostForm({ ...fixedCostForm, frequency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Data</Label><Input type="date" value={fixedCostForm.cost_date} onChange={(e) => setFixedCostForm({ ...fixedCostForm, cost_date: e.target.value })} /></div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_paid" checked={fixedCostForm.is_paid} onCheckedChange={(checked) => setFixedCostForm({ ...fixedCostForm, is_paid: !!checked })} />
                    <Label htmlFor="is_paid">Pagato</Label>
                  </div>
                  {fixedCostForm.is_paid && <div><Label>Data Pagamento</Label><Input type="date" value={fixedCostForm.paid_date} onChange={(e) => setFixedCostForm({ ...fixedCostForm, paid_date: e.target.value })} /></div>}
                  <div><Label>Note</Label><Textarea value={fixedCostForm.notes} onChange={(e) => setFixedCostForm({ ...fixedCostForm, notes: e.target.value })} /></div>
                  <Button onClick={handleFixedCostSubmit} className="w-full">{editingFixedCost ? 'Aggiorna' : 'Salva'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {fixedCosts.length === 0 ? <p className="text-muted-foreground text-center py-8 text-sm">Nessun costo fisso</p> : fixedCosts.map((cost) => (
              <Card key={cost.id}><CardContent className="p-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm truncate">{cost.description}</h4>
                      <Badge variant={cost.is_paid ? 'default' : 'destructive'} className="text-xs">{cost.is_paid ? 'Pagato' : 'Da pagare'}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1 text-xs text-muted-foreground">
                      <span>{getCategoryLabel(cost.category, FIXED_COST_CATEGORIES)}</span>
                      <span>•</span>
                      <span>{getFrequencyLabel(cost.frequency)}</span>
                      {cost.person_name && <><span>•</span><span className="flex items-center gap-1"><User className="w-3 h-3" />{cost.person_name}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-2">
                    <span className="font-bold">{formatCurrency(cost.amount)}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => editFixedCost(cost)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteFixedCost(cost.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        {/* Variable Costs Tab */}
        <TabsContent value="variabili" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm md:text-base">Costi Variabili</h3>
            <Dialog open={variableCostDialog} onOpenChange={(open) => { setVariableCostDialog(open); if (!open) resetVariableCostForm(); }}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Aggiungi</Button></DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingVariableCost ? 'Modifica' : 'Nuovo'} Costo Variabile</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Descrizione *</Label><Input value={variableCostForm.description} onChange={(e) => setVariableCostForm({ ...variableCostForm, description: e.target.value })} /></div>
                  <div><Label>Categoria *</Label>
                    <Select value={variableCostForm.category} onValueChange={(v) => setVariableCostForm({ ...variableCostForm, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                      <SelectContent>{VARIABLE_COST_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Importo (€) *</Label><Input type="number" step="0.01" value={variableCostForm.amount} onChange={(e) => setVariableCostForm({ ...variableCostForm, amount: e.target.value })} /></div>
                    <div><Label>Frequenza</Label>
                      <Select value={variableCostForm.frequency} onValueChange={(v) => setVariableCostForm({ ...variableCostForm, frequency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Data</Label><Input type="date" value={variableCostForm.cost_date} onChange={(e) => setVariableCostForm({ ...variableCostForm, cost_date: e.target.value })} /></div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="var_is_paid" checked={variableCostForm.is_paid} onCheckedChange={(checked) => setVariableCostForm({ ...variableCostForm, is_paid: !!checked })} />
                    <Label htmlFor="var_is_paid">Pagato</Label>
                  </div>
                  {variableCostForm.is_paid && <div><Label>Data Pagamento</Label><Input type="date" value={variableCostForm.paid_date} onChange={(e) => setVariableCostForm({ ...variableCostForm, paid_date: e.target.value })} /></div>}
                  <div><Label>Note</Label><Textarea value={variableCostForm.notes} onChange={(e) => setVariableCostForm({ ...variableCostForm, notes: e.target.value })} /></div>
                  <Button onClick={handleVariableCostSubmit} className="w-full">{editingVariableCost ? 'Aggiorna' : 'Salva'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {variableCosts.length === 0 ? <p className="text-muted-foreground text-center py-8 text-sm">Nessun costo variabile</p> : variableCosts.map((cost) => (
              <Card key={cost.id}><CardContent className="p-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm truncate">{cost.description}</h4>
                      <Badge variant={cost.is_paid ? 'default' : 'destructive'} className="text-xs">{cost.is_paid ? 'Pagato' : 'Da pagare'}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1 text-xs text-muted-foreground">
                      <span>{getCategoryLabel(cost.category, VARIABLE_COST_CATEGORIES)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(cost.cost_date).toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-2">
                    <span className="font-bold">{formatCurrency(cost.amount)}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => editVariableCost(cost)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteVariableCost(cost.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        {/* COGS Tab */}
        <TabsContent value="cogs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm md:text-base">Costi Prodotto (COGS)</h3>
            <Dialog open={staticCostDialog} onOpenChange={(open) => { setStaticCostDialog(open); if (!open) resetStaticCostForm(); }}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Nuovo Prodotto</Button></DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingStaticCost ? 'Modifica' : 'Aggiungi'} Costi Prodotto</DialogTitle>
                  <DialogDescription>Inserisci i costi statici per il prodotto</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div><Label>Tipo Prodotto</Label><Input value={staticCostForm.product_type} onChange={(e) => setStaticCostForm({ ...staticCostForm, product_type: e.target.value })} placeholder="MgO, CWC, etc." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Costo FOB (€/mq) *</Label><Input type="number" step="0.01" value={staticCostForm.fob_cost} onChange={(e) => setStaticCostForm({ ...staticCostForm, fob_cost: e.target.value })} /></div>
                    <div><Label>Dazi (%)</Label><Input type="number" step="0.1" value={staticCostForm.duty_percentage} onChange={(e) => setStaticCostForm({ ...staticCostForm, duty_percentage: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>IVA (%)</Label><Input type="number" step="0.1" value={staticCostForm.vat_percentage} onChange={(e) => setStaticCostForm({ ...staticCostForm, vat_percentage: e.target.value })} /></div>
                    <div><Label>Spese Import (€/mq)</Label><Input type="number" step="0.01" value={staticCostForm.import_logistics_cost} onChange={(e) => setStaticCostForm({ ...staticCostForm, import_logistics_cost: e.target.value })} /></div>
                  </div>
                  <div><Label>Trasporto Interno (€/mq)</Label><Input type="number" step="0.01" value={staticCostForm.internal_transport_cost} onChange={(e) => setStaticCostForm({ ...staticCostForm, internal_transport_cost: e.target.value })} placeholder="Opzionale" /></div>
                  <Button onClick={handleStaticCostSubmit} className="w-full">{editingStaticCost ? 'Aggiorna' : 'Salva'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staticCosts.map((cost) => (
              <Card key={cost.id}>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <div>
                    <CardTitle className="text-base">{cost.product_type}</CardTitle>
                    <CardDescription>COGS: {formatCurrency(calculateCOGS(cost))}/mq</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => editStaticCost(cost)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteStaticCost(cost.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">FOB</span><span>{formatCurrency(cost.fob_cost)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Dazi ({cost.duty_percentage}%)</span><span>{formatCurrency(cost.fob_cost * cost.duty_percentage / 100)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Import/Logistica</span><span>{formatCurrency(cost.import_logistics_cost)}</span></div>
                    {cost.internal_transport_cost && <div className="flex justify-between"><span className="text-muted-foreground">Trasporto Int.</span><span>{formatCurrency(cost.internal_transport_cost)}</span></div>}
                    <div className="flex justify-between pt-2 border-t font-medium"><span>COGS Totale</span><span>{formatCurrency(calculateCOGS(cost))}/mq</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {staticCosts.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">Nessun costo prodotto configurato</p>}
        </TabsContent>
      </Tabs>

      {/* Stock Dialog */}
      <Dialog open={stockDialog} onOpenChange={setStockDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Valore Stock Terni</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Valore informativo dello stock pavimento a Terni.</p>
            <div><Label>Valore Totale (€)</Label><Input type="number" step="0.01" value={stockForm.total_value} onChange={(e) => setStockForm({ ...stockForm, total_value: e.target.value })} /></div>
            <div><Label>Note</Label><Textarea value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })} /></div>
            {stockValuation?.last_updated && <p className="text-xs text-muted-foreground">Ultimo aggiornamento: {new Date(stockValuation.last_updated).toLocaleDateString('it-IT')}</p>}
            <Button onClick={handleStockUpdate} className="w-full">Aggiorna</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCosts;