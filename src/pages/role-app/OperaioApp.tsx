import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Home, Calendar, Hammer, User } from 'lucide-react';
import RoleAppLayout from '@/components/role-app/RoleAppLayout';
import RoleStub from './RoleStub';
import OperaioSites from './OperaioSites';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Phone, MapPin, Camera, MessageSquare } from 'lucide-react';

const nav = [
  { to: '/app/operaio', label: 'Oggi', icon: <Home className="w-5 h-5" /> },
  { to: '/app/operaio/calendario', label: 'Calendario', icon: <Calendar className="w-5 h-5" /> },
  { to: '/app/operaio/cantieri', label: 'Cantieri', icon: <Hammer className="w-5 h-5" /> },
  { to: '/app/operaio/profilo', label: 'Profilo', icon: <User className="w-5 h-5" /> },
];

const OperaioHome = () => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);

      const { data: w } = await supabase
        .from('workers')
        .select('first_name')
        .eq('user_id', user.id)
        .maybeSingle();
      const meta: any = (user as any).user_metadata || {};
      const fromMeta = (meta.first_name as string) ||
        ((meta.full_name as string) || (meta.name as string) || '').split(' ')[0];
      const fromEmail = (user.email || '').split('@')[0].split('.')[0];
      const n = (w?.first_name || fromMeta || fromEmail || '').trim();
      if (n) setFirstName(n.charAt(0).toUpperCase() + n.slice(1));

      // sites where I'm an active worker
      const { data: assigns } = await supabase
        .from('site_workers')
        .select('site_id, construction_sites(id,title,address,city,product_model,status,contact_phone,contact_name,contact_surname,start_date,end_date)')
        .eq('worker_user_id', user.id)
        .eq('is_active', true);

      const list = (assigns || [])
        .map((a: any) => a.construction_sites)
        .filter(Boolean)
        .filter((s: any) =>
          (!s.start_date || s.start_date <= today) && (!s.end_date || s.end_date >= today)
        );
      setSites(list);
      setLoading(false);
    })();
  }, [user]);

  const today = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-[13px] text-[#8C7B6B] capitalize">{today}</p>
        <h1 className="text-[26px] font-semibold text-[#1E1B4B] mt-1">
          Ciao{firstName ? ` ${firstName}` : ''} 👋
        </h1>
        <p className="text-[14px] text-[#6B6258] mt-1">I miei cantieri di oggi</p>
      </div>

      {loading && <div className="text-center py-8 text-[#8C7B6B]">Caricamento…</div>}
      {!loading && sites.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 text-center text-[#6B6258]">
          Nessun cantiere assegnato per oggi.
        </div>
      )}

      {sites.map((s) => {
        const cliente = [s.contact_name, s.contact_surname].filter(Boolean).join(' ') || s.title;
        const fullAddr = [s.address, s.city].filter(Boolean).join(', ');
        return (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-[#E5E2DD] p-5 space-y-3"
          >
            <div>
              <div className="text-[18px] font-semibold text-[#1E1B4B]">{cliente}</div>
              {s.contact_phone && (
                <a
                  href={`tel:${s.contact_phone}`}
                  className="inline-flex items-center gap-2 mt-2 h-[44px] px-3 rounded-lg bg-[#1E1B4B] text-white text-[14px] font-medium"
                >
                  <Phone className="w-4 h-4" /> {s.contact_phone}
                </a>
              )}
            </div>
            {fullAddr && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[14px] text-[#8B6F4E] underline"
              >
                <MapPin className="w-4 h-4" /> {fullAddr}
              </a>
            )}
            {s.product_model && (
              <div className="text-[14px] text-[#1E1B4B]">
                <span className="text-[#8C7B6B]">Prodotto:</span> {s.product_model}
              </div>
            )}
            <div className="text-[12px] uppercase tracking-wider text-[#8C7B6B]">
              Stato: <span className="text-[#1E1B4B] font-medium">{s.status}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => navigate(`/app/operaio/cantieri/${s.id}`)}
                className="flex-1 h-[52px] rounded-lg border border-[#E5E2DD] text-[#1E1B4B] font-medium flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" /> Foto
              </button>
              <button
                onClick={() => navigate(`/app/operaio/cantieri/${s.id}`)}
                className="flex-1 h-[52px] rounded-lg border border-[#E5E2DD] text-[#1E1B4B] font-medium flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> Chat
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OperaioApp = () => (
  <Routes>
    <Route element={<RoleAppLayout allowedRoles={['operaio']} navItems={nav} title="Operaio" />}>
      <Route index element={<OperaioHome />} />
      <Route path="calendario" element={<RoleStub title="Calendario" />} />
      <Route path="cantieri" element={<OperaioSites />} />
      <Route path="cantieri/:id" element={<RoleStub title="Scheda cantiere" />} />
      <Route path="profilo" element={<RoleStub title="Profilo" />} />
      <Route path="*" element={<Navigate to="/app/operaio" replace />} />
    </Route>
  </Routes>
);

export default OperaioApp;
