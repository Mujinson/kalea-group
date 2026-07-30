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
import { supabase } from '@/integrations/supabase/client';

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

type Hit = { id: string; label: string; sub?: string; url: string };
type Hits = { customers: Hit[]; leads: Hit[]; products: Hit[]; quotes: Hit[]; sites: Hit[] };
const emptyHits: Hits = { customers: [], leads: [], products: [], quotes: [], sites: [] };

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hits>(emptyHits);
  const [searching, setSearching] = useState(false);
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

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setHits(emptyHits); setSearching(false); return; }
    setSearching(true);
    let cancelled = false;
    const t = setTimeout(async () => {
      const like = `%${q}%`;
      const [cust, leads, prods, quotes, sites] = await Promise.all([
        supabase.from('customers').select('id, first_name, last_name, company_name, email').or(`first_name.ilike.${like},last_name.ilike.${like},company_name.ilike.${like},email.ilike.${like}`).limit(5),
        supabase.from('leads').select('id, name, email, phone, city').or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like}`).limit(5),
        supabase.from('catalog_products').select('id, product_code, name, brand').or(`product_code.ilike.${like},name.ilike.${like},brand.ilike.${like}`).limit(5),
        supabase.from('quotes').select('id, quote_number, subject, project_name, total_amount').or(`quote_number.ilike.${like},subject.ilike.${like},project_name.ilike.${like}`).limit(5),
        supabase.from('construction_sites').select('id, title, city').or(`title.ilike.${like},city.ilike.${like}`).limit(5),
      ]);
      if (cancelled) return;
      setHits({
        customers: (cust.data || []).map((c: any) => ({
          id: c.id,
          label: c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Cliente',
          sub: c.email || undefined,
          url: `/admin/clienti?id=${c.id}`,
        })),
        leads: (leads.data || []).map((l: any) => ({
          id: l.id, label: l.name || 'Lead', sub: [l.email, l.phone, l.city].filter(Boolean).join(' · '),
          url: `/admin/leads?id=${l.id}`,
        })),
        products: (prods.data || []).map((p: any) => ({
          id: p.id, label: `${p.product_code || ''} ${p.name || ''}`.trim(), sub: p.brand || undefined,
          url: `/admin/catalogo?q=${encodeURIComponent(p.product_code || p.name || '')}`,
        })),
        quotes: (quotes.data || []).map((q2: any) => ({
          id: q2.id, label: q2.quote_number || q2.subject || 'Preventivo',
          sub: q2.project_name || (q2.total_amount ? `€${Number(q2.total_amount).toLocaleString('it-IT')}` : undefined),
          url: `/admin/preventivi?id=${q2.id}`,
        })),
        sites: (sites.data || []).map((s: any) => ({
          id: s.id, label: s.title || 'Cantiere', sub: s.city || undefined, url: `/admin/cantieri/${s.id}`,
        })),
      });
      setSearching(false);
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const visible = entries.filter((e) => isAdmin || !e.adminOnly);
  const groups = Array.from(new Set(visible.map((e) => e.group)));

  const go = (url: string) => {
    setOpen(false);
    setQuery('');
    navigate(url);
  };

  const dbGroups: { heading: string; icon: any; items: Hit[] }[] = [
    { heading: 'Clienti', icon: Users, items: hits.customers },
    { heading: 'Lead', icon: UserPlus, items: hits.leads },
    { heading: 'Prodotti', icon: Package, items: hits.products },
    { heading: 'Preventivi', icon: FileText, items: hits.quotes },
    { heading: 'Cantieri', icon: HardHat, items: hits.sites },
  ].filter((g) => g.items.length > 0);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Cerca clienti, lead, prodotti, preventivi, cantieri…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{searching ? 'Ricerca…' : 'Nessun risultato.'}</CommandEmpty>
        {dbGroups.map((g) => (
          <CommandGroup key={g.heading} heading={g.heading}>
            {g.items.map((h) => (
              <CommandItem key={h.id} value={`${g.heading} ${h.label} ${h.sub || ''} ${query}`} onSelect={() => go(h.url)}>
                <g.icon className="w-4 h-4 mr-2 text-[#8A7060]" />
                <span className="truncate">{h.label}</span>
                {h.sub && <span className="ml-2 text-xs text-muted-foreground truncate">{h.sub}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
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
