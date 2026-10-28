import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = keyof import('@/integrations/supabase/types').Database['public']['Tables'];

interface UseRealtimeSubscriptionOptions {
  tables: TableName[];
  onDataChange: () => void;
}

export const useRealtimeSubscription = ({ tables, onDataChange }: UseRealtimeSubscriptionOptions) => {
  useEffect(() => {
    const channel = supabase.channel(`crm-realtime-sync-${crypto.randomUUID()}`);

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`Realtime update on ${table}:`, payload.eventType);
          onDataChange();
        }
      );
    });

    channel.subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables, onDataChange]);
};
