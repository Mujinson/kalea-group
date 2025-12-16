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
} from 'lucide-react';

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Vendite', url: '/admin/vendite', icon: ShoppingCart },
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={isActive(item.url) ? 'bg-primary/10 text-primary' : ''}
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
      
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground mb-2 truncate">
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
