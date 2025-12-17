import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  'cliente_privato': 'Privato',
  'rivenditore': 'Rivenditore',
  'costruttore': 'Costruttore',
  'posatore': 'Posatore',
  'architetto': 'Architetto',
  'interior_designer': 'Interior Designer',
  'showroom': 'Showroom',
  'studio_design': 'Studio Design',
  'azienda_pubblica': 'Azienda Pubblica',
};

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
  sale_date: string;
}

interface Customer {
  id: string;
  customer_type: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface StaticCost {
  product_type: string;
  fob_cost: number;
  import_logistics_cost: number;
  duty_percentage: number;
  vat_percentage: number;
}

const AdminAnalytics = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [costs, setCosts] = useState<StaticCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  const handleDataChange = useCallback(() => {
    fetchData();
  }, []);

  useRealtimeSubscription({
    tables: ['sales', 'customers'],
    onDataChange: handleDataChange,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, customersRes, costsRes] = await Promise.all([
        supabase.from('sales').select('*').order('sale_date', { ascending: false }),
        supabase.from('customers').select('id, customer_type, company_name, first_name, last_name'),
        supabase.from('static_costs').select('*'),
      ]);

      if (salesRes.error) throw salesRes.error;
      if (customersRes.error) throw customersRes.error;

      setSales(salesRes.data || []);
      setCustomers(customersRes.data || []);
      setCosts(costsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Filter sales by period
  const getFilteredSales = () => {
    if (period === 'all') return sales;
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'quarter':
        startDate = startOfMonth(subMonths(now, 2));
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return sales;
    }
    
    return sales.filter(s => new Date(s.sale_date) >= startDate);
  };

  const filteredSales = getFilteredSales();

  // Get cost for a product
  const getCostForProduct = (productType: string) => {
    const cost = costs.find(c => c.product_type === productType);
    if (!cost) return 15.49; // Default
    return Number(cost.fob_cost) + Number(cost.import_logistics_cost);
  };

  // Calculate margin for a sale
  const calculateMargin = (sale: Sale) => {
    const cost = getCostForProduct(sale.product_type);
    const revenue = Number(sale.quantity_sqm) * Number(sale.sale_price);
    const totalCost = Number(sale.quantity_sqm) * cost;
    return revenue - totalCost;
  };

  const calculateMarginPercent = (sale: Sale) => {
    const revenue = Number(sale.quantity_sqm) * Number(sale.sale_price);
    if (revenue === 0) return 0;
    return (calculateMargin(sale) / revenue) * 100;
  };

  // Summary calculations
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0);
  const totalCost = filteredSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * getCostForProduct(s.product_type)), 0);
  const totalMargin = totalRevenue - totalCost;
  const avgMarginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  const totalMq = filteredSales.reduce((sum, s) => sum + Number(s.quantity_sqm), 0);

  // Margin by product
  const marginByProduct = ['MgO', 'CWC'].map(product => {
    const productSales = filteredSales.filter(s => s.product_type === product);
    const revenue = productSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0);
    const cost = productSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * getCostForProduct(s.product_type)), 0);
    const margin = revenue - cost;
    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;
    const qty = productSales.reduce((sum, s) => sum + Number(s.quantity_sqm), 0);
    return { product, revenue, cost, margin, marginPercent, qty };
  });

  // Margin by channel
  const marginByChannel = ['B2B', 'B2C'].map(channel => {
    const channelSales = filteredSales.filter(s => s.channel === channel);
    const revenue = channelSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0);
    const cost = channelSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * getCostForProduct(s.product_type)), 0);
    const margin = revenue - cost;
    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;
    return { channel, revenue, cost, margin, marginPercent };
  });

  // Margin by customer type
  const marginByCustomerType = Object.keys(CUSTOMER_TYPE_LABELS).map(type => {
    const typeCustomers = customers.filter(c => c.customer_type === type);
    const customerIds = typeCustomers.map(c => c.id);
    const typeSales = filteredSales.filter(s => s.customer_id && customerIds.includes(s.customer_id));
    const revenue = typeSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0);
    const cost = typeSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * getCostForProduct(s.product_type)), 0);
    const margin = revenue - cost;
    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;
    return { type, label: CUSTOMER_TYPE_LABELS[type], revenue, cost, margin, marginPercent, count: typeSales.length };
  }).filter(t => t.revenue > 0).sort((a, b) => b.margin - a.margin);

  // Top customers by margin
  const topCustomersByMargin = [...new Set(filteredSales.filter(s => s.customer_id).map(s => s.customer_id))]
    .map(customerId => {
      const customer = customers.find(c => c.id === customerId);
      const customerSales = filteredSales.filter(s => s.customer_id === customerId);
      const revenue = customerSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0);
      const cost = customerSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * getCostForProduct(s.product_type)), 0);
      const margin = revenue - cost;
      const name = customer?.company_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Cliente';
      return { customerId, name, revenue, margin, salesCount: customerSales.length };
    })
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);

  // Monthly trend
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(new Date().getFullYear(), i, 1);
    const monthSales = sales.filter(s => {
      const saleDate = new Date(s.sale_date);
      return saleDate.getMonth() === i && saleDate.getFullYear() === new Date().getFullYear();
    });
    const revenue = monthSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * Number(s.sale_price)), 0);
    const cost = monthSales.reduce((sum, s) => sum + (Number(s.quantity_sqm) * getCostForProduct(s.product_type)), 0);
    const margin = revenue - cost;
    return {
      month: format(monthDate, 'MMM', { locale: it }),
      revenue,
      cost,
      margin,
    };
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analisi & Marginalità</h2>
          <p className="text-muted-foreground">Analizza margini, ricavi e performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutto il periodo</SelectItem>
            <SelectItem value="month">Mese corrente</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Anno corrente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Totale</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{totalMq.toFixed(0)} mq venduti</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Costi Totali</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">COGS prodotti</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margine Lordo</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalMargin)}</div>
            <p className="text-xs text-muted-foreground">Guadagno periodo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">% Margine Medio</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgMarginPercent >= 40 ? 'text-green-600' : avgMarginPercent >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
              {avgMarginPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Target: 40%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Andamento Mensile</CardTitle>
            <CardDescription>Ricavi vs Costi vs Margine</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" name="Ricavi" fill="hsl(var(--primary))" />
                <Bar dataKey="cost" name="Costi" fill="hsl(var(--muted))" />
                <Bar dataKey="margin" name="Margine" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Margin by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Margine per Canale</CardTitle>
            <CardDescription>B2B vs B2C</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marginByChannel.map((channel, i) => (
                <div key={channel.channel} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{channel.channel}</span>
                    <span className={`text-xl font-bold ${channel.marginPercent >= 40 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {channel.marginPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ricavi</p>
                      <p className="font-medium">{formatCurrency(channel.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Costi</p>
                      <p className="font-medium">{formatCurrency(channel.cost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Margine</p>
                      <p className="font-medium text-green-600">{formatCurrency(channel.margin)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="product">
        <TabsList>
          <TabsTrigger value="product">Per Prodotto</TabsTrigger>
          <TabsTrigger value="customer-type">Per Categoria Cliente</TabsTrigger>
          <TabsTrigger value="top-customers">Top Clienti</TabsTrigger>
          <TabsTrigger value="sales-detail">Dettaglio Vendite</TabsTrigger>
        </TabsList>

        <TabsContent value="product">
          <Card>
            <CardHeader>
              <CardTitle>Margine per Prodotto</CardTitle>
              <CardDescription>Analisi marginalità MgO e CWC</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prodotto</TableHead>
                    <TableHead className="text-right">Quantità</TableHead>
                    <TableHead className="text-right">Ricavi</TableHead>
                    <TableHead className="text-right">Costi</TableHead>
                    <TableHead className="text-right">Margine</TableHead>
                    <TableHead className="text-right">% Margine</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marginByProduct.map(p => (
                    <TableRow key={p.product}>
                      <TableCell className="font-medium">{p.product}</TableCell>
                      <TableCell className="text-right">{p.qty.toFixed(0)} mq</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.cost)}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">{formatCurrency(p.margin)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${p.marginPercent >= 40 ? 'text-green-600' : p.marginPercent >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {p.marginPercent.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer-type">
          <Card>
            <CardHeader>
              <CardTitle>Margine per Categoria Cliente</CardTitle>
              <CardDescription>Performance per tipologia cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {marginByCustomerType.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nessun dato disponibile</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Vendite</TableHead>
                      <TableHead className="text-right">Ricavi</TableHead>
                      <TableHead className="text-right">Margine</TableHead>
                      <TableHead className="text-right">% Margine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marginByCustomerType.map(t => (
                      <TableRow key={t.type}>
                        <TableCell className="font-medium">{t.label}</TableCell>
                        <TableCell className="text-right">{t.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(t.revenue)}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">{formatCurrency(t.margin)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${t.marginPercent >= 40 ? 'text-green-600' : t.marginPercent >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {t.marginPercent.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-customers">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Clienti per Margine</CardTitle>
              <CardDescription>I clienti più profittevoli</CardDescription>
            </CardHeader>
            <CardContent>
              {topCustomersByMargin.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nessun dato disponibile</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Vendite</TableHead>
                      <TableHead className="text-right">Ricavi</TableHead>
                      <TableHead className="text-right">Margine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomersByMargin.map((c, i) => (
                      <TableRow key={c.customerId}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell className="text-right">{c.salesCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.revenue)}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">{formatCurrency(c.margin)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales-detail">
          <Card>
            <CardHeader>
              <CardTitle>Dettaglio Vendite con Margine</CardTitle>
              <CardDescription>Margine netto per singola vendita</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Prodotto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Quantità</TableHead>
                    <TableHead className="text-right">Ricavo</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Margine</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.slice(0, 20).map(sale => {
                    const revenue = Number(sale.quantity_sqm) * Number(sale.sale_price);
                    const cost = Number(sale.quantity_sqm) * getCostForProduct(sale.product_type);
                    const margin = revenue - cost;
                    const marginPercent = calculateMarginPercent(sale);
                    return (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.sale_date), 'dd/MM/yy')}</TableCell>
                        <TableCell>
                          {sale.product_type}
                          {sale.color && <span className="text-muted-foreground ml-1">({sale.color})</span>}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{sale.customer_name || '-'}</TableCell>
                        <TableCell className="text-right">{Number(sale.quantity_sqm).toFixed(0)} mq</TableCell>
                        <TableCell className="text-right">{formatCurrency(revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(cost)}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">{formatCurrency(margin)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${marginPercent >= 40 ? 'text-green-600' : marginPercent >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {marginPercent.toFixed(0)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
