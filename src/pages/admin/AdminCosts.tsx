import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface StaticCost {
  id: string;
  product_type: string;
  fob_cost: number;
  duty_percentage: number;
  vat_percentage: number;
  import_logistics_cost: number;
  internal_transport_cost: number | null;
  created_at: string;
  updated_at: string;
}

const AdminCosts = () => {
  const [costs, setCosts] = useState<StaticCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product_type: 'MgO',
    fob_cost: '',
    duty_percentage: '1.7',
    vat_percentage: '22',
    import_logistics_cost: '0.49',
    internal_transport_cost: '',
  });

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('static_costs')
        .select('*')
        .order('product_type');

      if (error) throw error;
      setCosts(data || []);
    } catch (error) {
      console.error('Error fetching costs:', error);
      toast.error('Errore nel caricamento costi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fob_cost) {
      toast.error('Inserisci il costo FOB');
      return;
    }

    try {
      const payload = {
        product_type: formData.product_type,
        fob_cost: parseFloat(formData.fob_cost),
        duty_percentage: parseFloat(formData.duty_percentage),
        vat_percentage: parseFloat(formData.vat_percentage),
        import_logistics_cost: parseFloat(formData.import_logistics_cost),
        internal_transport_cost: formData.internal_transport_cost ? parseFloat(formData.internal_transport_cost) : null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('static_costs')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Costi aggiornati');
      } else {
        const { error } = await supabase.from('static_costs').insert(payload);
        if (error) throw error;
        toast.success('Costi salvati');
      }

      setDialogOpen(false);
      setEditingId(null);
      setFormData({
        product_type: 'MgO',
        fob_cost: '',
        duty_percentage: '1.7',
        vat_percentage: '22',
        import_logistics_cost: '0.49',
        internal_transport_cost: '',
      });
      fetchCosts();
    } catch (error) {
      console.error('Error saving costs:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const handleEdit = (cost: StaticCost) => {
    setEditingId(cost.id);
    setFormData({
      product_type: cost.product_type,
      fob_cost: cost.fob_cost.toString(),
      duty_percentage: cost.duty_percentage.toString(),
      vat_percentage: cost.vat_percentage.toString(),
      import_logistics_cost: cost.import_logistics_cost.toString(),
      internal_transport_cost: cost.internal_transport_cost?.toString() || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questi costi?')) return;

    try {
      const { error } = await supabase.from('static_costs').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Costi eliminati');
      fetchCosts();
    } catch (error) {
      console.error('Error deleting costs:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Calculate total COGS for each product
  const calculateCOGS = (cost: StaticCost) => {
    const fob = Number(cost.fob_cost);
    const duty = fob * (Number(cost.duty_percentage) / 100);
    const logistics = Number(cost.import_logistics_cost);
    const transport = Number(cost.internal_transport_cost) || 0;
    return fob + duty + logistics + transport;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Costi</h2>
          <p className="text-muted-foreground">Gestisci i costi statici per prodotto</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData({
              product_type: 'MgO',
              fob_cost: '',
              duty_percentage: '1.7',
              vat_percentage: '22',
              import_logistics_cost: '0.49',
              internal_transport_cost: '',
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Prodotto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Modifica Costi' : 'Aggiungi Costi Prodotto'}</DialogTitle>
              <DialogDescription>Inserisci i costi statici per il prodotto</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo Prodotto</Label>
                <Input
                  value={formData.product_type}
                  onChange={(e) => setFormData({...formData, product_type: e.target.value})}
                  placeholder="MgO, CWC, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Costo FOB (€/mq) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fob_cost}
                    onChange={(e) => setFormData({...formData, fob_cost: e.target.value})}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dazi (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.duty_percentage}
                    onChange={(e) => setFormData({...formData, duty_percentage: e.target.value})}
                    placeholder="1.7"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IVA (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.vat_percentage}
                    onChange={(e) => setFormData({...formData, vat_percentage: e.target.value})}
                    placeholder="22"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Spese Import/Logistica (€/mq)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.import_logistics_cost}
                    onChange={(e) => setFormData({...formData, import_logistics_cost: e.target.value})}
                    placeholder="0.49"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Trasporto Interno (€/mq)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.internal_transport_cost}
                  onChange={(e) => setFormData({...formData, internal_transport_cost: e.target.value})}
                  placeholder="Opzionale (Terni-Bergamo)"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Aggiorna' : 'Salva'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cost Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {costs.map((cost) => (
          <Card key={cost.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{cost.product_type}</CardTitle>
                <CardDescription>Costo totale (COGS): {formatCurrency(calculateCOGS(cost))}/mq</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(cost)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cost.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FOB</span>
                  <span>{formatCurrency(Number(cost.fob_cost))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dazi ({cost.duty_percentage}%)</span>
                  <span>{formatCurrency(Number(cost.fob_cost) * (Number(cost.duty_percentage) / 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Import/Logistica</span>
                  <span>{formatCurrency(Number(cost.import_logistics_cost))}</span>
                </div>
                {cost.internal_transport_cost && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trasporto Interno</span>
                    <span>{formatCurrency(Number(cost.internal_transport_cost))}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>COGS Totale</span>
                  <span>{formatCurrency(calculateCOGS(cost))}/mq</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA ({cost.vat_percentage}%)</span>
                  <span>+ {formatCurrency(calculateCOGS(cost) * (Number(cost.vat_percentage) / 100))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {costs.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nessun costo configurato. Aggiungi i costi per MgO e CWC.</p>
          </CardContent>
        </Card>
      )}

      {/* Cost Formula Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Formula COGS</CardTitle>
          <CardDescription>Come viene calcolato il costo totale della merce</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
            <p>COGS = FOB + (FOB × Dazi%) + Spese Import/Logistica + Trasporto Interno</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Il margine viene calcolato come: (Prezzo Vendita - COGS) / Prezzo Vendita × 100
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCosts;
