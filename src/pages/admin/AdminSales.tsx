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
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Sale {
  id: string;
  product_type: string;
  quantity_sqm: number;
  sale_price: number;
  channel: string;
  customer_name: string | null;
  notes: string | null;
  sale_date: string;
  created_at: string;
}

const AdminSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_type: 'MgO',
    quantity_sqm: '',
    sale_price: '',
    channel: 'B2B',
    customer_name: '',
    notes: '',
    sale_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchSales();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantity_sqm || !formData.sale_price) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    try {
      const { error } = await supabase.from('sales').insert({
        product_type: formData.product_type,
        quantity_sqm: parseFloat(formData.quantity_sqm),
        sale_price: parseFloat(formData.sale_price),
        channel: formData.channel,
        customer_name: formData.customer_name || null,
        notes: formData.notes || null,
        sale_date: formData.sale_date,
      });

      if (error) throw error;

      toast.success('Vendita registrata');
      setDialogOpen(false);
      setFormData({
        product_type: 'MgO',
        quantity_sqm: '',
        sale_price: '',
        channel: 'B2B',
        customer_name: '',
        notes: '',
        sale_date: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchSales();
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('Errore nel salvataggio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa vendita?')) return;

    try {
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registra Vendita</DialogTitle>
              <DialogDescription>Inserisci i dati della nuova vendita</DialogDescription>
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
                  <Label>Canale</Label>
                  <Select value={formData.channel} onValueChange={(v) => setFormData({...formData, channel: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B2B">B2B</SelectItem>
                      <SelectItem value="B2C">B2C</SelectItem>
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
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prezzo (€/mq) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                    placeholder="35"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Vendita</Label>
                <Input
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) => setFormData({...formData, sale_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  placeholder="Nome cliente (opzionale)"
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
              <Button type="submit" className="w-full">Salva Vendita</Button>
            </form>
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
                    <TableCell>{sale.product_type}</TableCell>
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
