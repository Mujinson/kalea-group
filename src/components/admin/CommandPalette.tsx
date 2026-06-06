import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  UserPlus,
  Kanban,
  CalendarClock,
  Users,
  Map,
  Image as ImageIcon,
  HardHat,
  FileText,
  ShoppingCart,
  Package,
  BarChart3,
  DollarSign,
  CreditCard,
  Settings,
  Upload,
  ListOrdered,
  Bot,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Entry {
  label: string;
  group: string;
  url: string;
  icon: any;
  adminOnly?: boolean;
  keywords?: string;
}

const entries: Entry[] = [
  { label: 'Dashboard', group: 'Generale', url: '/admin', icon: LayoutDashboard },
  // Lead
  { label: 'Lista lead', group: 'Lead', url: '/admin/leads', icon: UserPlus },
  { label: 'Pipeline', group: 'Lead', url: '/admin/pipeline', icon: Kanban },
  { label: 'Appuntamenti', group: 'Lead', url: '/admin/appuntamenti', icon: CalendarClock },
  { label: 'Chatbot', group: 'Lead', url: '/admin/chatbot', icon: Bot, adminOnly: true },
  // Clienti
  { label: 'Lista clienti', group: 'Clienti', url: '/admin/clienti', icon: Users },
  { label: 'Mappa clienti', group: 'Clienti', url: '/admin/mappa', icon: Map },
  { label: 'Media', group: 'Clienti', url: '/admin/media', icon: ImageIcon },
  // Commerciale
  { label: 'Vendite', group: 'Commerciale', url: '/admin/vendite', icon: ShoppingCart, adminOnly: true },
  { label: 'Preventivi', group: 'Commerciale', url: '/admin/preventivi', icon: FileText },
  { label: 'Nuovo preventivo', group: 'Commerciale', url: '/admin/preventivi/nuovo', icon: FileText, keywords: 'crea quote' },
  // Cantieri
  { label: 'Dashboard cantieri', group: 'Cantieri', url: '/admin/cantieri-dashboard', icon: LayoutDashboard, adminOnly: true },
  { label: 'Lista cantieri', group: 'Cantieri', url: '/admin/cantieri', icon: HardHat },
  { label: 'Operai & Ore', group: 'Cantieri', url: '/admin/cantieri-operai', icon: Users, adminOnly: true, keywords: 'workers ore lavorate' },
  { label: 'Materiali cantieri', group: 'Cantieri', url: '/admin/cantieri-materiali', icon: ListOrdered, adminOnly: true },
  { label: 'Budget vs Consuntivo', group: 'Cantieri', url: '/admin/cantieri-budget', icon: DollarSign, adminOnly: true },
  { label: 'Report cantieri', group: 'Cantieri', url: '/admin/cantieri-report', icon: BarChart3, adminOnly: true },
  // Magazzino
  { label: 'Catalogo prodotti', group: 'Magazzino', url: '/admin/catalogo', icon: Package, adminOnly: true },
  { label: 'Lista articoli', group: 'Magazzino', url: '/admin/magazzino', icon: ListOrdered, adminOnly: true },
  // Finanza
  { label: 'Costi', group: 'Finanza', url: '/admin/costi', icon: DollarSign, adminOnly: true },
  { label: 'Pagamenti', group: 'Finanza', url: '/admin/pagamenti', icon: CreditCard, adminOnly: true },
  { label: 'Analytics', group: 'Statistiche', url: '/admin/analytics', icon: BarChart3, adminOnly: true },
  // Impostazioni
  { label: 'Impostazioni', group: 'Impostazioni', url: '/admin/impostazioni', icon: Settings, adminOnly: true },
  { label: 'Import dati', group: 'Impostazioni', url: '/admin/import', icon: Upload, adminOnly: true },
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { role } = useAdminAuth();
  const isAdmin = role === 'admin';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const visible = entries.filter((e) => isAdmin || !e.adminOnly);
  const groups = Array.from(new Set(visible.map((e) => e.group)));

  const go = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Cerca pagine, azioni, sezioni…" />
      <CommandList>
        <CommandEmpty>Nessun risultato.</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g} heading={g}>
            {visible
              .filter((e) => e.group === g)
              .map((e) => (
                <CommandItem
                  key={e.url}
                  value={`${e.label} ${e.group} ${e.keywords || ''}`}
                  onSelect={() => go(e.url)}
                >
                  <e.icon className="w-4 h-4 mr-2 text-[#8A7060]" />
                  <span>{e.label}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
