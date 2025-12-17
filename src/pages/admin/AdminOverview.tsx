import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, TrendingUp, Package, CreditCard, FileText, 
  AlertTriangle, Clock, ChevronRight, CalendarDays,
  Receipt, Wallet, BarChart3, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DashboardData {
  // Customers
  totalCustomers: number;
  opportunityCustomers: number;
  signedCustomers: number;
  workingCustomers: number;
  // Performance
  totalRevenue: number;
  avgMargin: number;
  totalSalesMq: number;
  // Inventory
  totalStock: number;
  lowStockProducts: number;
  // Payments
  pendingPayments: number;
  overduePayments: number;
  debtRemaining: number;
  debtTotal: number;
  // Activity
  recentSalesCount: number;
  recentQuotesCount: number;
  pendingQuotes: number;
}

interface RecentItem {
  id: string;
  type: 'sale' | 'quote' | 'customer';
  title: string;
  subtitle: string;
  date: string;
  value?: number;
}

const AdminOverview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    totalCustomers: 0,
    opportunityCustomers: 0,
    signedCustomers: 0,
    workingCustomers: 0,
    totalRevenue: 0,
    avgMargin: 0,
    totalSalesMq: 0,
    totalStock: 0,
    lowStockProducts: 0,
    pendingPayments: 0,
    overduePayments: 0,
    debtRemaining: 0,
    debtTotal: 0,
    recentSalesCount: 0,
    recentQuotesCount: 0,
    pendingQuotes: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [alerts, setAlerts] = useState<{ type: string; message: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        { data: customers },
        { data: sales },
        { data: inventory },
        { data: quotes },
        { data: paymentSchedules },
        { data: agreement },
        { data: payments }
      ] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('inventory').select('*'),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('payment_schedules').select('*'),
        supabase.from('payment_agreements').select('*').maybeSingle(),
        supabase.from('supplier_payments').select('*')
      ]);

      // Customer stats
      const opportunityCustomers = customers?.filter(c => c.status === 'opportunity').length || 0;
      const signedCustomers = customers?.filter(c => c.status === 'signed').length || 0;
      const workingCustomers = customers?.filter(c => c.status === 'working').length || 0;

      // Sales stats
      const totalRevenue = sales?.reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;
      const totalSalesMq = sales?.reduce((sum, s) => sum + Number(s.quantity_sqm || 0), 0) || 0;
      const avgMargin = sales?.length 
        ? sales.reduce((sum, s) => sum + Number(s.margin_percentage || 0), 0) / sales.length 
        : 0;

      // Inventory stats
      const stockIn = inventory?.filter(i => i.movement_type === 'IN').reduce((sum, i) => sum + Number(i.quantity_sqm), 0) || 0;
      const stockOut = inventory?.filter(i => i.movement_type === 'OUT').reduce((sum, i) => sum + Number(i.quantity_sqm), 0) || 0;
      const totalStock = stockIn - stockOut;
      
      // Low stock check (simplified)
      const lowStockProducts = 0; // Will implement proper check

      // Payment stats
      const today = new Date().toISOString().split('T')[0];
      const pendingPayments = paymentSchedules?.filter(p => !p.is_paid && p.due_date >= today).length || 0;
      const overduePayments = paymentSchedules?.filter(p => !p.is_paid && p.due_date < today).length || 0;

      // Debt stats
      const totalPaid = payments?.reduce((sum, p) => sum + Number(p.payment_amount), 0) || 0;
      const debtTotal = agreement?.total_amount || 0;
      const debtRemaining = Math.max(0, debtTotal - totalPaid);

      // Quote stats
      const pendingQuotes = quotes?.filter(q => q.status === 'inviato').length || 0;

      // Recent items
      const recent: RecentItem[] = [];
      
      sales?.slice(0, 5).forEach(s => {
        recent.push({
          id: s.id,
          type: 'sale',
          title: s.customer_name || 'Vendita',
          subtitle: `${s.quantity_sqm} mq - ${s.product_type}`,
          date: s.created_at,
          value: Number(s.total_amount || 0)
        });
      });

      quotes?.slice(0, 5).forEach(q => {
        recent.push({
          id: q.id,
          type: 'quote',
          title: q.quote_number || 'Preventivo',
          subtitle: q.status,
          date: q.created_at,
          value: Number(q.total_amount || 0)
        });
      });

      recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Build alerts
      const alertsList: { type: string; message: string; count: number }[] = [];
      if (overduePayments > 0) {
        alertsList.push({ type: 'error', message: 'Pagamenti scaduti', count: overduePayments });
      }
      if (pendingPayments > 0) {
        alertsList.push({ type: 'warning', message: 'Pagamenti in scadenza', count: pendingPayments });
      }
      if (pendingQuotes > 0) {
        alertsList.push({ type: 'info', message: 'Preventivi da confermare', count: pendingQuotes });
      }

      setData({
        totalCustomers: customers?.length || 0,
        opportunityCustomers,
        signedCustomers,
        workingCustomers,
        totalRevenue,
        avgMargin,
        totalSalesMq,
        totalStock,
        lowStockProducts,
        pendingPayments,
        overduePayments,
        debtRemaining,
        debtTotal,
        recentSalesCount: sales?.length || 0,
        recentQuotesCount: quotes?.length || 0,
        pendingQuotes,
      });
      setRecentItems(recent.slice(0, 10));
      setAlerts(alertsList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM HH:mm', { locale: it });
  };

  // Clickable card component
  const DashboardCard = ({ 
    title, 
    onClick, 
    children,
    className = ''
  }: { 
    title: string; 
    onClick?: () => void; 
    children: React.ReactNode;
    className?: string;
  }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {title}
          </CardTitle>
          {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  // Stat row for list items
  const StatRow = ({ 
    label, 
    value, 
    color = 'primary',
    onClick
  }: { 
    label: string; 
    value: number | string;
    color?: 'primary' | 'green' | 'orange' | 'red';
    onClick?: () => void;
  }) => {
    const colorClasses = {
      primary: 'text-primary',
      green: 'text-green-600',
      orange: 'text-orange-500',
      red: 'text-red-500'
    };
    
    return (
      <div 
        className={`flex justify-between items-center py-1 ${onClick ? 'cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded' : ''}`}
        onClick={onClick}
      >
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`font-semibold ${colorClasses[color]}`}>{value}</span>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Caricamento...</div>;
  }

  const debtProgress = data.debtTotal > 0 ? ((data.debtTotal - data.debtRemaining) / data.debtTotal) * 100 : 0;

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Panoramica aziendale</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CLIENTI Section */}
          <DashboardCard title="Clienti" onClick={() => navigate('/admin/clienti')}>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">{data.totalCustomers}</span>
                </div>
                <Badge variant="outline">Totale</Badge>
              </div>
              <StatRow 
                label="Opportunity" 
                value={data.opportunityCustomers} 
                color="orange"
                onClick={() => navigate('/admin/clienti?status=opportunity')}
              />
              <StatRow 
                label="Signed" 
                value={data.signedCustomers} 
                color="green"
                onClick={() => navigate('/admin/clienti?status=signed')}
              />
              <StatRow 
                label="Working" 
                value={data.workingCustomers} 
                color="primary"
                onClick={() => navigate('/admin/clienti?status=working')}
              />
            </div>
          </DashboardCard>

          {/* VENDITE Section */}
          <DashboardCard title="Vendite" onClick={() => navigate('/admin/vendite')}>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">{data.recentSalesCount}</span>
                </div>
                <Badge variant="outline">Totale</Badge>
              </div>
              <StatRow label="Fatturato" value={formatCurrency(data.totalRevenue)} color="green" />
              <StatRow label="Mq venduti" value={`${data.totalSalesMq.toFixed(0)} mq`} />
              <StatRow label="Margine medio" value={`${data.avgMargin.toFixed(1)}%`} color="green" />
            </div>
          </DashboardCard>

          {/* PREVENTIVI Section */}
          <DashboardCard title="Preventivi" onClick={() => navigate('/admin/preventivi')}>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">{data.recentQuotesCount}</span>
                </div>
                <Badge variant="outline">Totale</Badge>
              </div>
              <StatRow 
                label="Da confermare" 
                value={data.pendingQuotes} 
                color={data.pendingQuotes > 0 ? 'orange' : 'primary'}
              />
            </div>
          </DashboardCard>

          {/* MAGAZZINO Section */}
          <DashboardCard title="Magazzino" onClick={() => navigate('/admin/magazzino')}>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-500">{data.totalStock.toFixed(0)} mq</span>
                </div>
                <Badge variant="outline">Stock</Badge>
              </div>
              <StatRow 
                label="Prodotti sotto scorta" 
                value={data.lowStockProducts} 
                color={data.lowStockProducts > 0 ? 'red' : 'green'}
              />
            </div>
          </DashboardCard>

          {/* PAGAMENTI Section */}
          <DashboardCard title="Pagamenti" onClick={() => navigate('/admin/pagamenti')}>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">Scadenze</span>
                </div>
              </div>
              <StatRow 
                label="Pagamenti scaduti" 
                value={data.overduePayments} 
                color={data.overduePayments > 0 ? 'red' : 'green'}
              />
              <StatRow 
                label="In scadenza" 
                value={data.pendingPayments} 
                color={data.pendingPayments > 0 ? 'orange' : 'green'}
              />
            </div>
          </DashboardCard>

          {/* COSTI Section */}
          <DashboardCard title="Costi & Finanze" onClick={() => navigate('/admin/costi')}>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Gestione costi</span>
                </div>
              </div>
              {data.debtTotal > 0 && (
                <>
                  <StatRow label="Debito residuo" value={formatCurrency(data.debtRemaining)} color="orange" />
                  <div className="mt-2">
                    <Progress value={debtProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{debtProgress.toFixed(0)}% saldato</p>
                  </div>
                </>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Analytics Link */}
        <DashboardCard 
          title="Analisi Avanzata" 
          onClick={() => navigate('/admin/analytics')}
          className="bg-gradient-to-r from-primary/5 to-primary/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">Report e statistiche dettagliate</p>
                <p className="text-sm text-muted-foreground">Margini, trend, analisi per cliente e prodotto</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </div>
        </DashboardCard>
      </div>

      {/* Right Sidebar - Alerts & Recent */}
      <div className="w-80 space-y-6 hidden xl:block">
        
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Attenzione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`flex justify-between items-center p-2 rounded-md ${
                    alert.type === 'error' ? 'bg-red-50 dark:bg-red-950/20' :
                    alert.type === 'warning' ? 'bg-orange-50 dark:bg-orange-950/20' :
                    'bg-blue-50 dark:bg-blue-950/20'
                  }`}
                >
                  <span className="text-sm">{alert.message}</span>
                  <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                    {alert.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Attività recente
              </CardTitle>
              <Badge variant="outline">Oggi</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
            {recentItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nessuna attività recente
              </p>
            ) : (
              recentItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-start gap-3 py-2 px-2 -mx-2 rounded hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    if (item.type === 'sale') navigate('/admin/vendite');
                    if (item.type === 'quote') navigate('/admin/preventivi');
                  }}
                >
                  <div className="mt-0.5">
                    {item.type === 'sale' && <Receipt className="w-4 h-4 text-green-500" />}
                    {item.type === 'quote' && <FileText className="w-4 h-4 text-blue-500" />}
                    {item.type === 'customer' && <Users className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    {item.value && (
                      <p className="text-xs font-medium">{formatCurrency(item.value)}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
