import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  ChevronDown,
  Sparkles,
  Briefcase,
  Landmark,
  HardHat,
  Image,
  Map,
  ListOrdered,
  ClipboardList,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  adminOnly: boolean;
}

interface MenuGroup {
  label: string;
  icon: LucideIcon;
  adminOnly: boolean;
  items: MenuItem[];
}

type MenuEntry =
  | { type: 'single'; item: MenuItem }
  | { type: 'group'; group: MenuGroup };

const menuStructure: MenuEntry[] = [
  {
    type: 'single',
    item: { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, adminOnly: false },
  },
  {
    type: 'group',
    group: {
      label: 'Lead',
      icon: Sparkles,
      adminOnly: false,
      items: [
        { title: 'Lista lead', url: '/admin/leads', icon: UserPlus, adminOnly: false },
        { title: 'Pipeline', url: '/admin/pipeline', icon: Kanban, adminOnly: false },
        { title: 'Appuntamenti', url: '/admin/appuntamenti', icon: CalendarClock, adminOnly: false },
        { title: 'Chatbot', url: '/admin/chatbot', icon: Bot, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Commerciale',
      icon: Briefcase,
      adminOnly: false,
      items: [
        { title: 'Vendite', url: '/admin/vendite', icon: ShoppingCart, adminOnly: true },
        { title: 'Preventivi', url: '/admin/preventivi', icon: FileText, adminOnly: false },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Clienti',
      icon: Users,
      adminOnly: false,
      items: [
        { title: 'Lista clienti', url: '/admin/clienti', icon: Users, adminOnly: false },
        { title: 'Cantieri', url: '/admin/cantieri', icon: HardHat, adminOnly: false },
        { title: 'Registro Lavori', url: '/admin/registro-lavori', icon: ClipboardList, adminOnly: true },
        { title: 'Media', url: '/admin/media', icon: Image, adminOnly: false },
        { title: 'Mappa', url: '/admin/mappa', icon: Map, adminOnly: false },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Magazzino',
      icon: Package,
      adminOnly: true,
      items: [
        { title: 'Lista articoli', url: '/admin/magazzino', icon: ListOrdered, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Statistiche',
      icon: BarChart3,
      adminOnly: true,
      items: [
        { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Finanza',
      icon: Landmark,
      adminOnly: true,
      items: [
        { title: 'Costi', url: '/admin/costi', icon: DollarSign, adminOnly: true },
        { title: 'Pagamenti', url: '/admin/pagamenti', icon: CreditCard, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Impostazioni',
      icon: Settings,
      adminOnly: true,
      items: [
        { title: 'Generali', url: '/admin/impostazioni', icon: Settings, adminOnly: true },
        { title: 'Import Dati', url: '/admin/import', icon: Upload, adminOnly: true },
      ],
    },
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, role } = useAdminAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const isAdminRole = role === 'admin';

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const isGroupActive = (items: MenuItem[]) =>
    items.some((item) => isActive(item.url));

  const handleSignOut = async () => {
    if (isMobile) setOpenMobile(false);
    await signOut();
    navigate('/admin/login');
  };

  const handleNavigate = (url: string) => {
    if (isMobile) setOpenMobile(false);
    navigate(url);
  };

  const filterItems = (items: MenuItem[]) =>
    items.filter((i) => isAdminRole || !i.adminOnly);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="pt-2 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {menuStructure.map((entry) => {
                if (entry.type === 'single') {
                  const item = entry.item;
                  if (!isAdminRole && item.adminOnly) return null;
                  return (
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
                  );
                }

                const { group } = entry;
                if (!isAdminRole && group.adminOnly) return null;
                const visibleItems = filterItems(group.items);
                if (visibleItems.length === 0) return null;
                const groupActive = isGroupActive(visibleItems);

                return (
                  <Collapsible key={group.label} defaultOpen={groupActive}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`rounded-xl h-10 px-3 w-full justify-between transition-all duration-150 ${
                            groupActive
                              ? 'text-sidebar-foreground font-medium'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                          }`}
                        >
                          <span className="flex items-center">
                            <group.icon className={`w-[18px] h-[18px] mr-3 shrink-0 ${groupActive ? '' : 'opacity-60'}`} />
                            <span className="text-[13px]">{group.label}</span>
                          </span>
                          <ChevronDown className="w-4 h-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-5 mt-0.5 border-l border-sidebar-border/40 ml-[21px]">
                        <SidebarMenu className="space-y-0.5">
                          {visibleItems.map((sub) => (
                            <SidebarMenuItem key={sub.title}>
                              <SidebarMenuButton
                                onClick={() => handleNavigate(sub.url)}
                                className={`rounded-xl h-9 px-3 transition-all duration-150 ${
                                  isActive(sub.url)
                                    ? 'bg-foreground text-background font-medium shadow-sm'
                                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                }`}
                              >
                                <span className="text-[13px]">{sub.title}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
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
              {role === 'admin' ? '👑 Admin' : role === 'commerciale' ? '📊 Commerciale' : '🔧 Operaio'}
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
