import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationCenter from '@/components/admin/NotificationCenter';
import { Loader2 } from 'lucide-react';
import logoDark from '@/assets/logo-new.png';

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else if (!isAdmin) {
        navigate('/admin/login');
      }
    }
  }, [user, isAdmin, loading, navigate]);

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
      <div className="min-h-screen flex w-full" style={{ background: '#ffffff' }}>
        <AdminSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border" style={{ background: '#ffffff' }}><div className="h-full flex items-center px-3 md:px-4 gap-3">
            <SidebarTrigger className="text-foreground hover:bg-muted" />
            <img src={logoDark} alt="Kalēa" className="h-7" />
            <span className="text-muted-foreground text-sm font-light">Dashboard</span>
            <div className="flex-1" />
            <NotificationCenter />
          </div>
          </header>
          <div className="flex-1 p-3 md:p-6 overflow-auto" style={{ background: '#ffffff' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
