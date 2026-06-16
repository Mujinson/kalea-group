import { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth, routeForRole } from '@/hooks/useAdminAuth';
import { Loader2, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import NotificationsBell from '@/components/role-app/NotificationsBell';

interface NavItem { to: string; label: string; icon: ReactNode; }

interface RoleAppLayoutProps {
  allowedRoles: Array<'commerciale' | 'operaio' | 'ibrido'>;
  navItems: NavItem[];
  title: string;
}

const RoleAppLayout = ({ allowedRoles, navItems, title }: RoleAppLayoutProps) => {
  const { user, role, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/admin/login'); return; }
    // If logged in but role doesn't match this app, auto-redirect to the correct one
    if (role && !allowedRoles.includes(role as any)) {
      const t = setTimeout(() => navigate(routeForRole(role)), 1200);
      return () => clearTimeout(t);
    }
  }, [user, role, loading, navigate, allowedRoles]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0EA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E1B4B]" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (!role || !allowedRoles.includes(role as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0EA] p-6">
        <div className="w-full max-w-sm rounded-lg border border-[#E5E2DD] bg-white p-5 text-center space-y-4">
          <div>
            <p className="text-sm text-[#8C7B6B]">Accesso non disponibile</p>
            <h1 className="text-xl font-semibold text-[#1E1B4B]">Questa app non è per il tuo ruolo</h1>
          </div>
          <Button className="w-full" onClick={() => navigate(routeForRole(role))}>
            Vai alla tua area
          </Button>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            Esci
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0EA]">
      <header
        className="h-14 flex items-center justify-between px-4 shrink-0"
        style={{
          background: 'linear-gradient(180deg, #1E1B4B 0%, #2A1F5C 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-2 text-white">
          <span className="font-heading font-semibold text-[17px] tracking-tight">
            Kalēa<span className="text-[10px] align-top">®</span>
          </span>
          <span className="text-white/40">·</span>
          <span className="text-[14px] text-white/80">{title}</span>
        </div>
        <div className="flex items-center gap-1 -mr-2">
          <NotificationsBell />
          <button
            onClick={handleSignOut}
            className="text-white/80 hover:text-white p-2"
            title="Esci"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-[76px]">
        <Outlet />
      </main>

      {/* Bottom navigation — mobile-first */}
      <nav
        className="fixed bottom-0 inset-x-0 h-[68px] grid bg-white"
        style={{
          gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
          borderTop: '1px solid #E5E2DD',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#1E1B4B]' : 'text-[#8C7B6B]'
              }`
            }
          >
            <div className="w-6 h-6 flex items-center justify-center">{it.icon}</div>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default RoleAppLayout;
