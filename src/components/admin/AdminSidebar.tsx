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
  Wrench,
  Calculator,
  LineChart,
  Tag,
  Layers,
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
        { title: 'Media', url: '/admin/media', icon: Image, adminOnly: false },
        { title: 'Mappa', url: '/admin/mappa', icon: Map, adminOnly: false },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Cantieri',
      icon: HardHat,
      adminOnly: false,
      items: [
        { title: 'Dashboard', url: '/admin/cantieri-dashboard', icon: LayoutDashboard, adminOnly: true },
        { title: 'Lista cantieri', url: '/admin/cantieri', icon: HardHat, adminOnly: false },
        { title: 'Operai & Ore', url: '/admin/cantieri-operai', icon: Users, adminOnly: true },
        { title: 'Materiali', url: '/admin/cantieri-materiali', icon: ListOrdered, adminOnly: true },
        { title: 'Budget vs Consuntivo', url: '/admin/cantieri-budget', icon: DollarSign, adminOnly: true },
        { title: 'Report', url: '/admin/cantieri-report', icon: BarChart3, adminOnly: true },
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
        { title: 'Catalogo prodotti', url: '/admin/catalogo', icon: Package, adminOnly: true },
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
      label: 'Strumenti',
      icon: Wrench,
      adminOnly: true,
      items: [
        { title: 'Crea Preventivo', url: '/admin/strumenti/crea-preventivo', icon: FileText, adminOnly: true },
        { title: 'Preventivatore', url: '/admin/strumenti/preventivatore', icon: Calculator, adminOnly: true },
        { title: 'Sistema Preventivi', url: '/admin/strumenti/sistema-preventivi', icon: FileText, adminOnly: true },
        { title: 'Costo Operaio', url: '/admin/strumenti/costo-operaio', icon: Calculator, adminOnly: true },
        { title: 'Sostenibilità', url: '/admin/strumenti/sostenibilita', icon: LineChart, adminOnly: true },
        { title: 'Pricing Flow', url: '/admin/strumenti/pricing-flow', icon: Tag, adminOnly: true },
        { title: 'Pricing Kronos', url: '/admin/strumenti/pricing-kronos', icon: Layers, adminOnly: true },
        { title: 'Pricing BerryAlloc', url: '/admin/strumenti/pricing-berryalloc', icon: Tag, adminOnly: true },
        { title: 'Pricing Parquet', url: '/admin/strumenti/pricing-parquet', icon: Layers, adminOnly: true },
        { title: 'Pricing Signature', url: '/admin/strumenti/pricing-signature', icon: Layers, adminOnly: true },
        { title: 'Pricing Externo', url: '/admin/strumenti/pricing-externo', icon: Tag, adminOnly: true },
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
    <Sidebar collapsible="icon" className="border-r" style={{ borderColor: 'rgba(59,35,20,0.10)' }}>
      <SidebarContent className="pt-4 overflow-y-auto" style={{ background: '#FFFFFF' }}>
        {/* Brand wordmark, no box — hidden when collapsed */}
        <div className="px-5 pb-4 mb-2 group-data-[collapsible=icon]:hidden">
          <span
            className="font-heading font-semibold text-[20px] tracking-tight"
            style={{ color: '#3B2314' }}
          >
            Kalēa<span className="text-[14px] align-top">®</span>
          </span>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0 px-2">
              {menuStructure.map((entry) => {
                if (entry.type === 'single') {
                  const item = entry.item;
                  if (!isAdminRole && item.adminOnly) return null;
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => handleNavigate(item.url)}
                        tooltip={item.title}
                        className="h-10 px-5 rounded-none transition-colors duration-150"
                        style={{
                          borderLeft: active ? '3px solid #C8A96E' : '3px solid transparent',
                          background: active ? 'rgba(200,169,110,0.10)' : 'transparent',
                          color: active ? '#3B2314' : '#8A7060',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-3 shrink-0" style={{ color: active ? '#3B2314' : '#8A7060' }} />
                        <span className="text-[14px]">{item.title}</span>
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
                  <Collapsible key={group.label} defaultOpen={groupActive} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={group.label}
                          className="h-10 px-5 rounded-none w-full justify-between transition-colors duration-150"
                          style={{
                            borderLeft: groupActive ? '3px solid #C8A96E' : '3px solid transparent',
                            color: groupActive ? '#3B2314' : '#8A7060',
                            fontWeight: groupActive ? 600 : 400,
                          }}
                        >
                          <span className="flex items-center">
                            <group.icon className="w-4 h-4 mr-3 shrink-0" style={{ color: groupActive ? '#3B2314' : '#8A7060' }} />
                            <span className="text-[14px]">{group.label}</span>
                          </span>
                          <ChevronDown
                            className="w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
                            style={{ color: '#B0998A' }}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                        <SidebarMenu className="space-y-0">
                          {visibleItems.map((sub) => {
                            const subActive = isActive(sub.url);
                            return (
                              <SidebarMenuItem key={sub.title}>
                                <SidebarMenuButton
                                  onClick={() => handleNavigate(sub.url)}
                                  className="h-9 pl-12 pr-5 rounded-none transition-colors duration-150"
                                  style={{
                                    borderLeft: subActive ? '3px solid #C8A96E' : '3px solid transparent',
                                    background: subActive ? 'rgba(200,169,110,0.10)' : 'transparent',
                                    color: subActive ? '#3B2314' : '#8A7060',
                                    fontWeight: subActive ? 600 : 400,
                                  }}
                                >
                                  <span className="text-[13px]">{sub.title}</span>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
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

      <SidebarFooter className="p-4" style={{ borderTop: '1px solid rgba(59,35,20,0.10)', background: '#FFFFFF' }}>
        <div className="px-1 mb-3 group-data-[collapsible=icon]:hidden">
          <div className="text-[12px] truncate" style={{ color: '#1A1008' }}>
            {user?.email}
          </div>
          {role && (
            <div
              className="text-[10px] mt-1 uppercase"
              style={{ color: '#B0998A', letterSpacing: '0.12em' }}
            >
              {role === 'admin' ? 'Admin' : role === 'commerciale' ? 'Commerciale' : 'Operaio'}
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          title="Esci"
          className="flex items-center gap-2 px-1 py-1 text-[13px] transition-colors duration-150 group-data-[collapsible=icon]:justify-center"
          style={{ color: '#8A7060', background: 'transparent', border: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#3B2314')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8A7060')}
        >
          <LogOut className="w-4 h-4" />
          <span className="group-data-[collapsible=icon]:hidden">Esci</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
