import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'commerciale' | null;

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AppRole>(null);
  const [salespersonId, setSalespersonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => { checkRole(session.user.id); }, 0);
        } else {
          setIsAdmin(false);
          setRole(null);
          setSalespersonId(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (userId: string) => {
    try {
      // Check admin first
      const { data: adminData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminData) {
        setIsAdmin(true);
        setRole('admin');
        setLoading(false);
        return;
      }

      // Check commerciale
      const { data: commData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'commerciale')
        .maybeSingle();

      if (commData) {
        setIsAdmin(true); // allow access to dashboard
        setRole('commerciale');
        // Find linked salesperson
        const { data: spData } = await supabase
          .from('salespeople')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        setSalespersonId(spData?.id || null);
        setLoading(false);
        return;
      }

      setIsAdmin(false);
      setRole(null);
    } catch (err) {
      console.error('Error in checkRole:', err);
      setIsAdmin(false);
      setRole(null);
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
      options: { emailRedirectTo: `${window.location.origin}/admin` }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { user, session, isAdmin, role, salespersonId, loading, signIn, signUp, signOut };
};
