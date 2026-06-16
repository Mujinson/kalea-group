import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'commerciale' | 'operaio' | 'ibrido' | null;

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AppRole>(null);
  const [salespersonId, setSalespersonId] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [isCommissionEarner, setIsCommissionEarner] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) setTimeout(() => checkRole(s.user.id), 0);
      else {
        setIsAdmin(false); setRole(null); setSalespersonId(null);
        setWorkerId(null); setIsCommissionEarner(false); setCommissionRate(0);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkRole(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const roleList = (roles || []).map((r: any) => r.role as string);
      // priority: admin > ibrido > commerciale > operaio
      let chosen: AppRole = null;
      if (roleList.includes('admin')) chosen = 'admin';
      else if (roleList.includes('ibrido')) chosen = 'ibrido';
      else if (roleList.includes('commerciale')) chosen = 'commerciale';
      else if (roleList.includes('operaio')) chosen = 'operaio';

      setRole(chosen);
      setIsAdmin(chosen === 'admin');

      if (chosen === 'commerciale' || chosen === 'ibrido') {
        const { data: sp } = await supabase
          .from('salespeople')
          .select('id, commission_rate, is_commission_earner')
          .eq('user_id', userId)
          .maybeSingle();
        setSalespersonId(sp?.id || null);
        setIsCommissionEarner(!!sp?.is_commission_earner);
        setCommissionRate(Number(sp?.commission_rate || 0));
      }
      if (chosen === 'operaio' || chosen === 'ibrido') {
        const { data: w } = await supabase
          .from('workers')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        setWorkerId(w?.id || null);
      }
    } catch (err) {
      console.error('checkRole error', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    return { error };
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user, session, isAdmin, role, salespersonId, workerId,
    isCommissionEarner, commissionRate,
    loading, signIn, signUp, signOut,
  };
};

// Helper: where to send a user based on role
export const routeForRole = (r: AppRole): string => {
  switch (r) {
    case 'admin': return '/admin';
    case 'commerciale': return '/app/commerciale';
    case 'ibrido': return '/app/ibrido';
    case 'operaio': return '/app/operaio';
    default: return '/admin/login';
  }
};
