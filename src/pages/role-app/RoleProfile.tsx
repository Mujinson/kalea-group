import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LogOut, Mail, Phone, User as UserIcon, Shield } from 'lucide-react';

const RoleProfile = () => {
  const { user, role } = useAdminAuth();
  const [info, setInfo] = useState<{ first?: string; last?: string; phone?: string }>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (role === 'commerciale' || role === 'ibrido') {
        const { data } = await supabase
          .from('salespeople')
          .select('first_name,last_name,phone')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) setInfo({ first: data.first_name, last: data.last_name, phone: data.phone });
      } else if (role === 'operaio') {
        const { data } = await supabase
          .from('workers')
          .select('first_name,last_name,phone')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) setInfo({ first: data.first_name, last: data.last_name, phone: data.phone });
      }
    })();
  }, [user, role]);

  const fullName = [info.first, info.last].filter(Boolean).join(' ') ||
    (user?.email || '').split('@')[0];
  const initials = (info.first?.[0] || user?.email?.[0] || '?').toUpperCase() +
    (info.last?.[0] || '').toUpperCase();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center text-[22px] font-semibold">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[18px] font-semibold text-[#1E1B4B] truncate">{fullName}</div>
          <div className="text-[12px] uppercase tracking-wider text-[#8C7B6B] mt-1">{role || '—'}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E2DD] divide-y divide-[#E5E2DD]">
        <div className="flex items-center gap-3 p-4">
          <Mail className="w-5 h-5 text-[#8C7B6B]" />
          <div className="text-[14px] text-[#1E1B4B] truncate">{user?.email || '—'}</div>
        </div>
        {info.phone && (
          <a href={`tel:${info.phone}`} className="flex items-center gap-3 p-4">
            <Phone className="w-5 h-5 text-[#8C7B6B]" />
            <div className="text-[14px] text-[#1E1B4B]">{info.phone}</div>
          </a>
        )}
        <div className="flex items-center gap-3 p-4">
          <Shield className="w-5 h-5 text-[#8C7B6B]" />
          <div className="text-[14px] text-[#1E1B4B] capitalize">{role || 'utente'}</div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <UserIcon className="w-5 h-5 text-[#8C7B6B]" />
          <div className="text-[12px] text-[#6B6258] font-mono truncate">{user?.id || '—'}</div>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full h-[52px] rounded-lg bg-[#1E1B4B] text-white font-medium flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> Esci
      </button>
    </div>
  );
};

export default RoleProfile;
