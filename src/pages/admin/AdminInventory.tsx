import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface InventoryItem {
  id: string;
  product_type: string;
  quantity_sqm: number;
  purchase_cost: number;
  movement_type: string;
  notes: string | null;
  movement_date: string;
  created_at: string;
}

const AdminInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_type: 'MgO',
    quantity_sqm: '',
    purchase_cost: '',
    movement_type: 'IN',
    notes: '',
    movement_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('movement_date', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Errore nel caricamento magazzino');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantity_sqm || !formData.purchase_cost) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    try {
      const { error } = await supabase.from('inventory').insert({
        product_type: formData.product_type,
        quantity_sqm: parseFloat(formData.quantity_sqm),
        purchase_cost: parseFloat(formData.purchase_cost),
        movement_type: formData.movement_type,
        notes: formData.notes || null,
        movement_date: formData.movement_date,
      });

      if (error) throw error;

      toast.success('Movimento registrato');
      setDialogOpen(false);
      setFormData({
        product_type: 'MgO',
        quantity_sqm: '',
        purchase_cost: '',
        movement_type: 'IN',
        notes: '',
        movement_date: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchInventory();
    } catch (error) {
      console.error('Error adding inventory:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo movimento?')) return;

    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Movimento eliminato');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Calculate current stock
  const calculateStock = (productType: string) => {
    const inMq = inventory
      .filter(i => i.product_type === productType && i.movement_type === 'IN')
      .reduce((sum, i) => sum + Number(i.quantity_sqm), 0);
    const outMq = inventory
      .filter(i => i.product_type === productType && i.movement_type === 'OUT')
      .reduce((sum, i) => sum + Number(i.quantity_sqm), 0);
    return inMq - outMq;
  };

  const mgoStock = calculateStock('MgO');
  const cwcStock = calculateStock('CWC');
  const totalStock = mgoStock + cwcStock;

  // Calculate average cost
  const calculateAvgCost = (productType: string) => {
    const items = inventory.filter(i => i.product_type === productType && i.movement_type === 'IN');
    if (items.length === 0) return 0;
    return items.reduce((sum, i) => sum + Number(i.purchase_cost), 0) / items.length;
  };

  const stockValue = (mgoStock * calculateAvgCost('MgO')) + (cwcStock * calculateAvgCost('CWC'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Magazzino</h2>
          <p className="text-muted-foreground">Gestisci l'inventario e le movimentazioni</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Movimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registra Movimento</DialogTitle>
              <DialogDescription>Inserisci i dati del movimento di magazzino</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prodotto</Label>
                  <Select value={formData.product_type} onValueChange={(v) => setFormData({...formData, product_type: v})}>
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
                  <Label>Tipo Movimento</Label>
                  <Select value={formData.movement_type} onValueChange={(v) => setFormData({...formData, movement_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">Entrata (IN)</SelectItem>
                      <SelectItem value="OUT">Uscita (OUT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantità (mq) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.quantity_sqm}
                    onChange={(e) => setFormData({...formData, quantity_sqm: e.target.value})}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Costo Acquisto (€/mq) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.purchase_cost}
                    onChange={(e) => setFormData({...formData, purchase_cost: e.target.value})}
                    placeholder="15"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Movimento</Label>
                <Input
                  type="date"
                  value={formData.movement_date}
                  onChange={(e) => setFormData({...formData, movement_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Note</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Note aggiuntive"
                />
              </div>
              <Button type="submit" className="w-full">Salva Movimento</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock MgO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mgoStock.toFixed(0)} mq</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock CWC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cwcStock.toFixed(0)} mq</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toFixed(0)} mq</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valore Magazzino</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stockValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movimenti Magazzino</CardTitle>
          <CardDescription>{inventory.length} movimenti registrati</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Caricamento...</p>
          ) : inventory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessun movimento registrato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prodotto</TableHead>
                  <TableHead className="text-right">Quantità</TableHead>
                  <TableHead className="text-right">Costo/mq</TableHead>
                  <TableHead className="text-right">Valore</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{format(new Date(item.movement_date), 'dd MMM yyyy', { locale: it })}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${item.movement_type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.movement_type === 'IN' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                        {item.movement_type}
                      </span>
                    </TableCell>
                    <TableCell>{item.product_type}</TableCell>
                    <TableCell className="text-right">{Number(item.quantity_sqm).toFixed(0)} mq</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(item.purchase_cost))}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(item.quantity_sqm) * Number(item.purchase_cost))}</TableCell>
                    <TableCell className="text-muted-foreground">{item.notes || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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

export default AdminInventory;
