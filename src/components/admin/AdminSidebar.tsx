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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigate(item.url)}
                    className={`${isActive(item.url) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/80'} hover:bg-sidebar-accent/60`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50 mb-1 truncate">
          {user?.email}
        </div>
        {role && (
          <div className="text-xs text-sidebar-foreground/40 mb-2">
            {isAdminRole ? '👑 Admin' : '📊 Commerciale'}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
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
