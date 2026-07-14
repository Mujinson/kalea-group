import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationCenter from '@/components/admin/NotificationCenter';
import CommandPalette from '@/components/admin/CommandPalette';
import CrmFaqDialog from '@/components/admin/CrmFaqDialog';
import CrmAssistantChat from '@/components/admin/CrmAssistantChat';
import { Loader2, Search, HelpCircle, Settings, LogOut } from 'lucide-react';
import kaleaLogo from '@/assets/kalea-logo.png.asset.json';

const TopIconButton = ({
  children, onClick, title,
}: { children: React.ReactNode; onClick?: () => void; title?: string }) => (
  <button
    onClick={onClick}
    title={title}
    className="w-9 h-9 inline-flex items-center justify-center rounded-crm-sm text-crm-ink-muted hover:text-crm-ink hover:bg-crm-bg-soft transition"
  >
    {children}
  </button>
);

const AdminLayout = () => {
  const { user, isAdmin, role, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else if (role === 'operaio') {
        navigate('/app/operaio');
      } else if (role === 'ibrido') {
        navigate('/app/ibrido');
      } else if (role === 'commerciale') {
        navigate('/app/commerciale');
      } else if (!isAdmin) {
        navigate('/admin/login');
      }
    }
  }, [user, isAdmin, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7FB]">
        <Loader2 className="w-8 h-8 animate-spin text-crm-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const openSearch = () => {
    const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
    window.dispatchEvent(ev);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const initial = (user?.email?.[0] || 'K').toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full admin-theme bg-[#F6F7FB]">
        {/* TOP BAR — Monday/Attio bright, sticky */}
        <header className="h-14 flex items-center px-3 md:px-5 gap-2 shrink-0 bg-white border-b border-crm-border sticky top-0 z-30">
          <SidebarTrigger className="text-crm-ink-muted hover:bg-crm-bg-soft hover:text-crm-ink" />

          {/* Brand */}
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 ml-1 group"
            title="Kalēa CRM"
          >
            <img
              src={kaleaLogo.url}
              alt="Kalēa"
              className="h-6 md:h-7 w-auto object-contain"
            />
            <span className="text-crm-ink-subtle font-normal text-[13px] hidden sm:inline tracking-tight">
              CRM
            </span>
          </button>


          {/* Search */}
          <button
            onClick={openSearch}
            className="ml-4 hidden md:flex items-center gap-2 h-9 px-3 rounded-crm-sm text-[13px] w-[320px] bg-crm-bg-soft border border-crm-border text-crm-ink-muted hover:border-crm-border-strong hover:bg-white transition"
            title="Cerca (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cerca clienti, lead, prodotti…</span>
            <kbd className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-white border border-crm-border text-crm-ink-subtle font-medium">⌘K</kbd>
          </button>

          <div className="flex-1" />

          {/* Right actions */}
          <NotificationCenter />
          <TopIconButton title="Guida / FAQ" onClick={() => setFaqOpen(true)}>
            <HelpCircle className="w-4 h-4" />
          </TopIconButton>
          <TopIconButton title="Impostazioni" onClick={() => navigate('/admin/impostazioni')}>
            <Settings className="w-4 h-4" />
          </TopIconButton>
          <TopIconButton title="Esci" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </TopIconButton>

          {/* Avatar */}
          <div
            className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold text-white ring-2 ring-white shadow-crm-sm"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #A25DDC 100%)' }}
            title={user?.email || ''}
          >
            {initial}
          </div>
        </header>

        {/* BODY: sidebar + main */}
        <div className="flex flex-1 w-full min-h-0">
          <AdminSidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <CommandPalette />
            <div
              key={location.pathname}
              className="flex-1 p-3 md:p-6 overflow-auto bg-[#F6F7FB] animate-crm-fade-up"
            >
              <Outlet />
            </div>
          </main>
        </div>
        <CrmFaqDialog open={faqOpen} onOpenChange={setFaqOpen} role={role === 'admin' ? 'admin' : 'commerciale'} />
        <CrmAssistantChat />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
