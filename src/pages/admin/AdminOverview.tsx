import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, TrendingUp, Package, CreditCard, FileText, 
  AlertTriangle, Clock, ChevronRight, CalendarDays,
  Receipt, Wallet, BarChart3, Target, CheckCircle2,
  UserPlus, Handshake, ShoppingCart, Bell, Calendar
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface DashboardData {
  // Customers by status
  opportunityCustomers: number;
  signedCustomers: number; // Partners pronti ma senza ordini
  workingCustomers: number; // Clienti che hanno ordinato
  // Sales - fatturato = total_amount (con IVA)
  totalRevenue: number; // total_amount sum (fatturato)
  totalMargin: number; // margin_amount sum
  avgMargin: number;
  totalSalesMq: number;
  salesCount: number;
  // Inventory
  totalStock: number;
  lowStockCount: number;
  // Payments
  pendingPayments: number;
  overduePayments: number;
  // Quotes
  quotesCount: number;
  pendingQuotes: number;
  // Tasks & Reminders
  weeklyReminders: number;
  overdueReminders: number;
  // Debt
  debtRemaining: number;
  debtTotal: number;
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
    opportunityCustomers: 0,
    signedCustomers: 0,
    workingCustomers: 0,
    totalRevenue: 0,
    totalMargin: 0,
    avgMargin: 0,
    totalSalesMq: 0,
    salesCount: 0,
    totalStock: 0,
    lowStockCount: 0,
    pendingPayments: 0,
    overduePayments: 0,
    quotesCount: 0,
    pendingQuotes: 0,
    weeklyReminders: 0,
    overdueReminders: 0,
    debtRemaining: 0,
    debtTotal: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDataChange = useCallback(() => {
    fetchDashboardData();
  }, []);

  useRealtimeSubscription({
    tables: ['customers', 'sales', 'quotes', 'inventory', 'payment_schedules'],
    onDataChange: handleDataChange,
  });

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
        { data: payments },
        { data: reminders }
      ] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('inventory').select('*'),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('payment_schedules').select('*'),
        supabase.from('payment_agreements').select('*').maybeSingle(),
        supabase.from('supplier_payments').select('*'),
        supabase.from('customer_reminders').select('*')
      ]);

      // Customer stats by status
      const opportunityCustomers = customers?.filter(c => c.status === 'opportunity').length || 0;
      const signedCustomers = customers?.filter(c => c.status === 'signed').length || 0;
      const workingCustomers = customers?.filter(c => c.status === 'working').length || 0;

      // Sales stats - Calculate fatturato same as AdminSales: quantity_sqm * sale_price (senza IVA)
      const totalRevenue = sales?.reduce((sum, s) => sum + (Number(s.quantity_sqm || 0) * Number(s.sale_price || 0)), 0) || 0;
      const totalMargin = sales?.reduce((sum, s) => sum + Number(s.margin_amount || 0), 0) || 0;
      const totalSalesMq = sales?.reduce((sum, s) => sum + Number(s.quantity_sqm || 0), 0) || 0;
      const salesWithMargin = sales?.filter(s => Number(s.margin_percentage) > 0) || [];
      const avgMargin = salesWithMargin.length 
        ? salesWithMargin.reduce((sum, s) => sum + Number(s.margin_percentage || 0), 0) / salesWithMargin.length 
        : 0;

      // Inventory stats
      const stockIn = inventory?.filter(i => i.movement_type === 'IN').reduce((sum, i) => sum + Number(i.quantity_sqm), 0) || 0;
      const stockOut = inventory?.filter(i => i.movement_type === 'OUT').reduce((sum, i) => sum + Number(i.quantity_sqm), 0) || 0;
      const totalStock = stockIn - stockOut;
      
      // Low stock check by product/color
      const stockByProduct: Record<string, number> = {};
      inventory?.forEach(i => {
        const key = `${i.product_type}-${i.color || 'default'}`;
        if (!stockByProduct[key]) stockByProduct[key] = 0;
        if (i.movement_type === 'IN') stockByProduct[key] += Number(i.quantity_sqm);
        else stockByProduct[key] -= Number(i.quantity_sqm);
      });
      const lowStockCount = Object.values(stockByProduct).filter(v => v < 100 && v > 0).length;

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

      // Reminders this week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      const activeReminders = reminders?.filter(r => !r.is_completed) || [];
      const weeklyReminders = activeReminders.filter(r => {
        const reminderDate = new Date(r.reminder_date);
        return isWithinInterval(reminderDate, { start: weekStart, end: weekEnd });
      }).length;
      const overdueReminders = activeReminders.filter(r => new Date(r.reminder_date) < new Date()).length;

      // Recent items
      const recent: RecentItem[] = [];
      sales?.slice(0, 5).forEach(s => {
        recent.push({
          id: s.id,
          type: 'sale',
          title: s.customer_name || 'Vendita',
          subtitle: `${s.quantity_sqm} mq`,
          date: s.created_at,
          value: Number(s.subtotal_amount || 0)
        });
      });
      quotes?.slice(0, 3).forEach(q => {
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

      setData({
        opportunityCustomers,
        signedCustomers,
        workingCustomers,
        totalRevenue,
        totalMargin,
        avgMargin,
        totalSalesMq,
        salesCount: sales?.length || 0,
        totalStock,
        lowStockCount,
        pendingPayments,
        overduePayments,
        quotesCount: quotes?.length || 0,
        pendingQuotes,
        weeklyReminders,
        overdueReminders,
        debtRemaining,
        debtTotal,
      });
      setRecentItems(recent.slice(0, 8));

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

  // Small clickable KPI card
  const KPICard = ({ 
    title, 
    value, 
    subtitle,
    icon: Icon,
    iconColor = 'text-primary',
    onClick,
    badge,
    badgeVariant = 'secondary'
  }: { 
    title: string; 
    value: string | number;
    subtitle?: string;
    icon: any;
    iconColor?: string;
    onClick?: () => void;
    badge?: string | number;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }) => (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30 transition-all' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {badge !== undefined && <Badge variant={badgeVariant}>{badge}</Badge>}
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Caricamento...</div>;
  }

  const debtProgress = data.debtTotal > 0 ? ((data.debtTotal - data.debtRemaining) / data.debtTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Panoramica aziendale</p>
      </div>

      {/* CLIENTI Section */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Clienti
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Opportunity"
            value={data.opportunityCustomers}
            subtitle="Potenziali lead"
            icon={UserPlus}
            iconColor="text-orange-500"
            onClick={() => navigate('/admin/clienti?status=opportunity')}
          />
          <KPICard
            title="Signed"
            value={data.signedCustomers}
            subtitle="Partner pronti, no ordini"
            icon={Handshake}
            iconColor="text-blue-500"
            onClick={() => navigate('/admin/clienti?status=signed')}
          />
          <KPICard
            title="Working"
            value={data.workingCustomers}
            subtitle="Hanno ordinato"
            icon={ShoppingCart}
            iconColor="text-green-500"
            onClick={() => navigate('/admin/clienti?status=working')}
          />
          <KPICard
            title="Totale Clienti"
            value={data.opportunityCustomers + data.signedCustomers + data.workingCustomers}
            subtitle="Database completo"
            icon={Users}
            iconColor="text-primary"
            onClick={() => navigate('/admin/clienti')}
          />
        </div>
      </div>

      {/* VENDITE Section */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Vendite
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Fatturato"
            value={formatCurrency(data.totalRevenue)}
            subtitle="Imponibile"
            icon={TrendingUp}
            iconColor="text-green-500"
            onClick={() => navigate('/admin/vendite')}
          />
          <KPICard
            title="Margine Totale"
            value={formatCurrency(data.totalMargin)}
            subtitle={`${data.avgMargin.toFixed(1)}% medio`}
            icon={Target}
            iconColor="text-green-600"
            onClick={() => navigate('/admin/analytics')}
          />
          <KPICard
            title="Mq Venduti"
            value={`${data.totalSalesMq.toFixed(0)} mq`}
            subtitle={`${data.salesCount} vendite totali`}
            icon={BarChart3}
            iconColor="text-primary"
            onClick={() => navigate('/admin/vendite')}
          />
          <KPICard
            title="Preventivi"
            value={data.quotesCount}
            subtitle={data.pendingQuotes > 0 ? `${data.pendingQuotes} da confermare` : 'Tutti gestiti'}
            icon={FileText}
            iconColor="text-blue-500"
            badge={data.pendingQuotes > 0 ? data.pendingQuotes : undefined}
            badgeVariant="destructive"
            onClick={() => navigate('/admin/preventivi')}
          />
        </div>
      </div>

      {/* ATTIVITÀ Section */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Attività
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Task Settimana"
            value={data.weeklyReminders}
            subtitle="Promemoria questa settimana"
            icon={CalendarDays}
            iconColor="text-purple-500"
            onClick={() => navigate('/admin/clienti')}
          />
          <KPICard
            title="In Scadenza"
            value={data.overdueReminders}
            subtitle="Task scaduti"
            icon={AlertTriangle}
            iconColor={data.overdueReminders > 0 ? 'text-red-500' : 'text-green-500'}
            badge={data.overdueReminders > 0 ? '!' : undefined}
            badgeVariant="destructive"
            onClick={() => navigate('/admin/clienti')}
          />
          <KPICard
            title="Pagamenti Scaduti"
            value={data.overduePayments}
            subtitle="Da incassare"
            icon={CreditCard}
            iconColor={data.overduePayments > 0 ? 'text-red-500' : 'text-green-500'}
            badge={data.overduePayments > 0 ? '!' : undefined}
            badgeVariant="destructive"
            onClick={() => navigate('/admin/pagamenti')}
          />
          <KPICard
            title="Pagamenti Pendenti"
            value={data.pendingPayments}
            subtitle="In scadenza"
            icon={Clock}
            iconColor="text-orange-500"
            onClick={() => navigate('/admin/pagamenti')}
          />
        </div>
      </div>

      {/* MAGAZZINO & FINANZE Section */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" /> Magazzino & Finanze
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Stock Totale"
            value={`${data.totalStock.toFixed(0)} mq`}
            subtitle="Disponibile in magazzino"
            icon={Package}
            iconColor="text-blue-500"
            onClick={() => navigate('/admin/magazzino')}
          />
          <KPICard
            title="Sotto Scorta"
            value={data.lowStockCount}
            subtitle="Prodotti < 100 mq"
            icon={AlertTriangle}
            iconColor={data.lowStockCount > 0 ? 'text-orange-500' : 'text-green-500'}
            badge={data.lowStockCount > 0 ? '!' : undefined}
            badgeVariant="destructive"
            onClick={() => navigate('/admin/magazzino')}
          />
          <KPICard
            title="Costi Fissi"
            value="Gestione"
            subtitle="Stipendi, affitti, utenze"
            icon={Wallet}
            iconColor="text-purple-500"
            onClick={() => navigate('/admin/costi')}
          />
          <KPICard
            title="Analytics"
            value="Report"
            subtitle="Analisi dettagliate"
            icon={TrendingUp}
            iconColor="text-primary"
            onClick={() => navigate('/admin/analytics')}
          />
        </div>
      </div>

      {/* DEBT Progress (if exists) */}
      {data.debtTotal > 0 && (
        <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/admin/pagamenti')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accordo Pagamento Fornitore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>Pagato: {formatCurrency(data.debtTotal - data.debtRemaining)}</span>
              <span>Residuo: {formatCurrency(data.debtRemaining)}</span>
            </div>
            <Progress value={debtProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">{debtProgress.toFixed(0)}% completato</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Sidebar */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Attività Recente
        </h3>
        <Card>
          <CardContent className="p-4">
            {recentItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nessuna attività recente</p>
            ) : (
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-3 p-2 -m-2 rounded hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      if (item.type === 'sale') navigate('/admin/vendite');
                      if (item.type === 'quote') navigate('/admin/preventivi');
                    }}
                  >
                    {item.type === 'sale' && <Receipt className="w-4 h-4 text-green-500 shrink-0" />}
                    {item.type === 'quote' && <FileText className="w-4 h-4 text-blue-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {item.value !== undefined && <p className="text-sm font-medium">{formatCurrency(item.value)}</p>}
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
