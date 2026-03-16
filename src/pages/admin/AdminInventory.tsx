import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const MGO_COLORS = ['Aurora', 'Corteccia', 'Sabbia', 'Terram', 'Velora', 'Perla', 'Silven', 'Cenere'];
const CWC_VARIANTS = ['CWC n.1', 'CWC n.2', 'CWC n.3', 'CWC n.4', 'CWC n.5', 'CWC n.6', 'CWC n.7'];

const STOCK_THRESHOLDS = {
  critical: 50,
  urgent: 100,
  warning: 150,
};

interface InventoryItem {
  id: string;
  product_type: string;
  color: string | null;
  quantity_sqm: number;
  purchase_cost: number;
  movement_type: string;
  notes: string | null;
  movement_date: string;
  low_stock_threshold: number | null;
  created_at: string;
}

interface StockLevel {
  product: string;
  color: string;
  quantity: number;
  avgCost: number;
  status: 'ok' | 'warning' | 'urgent' | 'critical';
}

const AdminInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('mgo');
  const [formData, setFormData] = useState({
    product_type: 'MgO',
    color: '',
    quantity_sqm: '',
    purchase_cost: '',
    movement_type: 'IN',
    notes: '',
    movement_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleDataChange = useCallback(() => {
    fetchInventory();
  }, []);

  useRealtimeSubscription({
    tables: ['inventory', 'sales'],
    onDataChange: handleDataChange,
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
        color: formData.color || null,
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
        color: '',
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

  // Calculate stock by color/variant
  const calculateStockByColor = (productType: string, colorList: string[]): StockLevel[] => {
    return colorList.map(color => {
      const inMq = inventory
        .filter(i => i.product_type === productType && i.color === color && i.movement_type === 'IN')
        .reduce((sum, i) => sum + Number(i.quantity_sqm), 0);
      const outMq = inventory
        .filter(i => i.product_type === productType && i.color === color && i.movement_type === 'OUT')
        .reduce((sum, i) => sum + Number(i.quantity_sqm), 0);
      const quantity = inMq - outMq;
      
      const inItems = inventory.filter(i => i.product_type === productType && i.color === color && i.movement_type === 'IN');
      const avgCost = inItems.length > 0 
        ? inItems.reduce((sum, i) => sum + Number(i.purchase_cost), 0) / inItems.length 
        : 0;
      
      let status: 'ok' | 'warning' | 'urgent' | 'critical' = 'ok';
      if (quantity <= STOCK_THRESHOLDS.critical) status = 'critical';
      else if (quantity <= STOCK_THRESHOLDS.urgent) status = 'urgent';
      else if (quantity <= STOCK_THRESHOLDS.warning) status = 'warning';
      
      return { product: productType, color, quantity, avgCost, status };
    });
  };

  // Calculate total stock by product type
  const calculateTotalStock = (productType: string) => {
    const inMq = inventory
      .filter(i => i.product_type === productType && i.movement_type === 'IN')
      .reduce((sum, i) => sum + Number(i.quantity_sqm), 0);
    const outMq = inventory
      .filter(i => i.product_type === productType && i.movement_type === 'OUT')
      .reduce((sum, i) => sum + Number(i.quantity_sqm), 0);
    return inMq - outMq;
  };

  const mgoStockByColor = calculateStockByColor('MgO', MGO_COLORS);
  const cwcStockByVariant = calculateStockByColor('CWC', CWC_VARIANTS);
  
  const mgoTotalStock = calculateTotalStock('MgO');
  const cwcTotalStock = calculateTotalStock('CWC');
  const tappetino = calculateTotalStock('Tappetino');
  const profili = calculateTotalStock('Profili');
  
  const lowStockAlerts = [...mgoStockByColor, ...cwcStockByVariant].filter(s => s.status !== 'ok' && s.quantity > 0);
  const criticalAlerts = lowStockAlerts.filter(s => s.status === 'critical');

  const getStatusBadge = (status: string, quantity: number) => {
    if (quantity <= 0) return <Badge variant="destructive">Esaurito</Badge>;
    switch (status) {
      case 'critical': return <Badge variant="destructive">Critico</Badge>;
      case 'urgent': return <Badge className="bg-orange-500">Urgente</Badge>;
      case 'warning': return <Badge className="bg-yellow-500 text-yellow-950">Riordino</Badge>;
      default: return <Badge variant="secondary">OK</Badge>;
    }
  };

  const getVariantsList = () => {
    return formData.product_type === 'MgO' ? MGO_COLORS : 
           formData.product_type === 'CWC' ? CWC_VARIANTS : [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Magazzino</h2>
          <p className="text-muted-foreground">Gestisci l'inventario per prodotto e colore</p>
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
                  <Select value={formData.product_type} onValueChange={(v) => setFormData({...formData, product_type: v, color: ''})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MgO">MgO</SelectItem>
                      <SelectItem value="CWC">CWC</SelectItem>
                      <SelectItem value="Tappetino">Tappetino</SelectItem>
                      <SelectItem value="Profili">Profili</SelectItem>
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

              {(formData.product_type === 'MgO' || formData.product_type === 'CWC') && (
                <div className="space-y-2">
                  <Label>Colore / Variante</Label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({...formData, color: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getVariantsList().map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              Avvisi Stock Basso ({lowStockAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockAlerts.map((alert, i) => (
                <div key={i} className={`px-3 py-2 rounded-lg text-sm ${
                  alert.status === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.status === 'urgent' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  <strong>Rifornire {alert.color}</strong>: {alert.quantity.toFixed(0)} mq
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('mgo')}>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Stock MgO</p>
            <p className="text-xl font-bold">{mgoTotalStock.toFixed(0)} mq</p>
            {criticalAlerts.filter(a => a.product === 'MgO').length > 0 && (
              <p className="text-[11px] text-red-600">{criticalAlerts.filter(a => a.product === 'MgO').length} colori critici</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('cwc')}>
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Stock CWC</p>
            <p className="text-xl font-bold">{cwcTotalStock.toFixed(0)} mq</p>
            {criticalAlerts.filter(a => a.product === 'CWC').length > 0 && (
              <p className="text-[11px] text-red-600">{criticalAlerts.filter(a => a.product === 'CWC').length} varianti critiche</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('tappetino')}>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Tappetino</p>
            <p className="text-xl font-bold">{tappetino.toFixed(0)} mq</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('profili')}>
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Profili</p>
            <p className="text-xl font-bold">{profili.toFixed(0)} mq</p>
          </div>
        </div>
      </div>

      {/* Detailed Stock Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mgo">MgO per Colore</TabsTrigger>
          <TabsTrigger value="cwc">CWC per Variante</TabsTrigger>
          <TabsTrigger value="tappetino">Tappetino</TabsTrigger>
          <TabsTrigger value="profili">Profili</TabsTrigger>
          <TabsTrigger value="movimenti">Tutti i Movimenti</TabsTrigger>
        </TabsList>

        <TabsContent value="mgo">
          <Card>
            <CardHeader>
              <CardTitle>Stock MgO per Colore</CardTitle>
              <CardDescription>Rimanenza in mq per ogni colorazione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mgoStockByColor.map(stock => (
                  <div key={stock.color} className={`p-4 rounded-lg border ${
                    stock.status === 'critical' ? 'border-red-500 bg-red-50' :
                    stock.status === 'urgent' ? 'border-orange-500 bg-orange-50' :
                    stock.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-border'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{stock.color}</span>
                      {getStatusBadge(stock.status, stock.quantity)}
                    </div>
                    <div className="text-2xl font-bold">{stock.quantity.toFixed(0)} mq</div>
                    <div className="text-xs text-muted-foreground">
                      Costo medio: {formatCurrency(stock.avgCost)}/mq
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cwc">
          <Card>
            <CardHeader>
              <CardTitle>Stock CWC per Variante</CardTitle>
              <CardDescription>Rimanenza in mq per ogni variante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cwcStockByVariant.map(stock => (
                  <div key={stock.color} className={`p-4 rounded-lg border ${
                    stock.status === 'critical' ? 'border-red-500 bg-red-50' :
                    stock.status === 'urgent' ? 'border-orange-500 bg-orange-50' :
                    stock.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-border'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{stock.color}</span>
                      {getStatusBadge(stock.status, stock.quantity)}
                    </div>
                    <div className="text-2xl font-bold">{stock.quantity.toFixed(0)} mq</div>
                    <div className="text-xs text-muted-foreground">
                      Costo medio: {formatCurrency(stock.avgCost)}/mq
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tappetino">
          <Card>
            <CardHeader>
              <CardTitle>Stock Tappetino</CardTitle>
              <CardDescription>Disponibilità materiale fonoassorbente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl font-bold">{tappetino.toFixed(0)} mq</div>
                <p className="text-muted-foreground mt-2">Disponibili in magazzino</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profili">
          <Card>
            <CardHeader>
              <CardTitle>Stock Profili</CardTitle>
              <CardDescription>Disponibilità profili e battiscopa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl font-bold">{profili.toFixed(0)} mq</div>
                <p className="text-muted-foreground mt-2">Disponibili in magazzino</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimenti">
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
                      <TableHead>Colore</TableHead>
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
                        <TableCell>{item.color || '-'}</TableCell>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInventory;
