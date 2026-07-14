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
  Library,
  History,
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
        { title: 'Timbrature Posatori', url: '/admin/timbrature', icon: CalendarClock, adminOnly: true },
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
      label: 'Catalogo', icon: Library, color: '#0EA5E9', adminOnly: false,
      items: [
        { title: 'Prodotti', url: '/admin/catalogo', icon: Package, adminOnly: false },
        { title: 'Prezzi & Margini', url: '/admin/catalogo/prezzi', icon: DollarSign, adminOnly: true },
        { title: 'Marche', url: '/admin/catalogo/marche', icon: Tag, adminOnly: true },
        { title: 'Collezioni', url: '/admin/catalogo/collezioni', icon: Layers, adminOnly: true },
        { title: 'Categorie', url: '/admin/catalogo/categorie', icon: ListOrdered, adminOnly: true },
        { title: 'Listini & versioni', url: '/admin/catalogo/listini', icon: FileText, adminOnly: true },
        { title: 'Storico modifiche', url: '/admin/catalogo/storico', icon: History, adminOnly: true },
        { title: 'Importa listino', url: '/admin/catalogo/importa', icon: Upload, adminOnly: true },
      ],
    },
  },
  {
    type: 'group',
    group: {
      label: 'Magazzino', icon: Package, color: '#A855F7', adminOnly: true,
      items: [
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

// Sidebar palette — uses CRM tokens so dark/light theme switches automatically
const SIDEBAR_BG = 'var(--crm-surface)';
const TEXT_DEFAULT = 'var(--crm-ink-muted)';
const TEXT_ACTIVE = 'var(--crm-ink)';
const HOVER_BG = 'var(--crm-surface-hover)';
const ACTIVE_BG = 'var(--crm-primary-soft)';
const BORDER_COL = 'var(--crm-border)';

const ColorTile = ({
  icon: Icon, color, active,
}: { icon: LucideIcon; color: string; active?: boolean }) => (
  <span
    className="inline-flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-transform"
    style={{
      background: active ? color : `${color}18`,
      color: active ? '#FFFFFF' : color,
      boxShadow: active ? `0 2px 6px ${color}55, inset 0 1px 0 rgba(255,255,255,0.14)` : 'none',
    }}
  >
    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
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
    <Sidebar collapsible="icon" className="border-r md:!top-14 md:!h-[calc(100svh-3.5rem)]" style={{ borderColor: BORDER_COL }}>
      <SidebarContent
        className="pt-3 overflow-y-auto"
        style={{ background: SIDEBAR_BG }}
      >
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
                        className="h-9 px-2.5 rounded-crm-sm transition-colors duration-150 group/mi relative"
                        style={{
                          background: active ? ACTIVE_BG : 'transparent',
                          color: active ? TEXT_ACTIVE : TEXT_DEFAULT,
                          fontWeight: active ? 600 : 500,
                        }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = HOVER_BG; }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {active && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                            style={{ background: item.color }}
                          />
                        )}
                        <ColorTile icon={item.icon} color={item.color} active={active} />
                        <span className="text-[13px] ml-2">{item.title}</span>
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
                          className="h-9 px-2.5 rounded-crm-sm w-full justify-between transition-colors duration-150 relative"
                          style={{
                            background: groupActive ? ACTIVE_BG : 'transparent',
                            color: groupActive ? TEXT_ACTIVE : TEXT_DEFAULT,
                            fontWeight: groupActive ? 600 : 500,
                          }}
                          onMouseEnter={(e) => { if (!groupActive) e.currentTarget.style.background = HOVER_BG; }}
                          onMouseLeave={(e) => { if (!groupActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {groupActive && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                              style={{ background: group.color }}
                            />
                          )}
                          <span className="flex items-center">
                            <ColorTile icon={group.icon} color={group.color} active={groupActive} />
                            <span className="text-[13px] ml-2">{group.label}</span>
                          </span>
                          <ChevronDown
                            className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 text-crm-ink-subtle"
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                        <SidebarMenu
                          className="space-y-0 mt-0.5 ml-3.5 pl-3"
                          style={{ borderLeft: `1px solid ${BORDER_COL}` }}
                        >
                          {visibleItems.map((sub) => {
                            const subActive = isActive(sub.url);
                            return (
                              <SidebarMenuItem key={sub.title}>
                                <SidebarMenuButton
                                  onClick={() => handleNavigate(sub.url)}
                                  className="h-7 pl-4 pr-2 rounded-crm-sm transition-colors duration-150 relative"
                                  style={{
                                    background: subActive ? HOVER_BG : 'transparent',
                                    color: subActive ? TEXT_ACTIVE : '#94A3B8',
                                    fontWeight: subActive ? 600 : 400,
                                  }}
                                  onMouseEnter={(e) => { if (!subActive) e.currentTarget.style.color = TEXT_ACTIVE; }}
                                  onMouseLeave={(e) => { if (!subActive) e.currentTarget.style.color = '#94A3B8'; }}
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
        className="p-3"
        style={{ borderTop: `1px solid ${BORDER_COL}`, background: SIDEBAR_BG }}
      >
        <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:hidden">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #A25DDC 100%)' }}
          >
            {(user?.email?.[0] || 'K').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-crm-ink truncate">{user?.email}</div>
            {role && (
              <div className="text-[10px] uppercase tracking-[0.10em] text-crm-ink-subtle mt-0.5">
                {role === 'admin' ? 'Admin' : role === 'commerciale' ? 'Commerciale' : 'Posatore'}
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            title="Esci"
            className="w-7 h-7 rounded-crm-sm inline-flex items-center justify-center text-crm-ink-subtle hover:text-crm-danger hover:bg-crm-danger-soft transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={handleSignOut}
          title="Esci"
          className="hidden group-data-[collapsible=icon]:flex w-full h-8 items-center justify-center rounded-crm-sm text-crm-ink-subtle hover:text-crm-danger hover:bg-crm-danger-soft transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;

