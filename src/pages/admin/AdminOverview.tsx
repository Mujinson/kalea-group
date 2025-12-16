import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Package, DollarSign, CreditCard, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface KPIData {
  totalSales: number;
  totalRevenue: number;
  avgMargin: number;
  totalStock: number;
  stockValue: number;
  debtRemaining: number;
  debtTotal: number;
  daysRemaining: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

const AdminOverview = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalSales: 0,
    totalRevenue: 0,
    avgMargin: 0,
    totalStock: 0,
    stockValue: 0,
    debtRemaining: 0,
    debtTotal: 89100,
    daysRemaining: 365,
  });
  const [salesByChannel, setSalesByChannel] = useState<{ name: string; value: number }[]>([]);
  const [salesByMonth, setSalesByMonth] = useState<{ month: string; mq: number; revenue: number }[]>([]);
  const [stockByProduct, setStockByProduct] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch sales data
      const { data: sales } = await supabase.from('sales').select('*');
      
      // Fetch inventory data
      const { data: inventory } = await supabase.from('inventory').select('*');
      
      // Fetch static costs
      const { data: costs } = await supabase.from('static_costs').select('*');
      
      // Fetch payments
      const { data: payments } = await supabase.from('supplier_payments').select('*');
      
      // Fetch payment agreement
      const { data: agreement } = await supabase.from('payment_agreements').select('*').maybeSingle();

      // Calculate KPIs
      const totalSalesMq = sales?.reduce((sum, s) => sum + Number(s.quantity_sqm), 0) || 0;
      const totalRevenue = sales?.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0) || 0;
      
      // Calculate stock
      const stockIn = inventory?.filter(i => i.movement_type === 'IN').reduce((sum, i) => sum + Number(i.quantity_sqm), 0) || 0;
      const stockOut = inventory?.filter(i => i.movement_type === 'OUT').reduce((sum, i) => sum + Number(i.quantity_sqm), 0) || 0;
      const currentStock = stockIn - stockOut;
      
      // Calculate stock value
      const avgPurchaseCost = inventory?.length 
        ? inventory.filter(i => i.movement_type === 'IN').reduce((sum, i) => sum + Number(i.purchase_cost), 0) / inventory.filter(i => i.movement_type === 'IN').length 
        : 0;
      const stockValue = currentStock * avgPurchaseCost;

      // Calculate margin
      const avgCost = costs?.length 
        ? costs.reduce((sum, c) => sum + Number(c.fob_cost) + Number(c.import_logistics_cost), 0) / costs.length 
        : 15.49;
      const avgSalePrice = sales?.length 
        ? totalRevenue / totalSalesMq 
        : 0;
      const avgMargin = avgSalePrice > 0 ? ((avgSalePrice - avgCost) / avgSalePrice) * 100 : 0;

      // Calculate debt
      const totalPaid = payments?.reduce((sum, p) => sum + Number(p.payment_amount), 0) || 0;
      const debtTotal = agreement?.total_amount || 89100;
      const debtRemaining = debtTotal - totalPaid;
      
      // Calculate days remaining
      let daysRemaining = 365;
      if (agreement?.end_date) {
        const endDate = new Date(agreement.end_date);
        const today = new Date();
        daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      }

      setKpiData({
        totalSales: totalSalesMq,
        totalRevenue,
        avgMargin,
        totalStock: currentStock,
        stockValue,
        debtRemaining,
        debtTotal,
        daysRemaining,
      });

      // Sales by channel
      const b2bSales = sales?.filter(s => s.channel === 'B2B').reduce((sum, s) => sum + Number(s.quantity_sqm), 0) || 0;
      const b2cSales = sales?.filter(s => s.channel === 'B2C').reduce((sum, s) => sum + Number(s.quantity_sqm), 0) || 0;
      setSalesByChannel([
        { name: 'B2B', value: b2bSales },
        { name: 'B2C', value: b2cSales },
      ]);

      // Stock by product
      const mgoStock = inventory?.filter(i => i.product_type === 'MgO' && i.movement_type === 'IN').reduce((sum, i) => sum + Number(i.quantity_sqm), 0) || 0;
      const cwcStock = inventory?.filter(i => i.product_type === 'CWC' && i.movement_type === 'IN').reduce((sum, i) => sum + Number(i.quantity_sqm), 0) || 0;
      setStockByProduct([
        { name: 'MgO', value: mgoStock },
        { name: 'CWC', value: cwcStock },
      ]);

      // Sales by month (mock data for now)
      const monthlyData = generateMonthlyData(sales || []);
      setSalesByMonth(monthlyData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (sales: any[]) => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthSales = sales.filter(s => {
        const saleMonth = new Date(s.sale_date).getMonth();
        return saleMonth === index;
      });
      
      return {
        month,
        mq: monthSales.reduce((sum, s) => sum + Number(s.quantity_sqm), 0),
        revenue: monthSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0),
      };
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const debtProgress = ((kpiData.debtTotal - kpiData.debtRemaining) / kpiData.debtTotal) * 100;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitoraggio in tempo reale delle performance aziendali</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margine Lordo Medio</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Target: 40%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendite Totali</CardTitle>
            <BarChart3 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalSales.toFixed(0)} mq</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(kpiData.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Magazzino</CardTitle>
            <Package className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalStock.toFixed(0)} mq</div>
            <p className="text-xs text-muted-foreground">Valore: {formatCurrency(kpiData.stockValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Debito Residuo</CardTitle>
            <CreditCard className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.debtRemaining)}</div>
            <p className="text-xs text-muted-foreground">{kpiData.daysRemaining} giorni rimanenti</p>
          </CardContent>
        </Card>
      </div>

      {/* Debt Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stato Accordo Pagamento</CardTitle>
          <CardDescription>Fornitore Terni - Totale: {formatCurrency(kpiData.debtTotal)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pagato: {formatCurrency(kpiData.debtTotal - kpiData.debtRemaining)}</span>
              <span>Residuo: {formatCurrency(kpiData.debtRemaining)}</span>
            </div>
            <Progress value={debtProgress} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {debtProgress.toFixed(1)}% completato - {kpiData.daysRemaining} giorni alla scadenza
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Andamento Vendite</CardTitle>
            <CardDescription>Metri quadri venduti per mese</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} mq`, 'Vendite']} />
                <Line type="monotone" dataKey="mq" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendite per Canale</CardTitle>
            <CardDescription>Distribuzione B2B vs B2C</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByChannel}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value} mq`}
                >
                  {salesByChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} mq`, 'Vendite']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock by Product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Composizione Magazzino</CardTitle>
            <CardDescription>Stock per tipo di prodotto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} mq`, 'Stock']} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Margin by Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analisi Margini</CardTitle>
            <CardDescription>Margine lordo per canale di vendita</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Canale B2B</p>
                  <p className="text-sm text-muted-foreground">Prezzo medio: €24-28/mq</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">35-45%</p>
                  <p className="text-xs text-muted-foreground">Margine stimato</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Canale B2C</p>
                  <p className="text-sm text-muted-foreground">Prezzo medio: €40/mq</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">55-60%</p>
                  <p className="text-xs text-muted-foreground">Margine stimato</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
