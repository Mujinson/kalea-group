import { useNavigate, useLocation } from 'react-router-dom';
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
  color: string;
  adminOnly: boolean;
  items: MenuItem[];
}

type MenuEntry =
  | { type: 'single'; item: MenuItem & { color: string } }
  | { type: 'group'; group: MenuGroup };

const menuStructure: MenuEntry[] = [
  {
    type: 'single',
    item: { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, color: '#3B82F6', adminOnly: false },
  },
  {
    type: 'group',
    group: {
      label: 'Lead', icon: Sparkles, color: '#F59E0B', adminOnly: false,
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
      label: 'Commerciale', icon: Briefcase, color: '#EF4444', adminOnly: false,
      items: [
        { title: 'Vendite', url: '/admin/vendite', icon: ShoppingCart, adminOnly: true },
        { title: 'Preventivi', url: '/admin/preventivi', icon: FileText, adminOnly: false },
        { title: 'Commissioni', url: '/admin/commissioni', icon: DollarSign, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Clienti', icon: Users, color: '#10B981', adminOnly: false,
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
      label: 'Cantieri', icon: HardHat, color: '#F97316', adminOnly: false,
      items: [
        { title: 'Dashboard', url: '/admin/cantieri-dashboard', icon: LayoutDashboard, adminOnly: true },
        { title: 'Planner Operativo', url: '/admin/planner', icon: CalendarClock, adminOnly: true },
        { title: 'Lista cantieri', url: '/admin/cantieri', icon: HardHat, adminOnly: false },
        { title: 'Operai & Ore', url: '/admin/cantieri-operai', icon: Users, adminOnly: true },
        { title: 'Ferie / Indisponibilità', url: '/admin/ferie', icon: CalendarClock, adminOnly: true },
        { title: 'Materiali', url: '/admin/cantieri-materiali', icon: ListOrdered, adminOnly: true },
        { title: 'Budget vs Consuntivo', url: '/admin/cantieri-budget', icon: DollarSign, adminOnly: true },
        { title: 'Report', url: '/admin/cantieri-report', icon: BarChart3, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Magazzino', icon: Package, color: '#A855F7', adminOnly: true,
      items: [
        { title: 'Catalogo prodotti', url: '/admin/catalogo', icon: Package, adminOnly: true },
        { title: 'Lista articoli', url: '/admin/magazzino', icon: ListOrdered, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Statistiche', icon: BarChart3, color: '#06B6D4', adminOnly: true,
      items: [
        { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Finanza', icon: Landmark, color: '#22C55E', adminOnly: true,
      items: [
        { title: 'Fatturazione & Incassi', url: '/admin/fatturazione', icon: FileText, adminOnly: true },
        { title: 'Contabilità', url: '/admin/contabilita', icon: Landmark, adminOnly: true },
        { title: 'Costi', url: '/admin/costi', icon: DollarSign, adminOnly: true },
        { title: 'Pagamenti', url: '/admin/pagamenti', icon: CreditCard, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Strumenti', icon: Wrench, color: '#EC4899', adminOnly: true,
      items: [
        
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
      label: 'Impostazioni', icon: Settings, color: '#64748B', adminOnly: true,
      items: [
        { title: 'Generali', url: '/admin/impostazioni', icon: Settings, adminOnly: true },
        { title: 'Import Dati', url: '/admin/import', icon: Upload, adminOnly: true },
      ],
    },
  },
];

// Sidebar palette inspired by Creatio: deep indigo gradient
const SIDEBAR_BG = 'linear-gradient(180deg, #1E1B4B 0%, #2A1F5C 55%, #312866 100%)';
const TEXT_DEFAULT = 'rgba(226, 222, 255, 0.78)';
const TEXT_ACTIVE = '#FFFFFF';
const HOVER_BG = 'rgba(255, 255, 255, 0.06)';
const ACTIVE_BG = 'rgba(255, 255, 255, 0.10)';
const BORDER_COL = 'rgba(255, 255, 255, 0.08)';

const ColorTile = ({ icon: Icon, color }: { icon: LucideIcon; color: string }) => (
  <span
    className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0"
    style={{ background: color, boxShadow: `0 1px 0 rgba(0,0,0,0.15) inset, 0 4px 10px ${color}33` }}
  >
    <Icon className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
  </span>
);

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
    <Sidebar collapsible="icon" className="border-r" style={{ borderColor: BORDER_COL }}>
      <SidebarContent
        className="pt-4 overflow-y-auto"
        style={{ background: SIDEBAR_BG }}
      >
        {/* Brand */}
        <div className="px-5 pb-4 mb-2 group-data-[collapsible=icon]:hidden">
          <span
            className="font-heading font-semibold text-[20px] tracking-tight"
            style={{ color: '#F5F1E8' }}
          >
            Kalēa<span className="text-[14px] align-top">®</span>
          </span>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
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
                        className="h-10 px-3 rounded-md transition-colors duration-150 hover:!bg-white/5"
                        style={{
                          background: active ? ACTIVE_BG : 'transparent',
                          color: active ? TEXT_ACTIVE : TEXT_DEFAULT,
                          fontWeight: active ? 600 : 500,
                          boxShadow: active ? `inset 3px 0 0 ${item.color}` : 'none',
                        }}
                      >
                        <ColorTile icon={item.icon} color={item.color} />
                        <span className="text-[13.5px] ml-2.5">{item.title}</span>
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
                          className="h-10 px-3 rounded-md w-full justify-between transition-colors duration-150 hover:!bg-white/5"
                          style={{
                            background: groupActive ? ACTIVE_BG : 'transparent',
                            color: groupActive ? TEXT_ACTIVE : TEXT_DEFAULT,
                            fontWeight: groupActive ? 600 : 500,
                            boxShadow: groupActive ? `inset 3px 0 0 ${group.color}` : 'none',
                          }}
                        >
                          <span className="flex items-center">
                            <ColorTile icon={group.icon} color={group.color} />
                            <span className="text-[13.5px] ml-2.5">{group.label}</span>
                          </span>
                          <ChevronDown
                            className="w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
                            style={{ color: 'rgba(226,222,255,0.45)' }}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                        <SidebarMenu className="space-y-0 mt-0.5 ml-3 pl-3" style={{ borderLeft: `1px solid ${BORDER_COL}` }}>
                          {visibleItems.map((sub) => {
                            const subActive = isActive(sub.url);
                            return (
                              <SidebarMenuItem key={sub.title}>
                                <SidebarMenuButton
                                  onClick={() => handleNavigate(sub.url)}
                                  className="h-8 pl-6 pr-3 rounded-md transition-colors duration-150 hover:!bg-white/5"
                                  style={{
                                    background: subActive ? HOVER_BG : 'transparent',
                                    color: subActive ? TEXT_ACTIVE : 'rgba(226,222,255,0.65)',
                                    fontWeight: subActive ? 600 : 400,
                                    position: 'relative',
                                  }}
                                >
                                  {subActive && (
                                    <span
                                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                                      style={{ background: group.color }}
                                    />
                                  )}
                                  <span className="text-[12.5px]">{sub.title}</span>
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

      <SidebarFooter
        className="p-4"
        style={{
          borderTop: `1px solid ${BORDER_COL}`,
          background: 'linear-gradient(180deg, #312866 0%, #1A153D 100%)',
        }}
      >
        <div className="px-1 mb-3 group-data-[collapsible=icon]:hidden">
          <div className="text-[12px] truncate" style={{ color: '#F5F1E8' }}>
            {user?.email}
          </div>
          {role && (
            <div
              className="text-[10px] mt-1 uppercase"
              style={{ color: 'rgba(226,222,255,0.55)', letterSpacing: '0.12em' }}
            >
              {role === 'admin' ? 'Admin' : role === 'commerciale' ? 'Commerciale' : 'Operaio'}
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          title="Esci"
          className="flex items-center gap-2 px-1 py-1 text-[13px] transition-colors duration-150 group-data-[collapsible=icon]:justify-center"
          style={{ color: 'rgba(226,222,255,0.7)', background: 'transparent', border: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(226,222,255,0.7)')}
        >
          <LogOut className="w-4 h-4" />
          <span className="group-data-[collapsible=icon]:hidden">Esci</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
