import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Clock, Package, DollarSign, Check } from 'lucide-react';
import { format, differenceInDays, isPast, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'payment_due' | 'payment_overdue' | 'low_stock' | 'critical_stock';
  title: string;
  message: string;
  date?: string;
  severity: 'info' | 'warning' | 'critical';
  data?: any;
}

interface PaymentSchedule {
  id: string;
  sale_id: string;
  amount: number;
  due_date: string;
  is_paid: boolean;
  payment_type: string | null;
  sales?: {
    customer_name: string | null;
  };
}

interface InventoryItem {
  id: string;
  product_type: string;
  color: string | null;
  quantity_sqm: number;
  movement_type: string;
}

const STOCK_THRESHOLDS = {
  critical: 50,
  urgent: 100,
  warning: 150,
};

const MGO_COLORS = ['Aurora', 'Corteccia', 'Sabbia', 'Terram', 'Velora', 'Perla', 'Silven', 'Cenere'];
const CWC_VARIANTS = ['CWC n.1', 'CWC n.2', 'CWC n.3', 'CWC n.4', 'CWC n.5', 'CWC n.6', 'CWC n.7'];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [schedulesRes, inventoryRes] = await Promise.all([
        supabase
          .from('payment_schedules')
          .select('*, sales(customer_name)')
          .eq('is_paid', false),
        supabase.from('inventory').select('*'),
      ]);

      const newNotifications: Notification[] = [];

      // Payment notifications
      if (schedulesRes.data) {
        schedulesRes.data.forEach((schedule: any) => {
          const dueDate = new Date(schedule.due_date);
          const daysUntilDue = differenceInDays(dueDate, new Date());
          const customerName = schedule.sales?.customer_name || 'Cliente';

          if (isPast(dueDate)) {
            newNotifications.push({
              id: `payment-overdue-${schedule.id}`,
              type: 'payment_overdue',
              title: 'Pagamento scaduto',
              message: `${customerName}: €${Number(schedule.amount).toLocaleString('it-IT')} scaduto da ${Math.abs(daysUntilDue)} giorni`,
              date: schedule.due_date,
              severity: 'critical',
              data: schedule,
            });
          } else if (daysUntilDue <= 7) {
            newNotifications.push({
              id: `payment-due-${schedule.id}`,
              type: 'payment_due',
              title: 'Scadenza imminente',
              message: `${customerName}: €${Number(schedule.amount).toLocaleString('it-IT')} entro ${daysUntilDue} giorni`,
              date: schedule.due_date,
              severity: daysUntilDue <= 3 ? 'warning' : 'info',
              data: schedule,
            });
          }
        });
      }

      // Stock notifications
      if (inventoryRes.data) {
        const inventory = inventoryRes.data;
        
        const calculateStock = (productType: string, color: string) => {
          const inMq = inventory
            .filter(i => i.product_type === productType && i.color === color && i.movement_type === 'IN')
            .reduce((sum, i) => sum + Number(i.quantity_sqm), 0);
          const outMq = inventory
            .filter(i => i.product_type === productType && i.color === color && i.movement_type === 'OUT')
            .reduce((sum, i) => sum + Number(i.quantity_sqm), 0);
          return inMq - outMq;
        };

        // Check MgO colors
        MGO_COLORS.forEach(color => {
          const stock = calculateStock('MgO', color);
          if (stock <= STOCK_THRESHOLDS.critical && stock > 0) {
            newNotifications.push({
              id: `stock-critical-mgo-${color}`,
              type: 'critical_stock',
              title: 'Stock critico',
              message: `Rifornire ${color}: solo ${stock.toFixed(0)} mq`,
              severity: 'critical',
              data: { product: 'MgO', color, stock },
            });
          } else if (stock <= STOCK_THRESHOLDS.urgent) {
            newNotifications.push({
              id: `stock-low-mgo-${color}`,
              type: 'low_stock',
              title: 'Stock basso',
              message: `${color}: ${stock.toFixed(0)} mq rimanenti`,
              severity: stock <= STOCK_THRESHOLDS.critical ? 'critical' : 'warning',
              data: { product: 'MgO', color, stock },
            });
          }
        });

        // Check CWC variants
        CWC_VARIANTS.forEach(variant => {
          const stock = calculateStock('CWC', variant);
          if (stock <= STOCK_THRESHOLDS.critical && stock > 0) {
            newNotifications.push({
              id: `stock-critical-cwc-${variant}`,
              type: 'critical_stock',
              title: 'Stock critico',
              message: `Rifornire ${variant}: solo ${stock.toFixed(0)} mq`,
              severity: 'critical',
              data: { product: 'CWC', color: variant, stock },
            });
          } else if (stock <= STOCK_THRESHOLDS.urgent) {
            newNotifications.push({
              id: `stock-low-cwc-${variant}`,
              type: 'low_stock',
              title: 'Stock basso',
              message: `${variant}: ${stock.toFixed(0)} mq rimanenti`,
              severity: stock <= STOCK_THRESHOLDS.critical ? 'critical' : 'warning',
              data: { product: 'CWC', color: variant, stock },
            });
          }
        });
      }

      // Sort by severity
      newNotifications.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markPaymentAsPaid = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('payment_schedules')
        .update({ is_paid: true, paid_date: format(new Date(), 'yyyy-MM-dd') })
        .eq('id', scheduleId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
    }
  };

  const criticalCount = notifications.filter(n => n.severity === 'critical').length;
  const warningCount = notifications.filter(n => n.severity === 'warning').length;
  const totalCount = notifications.length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment_due':
      case 'payment_overdue':
        return <DollarSign className="w-4 h-4" />;
      case 'low_stock':
      case 'critical_stock':
        return <Package className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white ${
              criticalCount > 0 ? 'bg-red-500' : 'bg-orange-500'
            }`}>
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Notifiche</h4>
          <p className="text-sm text-muted-foreground">
            {criticalCount > 0 && <span className="text-red-600">{criticalCount} critiche</span>}
            {criticalCount > 0 && warningCount > 0 && ' · '}
            {warningCount > 0 && <span className="text-orange-600">{warningCount} avvisi</span>}
            {totalCount === 0 && 'Nessuna notifica'}
          </p>
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Caricamento...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p>Tutto in ordine!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 ${getSeverityColor(notification.severity)} border-l-4`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm mt-1">{notification.message}</p>
                      {notification.date && (
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(notification.date), 'dd MMM yyyy', { locale: it })}
                        </p>
                      )}
                    </div>
                    {(notification.type === 'payment_due' || notification.type === 'payment_overdue') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markPaymentAsPaid(notification.data.id)}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
