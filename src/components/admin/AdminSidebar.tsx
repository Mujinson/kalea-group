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
} from 'lucide-react';

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Vendite', url: '/admin/vendite', icon: ShoppingCart },
  { title: 'Preventivi', url: '/admin/preventivi', icon: FileText },
  { title: 'Clienti', url: '/admin/clienti', icon: Users },
  { title: 'Magazzino', url: '/admin/magazzino', icon: Package },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Costi', url: '/admin/costi', icon: DollarSign },
  { title: 'Pagamenti', url: '/admin/pagamenti', icon: CreditCard },
  { title: 'Import Dati', url: '/admin/import', icon: Upload },
  { title: 'Impostazioni', url: '/admin/impostazioni', icon: Settings },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAdminAuth();
  const { setOpenMobile, isMobile } = useSidebar();

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
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent className="bg-white text-black md:bg-sidebar md:text-sidebar-foreground">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-gray-600 md:text-sidebar-foreground/70">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigate(item.url)}
                    className={`${isActive(item.url) ? 'bg-primary/10 text-primary' : 'text-gray-800 md:text-sidebar-foreground'} hover:bg-gray-100 md:hover:bg-sidebar-accent`}
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
      
      <SidebarFooter className="p-4 border-t bg-white md:bg-sidebar">
        <div className="text-xs text-gray-500 md:text-muted-foreground mb-2 truncate">
          {user?.email}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
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
