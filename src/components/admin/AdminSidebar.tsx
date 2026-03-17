import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  DollarSign,
  CreditCard,
  Upload,
  LogOut,
  Settings,
  Users,
  BarChart3,
  FileText,
  UserPlus,
  Kanban,
  CalendarClock,
  Bot,
} from 'lucide-react';

const allMenuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard, adminOnly: false },
  { title: 'Vendite', url: '/admin/vendite', icon: ShoppingCart, adminOnly: true },
  { title: 'Preventivi', url: '/admin/preventivi', icon: FileText, adminOnly: false },
  { title: 'Leads', url: '/admin/leads', icon: UserPlus, adminOnly: false },
  { title: 'Clienti', url: '/admin/clienti', icon: Users, adminOnly: false },
  { title: 'Magazzino', url: '/admin/magazzino', icon: Package, adminOnly: true },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, adminOnly: true },
  { title: 'Costi', url: '/admin/costi', icon: DollarSign, adminOnly: true },
  { title: 'Pagamenti', url: '/admin/pagamenti', icon: CreditCard, adminOnly: true },
  { title: 'Import Dati', url: '/admin/import', icon: Upload, adminOnly: true },
  { title: 'Impostazioni', url: '/admin/impostazioni', icon: Settings, adminOnly: true },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, role } = useAdminAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const isAdminRole = role === 'admin';
  const menuItems = allMenuItems.filter(item => isAdminRole || !item.adminOnly);

  const handleSignOut = async () => {
    if (isMobile) setOpenMobile(false);
    await signOut();
    navigate('/admin/login');
  };

  const handleNavigate = (url: string) => {
    if (isMobile) setOpenMobile(false);
    navigate(url);
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/40 font-semibold px-3 mb-1">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigate(item.url)}
                    className={`rounded-xl h-10 px-3 transition-all duration-150 ${
                      isActive(item.url) 
                        ? 'bg-foreground text-background font-medium shadow-sm' 
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] mr-3 shrink-0 ${isActive(item.url) ? '' : 'opacity-60'}`} />
                    <span className="text-[13px]">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="rounded-xl bg-sidebar-accent/60 p-3 mb-2">
          <div className="text-xs font-medium text-sidebar-foreground/70 truncate">
            {user?.email}
          </div>
          {role && (
            <div className="text-[11px] text-sidebar-foreground/40 mt-0.5">
              {isAdminRole ? '👑 Admin' : '📊 Commerciale'}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Esci
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
