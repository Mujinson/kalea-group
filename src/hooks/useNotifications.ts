import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setItems((data as any) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) load(); }, [user, load]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as AppNotification;
          setItems((prev) => [n, ...prev]);
          toast(n.title, { description: n.body || undefined });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const unreadCount = items.filter((n) => !n.read_at).length;

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const unread = items.filter((n) => !n.read_at).map((n) => n.id);
    if (unread.length === 0) return;
    await supabase
      .from('notifications' as any)
      .update({ read_at: new Date().toISOString() })
      .in('id', unread);
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })));
  }, [items, user]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from('notifications' as any).update({ read_at: new Date().toISOString() }).eq('id', id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
  }, []);

  return { items, loading, unreadCount, markAllRead, markRead, reload: load };
};
