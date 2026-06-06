import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationCenter from '@/components/admin/NotificationCenter';
import CommandPalette from '@/components/admin/CommandPalette';
import { Loader2, Search } from 'lucide-react';
import logoDark from '@/assets/logo-new.png';

const AdminLayout = () => {
  const { user, isAdmin, role, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else if (role === 'operaio') {
        navigate('/cantieri-app');
      } else if (!isAdmin) {
        navigate('/admin/login');
      }
    }
  }, [user, isAdmin, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full admin-theme" style={{ background: '#F5F0EA' }}>
        <AdminSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b" style={{ background: '#FFFFFF', borderColor: 'rgba(59,35,20,0.10)' }}>
            <div className="h-full flex items-center px-3 md:px-4 gap-3">
              <SidebarTrigger className="text-[#8A7060] hover:bg-[rgba(200,169,110,0.08)]" />
              <img src={logoDark} alt="Kalēa" className="h-7" />
              <span className="text-[13px] tracking-wide" style={{ color: '#8A7060' }}>/ Dashboard</span>
              <div className="flex-1" />
              <NotificationCenter />
            </div>
          </header>
          <div className="flex-1 p-3 md:p-6 overflow-auto" style={{ background: '#F5F0EA' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
