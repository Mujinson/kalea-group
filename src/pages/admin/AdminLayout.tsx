import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationCenter from '@/components/admin/NotificationCenter';
import CommandPalette from '@/components/admin/CommandPalette';
import CrmFaqDialog from '@/components/admin/CrmFaqDialog';
import CrmAssistantChat from '@/components/admin/CrmAssistantChat';
import { Loader2, Search, LayoutGrid, HelpCircle, Settings, LogOut } from 'lucide-react';

const TOPBAR_BG = 'linear-gradient(180deg, #1E1B4B 0%, #2A1F5C 100%)';
const TOPBAR_BORDER = 'rgba(255,255,255,0.08)';
const TOPBAR_ICON = 'rgba(226,222,255,0.78)';

const TopIconButton = ({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) => (
  <button
    onClick={onClick}
    title={title}
    className="w-9 h-9 inline-flex items-center justify-center rounded-md transition-colors"
    style={{ color: TOPBAR_ICON, background: 'transparent' }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#FFFFFF'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TOPBAR_ICON; }}
  >
    {children}
  </button>
);

const AdminLayout = () => {
  const { user, isAdmin, role, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
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
        // commerciale uses the mobile app, NOT admin shell
        navigate('/app/commerciale');
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
      <div className="min-h-screen flex flex-col w-full admin-theme" style={{ background: '#F5F0EA' }}>
        {/* TOP BAR — Creatio style, full width */}
        <header
          className="h-12 flex items-center px-3 md:px-4 gap-2 shrink-0"
          style={{ background: TOPBAR_BG, borderBottom: `1px solid ${TOPBAR_BORDER}` }}
        >
          <SidebarTrigger className="text-white/80 hover:bg-white/10 hover:text-white" />
          <span className="font-heading font-semibold text-[16px] tracking-tight ml-1" style={{ color: '#F5F1E8' }}>
            Kalēa<span className="text-[11px] align-top">®</span>
          </span>

          {/* Search */}
          <button
            onClick={openSearch}
            className="ml-4 hidden md:flex items-center gap-2 h-8 px-3 rounded-md text-[12px] transition-colors w-[280px]"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(226,222,255,0.75)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
            title="Cerca (⌘K)"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cerca…</span>
            <kbd className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-white/70">⌘K</kbd>
          </button>

          <div className="flex-1" />

          {/* Right actions */}
          <TopIconButton title="Dashboard" onClick={() => navigate('/admin')}>
            <LayoutGrid className="w-4 h-4" />
          </TopIconButton>
          <div className="text-white/80 [&_button]:text-white/80 [&_button:hover]:text-white">
            <NotificationCenter />
          </div>
          <TopIconButton title="Guida / FAQ" onClick={() => setFaqOpen(true)}>
            <HelpCircle className="w-4 h-4" />
          </TopIconButton>
          <TopIconButton title="Impostazioni" onClick={() => navigate('/admin/impostazioni')}>
            <Settings className="w-4 h-4" />
          </TopIconButton>
          <TopIconButton title="Esci" onClick={handleSignOut}><LogOut className="w-4 h-4" /></TopIconButton>

          {/* Avatar */}
          <div
            className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold"
            style={{
              background: 'linear-gradient(135deg, #C4A882 0%, #8B6F4E 100%)',
              color: '#1E1B4B',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
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
            <div className="flex-1 p-3 md:p-6 overflow-auto" style={{ background: '#F5F0EA' }}>
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
