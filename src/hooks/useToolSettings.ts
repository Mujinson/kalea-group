import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useToolSettings<T extends Record<string, any>>(
  toolKey: string,
  defaults: T,
) {
  const [settings, setSettings] = useState<T>(defaults);
  const [loaded, setLoaded] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      userIdRef.current = uid;
      if (!uid) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from('tool_settings')
        .select('settings')
        .eq('user_id', uid)
        .eq('tool_key', toolKey)
        .maybeSingle();
      if (!cancelled) {
        if (data?.settings) {
          setSettings({ ...defaults, ...(data.settings as T) });
        }
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolKey]);

  const update = (patch: Partial<T>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const uid = userIdRef.current;
        if (!uid) return;
        supabase
          .from('tool_settings')
          .upsert(
            { user_id: uid, tool_key: toolKey, settings: next as any },
            { onConflict: 'user_id,tool_key' },
          )
          .then(() => {});
      }, 500);
      return next;
    });
  };

  return { settings, update, loaded };
}
