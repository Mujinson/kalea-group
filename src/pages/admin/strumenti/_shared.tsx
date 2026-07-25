import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';

// ─────────────────────────────────────────────────────────────
// PRICING CATALOG — fonte unica: catalog_products (Supabase)
// ─────────────────────────────────────────────────────────────

export type PricingCatalogKey =
  | 'flow'
  | 'kronos'
  | 'berryalloc'
  | 'parquet'
  | 'signature'
  | 'externo';

export type PricingCatalogRow = {
  id: string;
  nome: string;
  dims: string;
  listino: number;
  unita: string;
  collection: string;
  brand: string;
  is_accessory: boolean;
};

// Match case-insensitive per listino. `parquet` esclude Signature
// (Woodco pubblica Signature come brand/collezione dedicata).
export const PRICING_BRAND_MATCH: Record<
  PricingCatalogKey,
  (brand: string, collection: string) => boolean
> = {
  flow: (b, c) => b.includes('flow') || c.includes('flow'),
  kronos: (b) => b.includes('kronos'),
  berryalloc: (b, c) => b.includes('berry') || c.includes('berry'),
  parquet: (b, c) =>
    (b.includes('woodco') || c.includes('parquet')) &&
    !b.includes('signature') &&
    !c.includes('signature'),
  signature: (b, c) => b.includes('signature') || c.includes('signature'),
  externo: (b, c) => b.includes('externo') || c.includes('externo'),
};

const ACCESSORY_RX =
  /accessor|batti|profilo|clip|vite|piedino|cleaner|colla|ardex|nylon|isoldrum|barriera|fascia|giunto|tappo|paragradino|livellante|magatello|piastr(a|ine)/i;

export function usePricingCatalog(key: PricingCatalogKey) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PricingCatalogRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('catalog_products')
        .select(
          'product_code, name, collection, format, list_price, unit_of_measure, is_active, catalog_brands(name)'
        )
        .eq('is_active', true)
        .gt('list_price', 0)
        .order('name');
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setRows([]);
        setLoading(false);
        return;
      }
      const match = PRICING_BRAND_MATCH[key];
      const mapped: PricingCatalogRow[] = (data ?? [])
        .map((p: any) => {
          const brandName = String(p.catalog_brands?.name ?? '');
          const collection = String(p.collection ?? '');
          const name = String(p.name ?? '');
          return {
            id: String(p.product_code ?? name),
            nome: name,
            dims: String(p.format ?? ''),
            listino: Number(p.list_price ?? 0),
            unita: String(p.unit_of_measure ?? 'mq'),
            collection,
            brand: brandName,
            is_accessory: ACCESSORY_RX.test(`${collection} ${name}`),
            _brandLc: brandName.toLowerCase(),
            _colLc: collection.toLowerCase(),
          } as any;
        })
        .filter((r: any) => match(r._brandLc, r._colLc));
      setRows(mapped);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return {
    prodotti: rows.filter((r) => !r.is_accessory),
    accessori: rows.filter((r) => r.is_accessory),
    loading,
    error,
  };
}

export function PricingLoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E0DDD8',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 16,
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 32,
            background:
              'linear-gradient(90deg,#F1F5F9 0%,#E5E7EB 50%,#F1F5F9 100%)',
            backgroundSize: '200% 100%',
            animation: 'pricingShimmer 1.4s infinite',
            borderRadius: 6,
            marginBottom: 8,
          }}
        />
      ))}
      <style>{`@keyframes pricingShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

export function PricingEmptyState({ label }: { label?: string }) {
  return (
    <div
      style={{
        background: '#FAEEDA',
        border: '1px solid #EF9F27',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 16,
        fontSize: 13,
        color: '#633806',
        lineHeight: 1.6,
      }}
    >
      Nessun prodotto trovato nel catalogo per questo listino{label ? ` (${label})` : ''} — verifica i brand in <strong>Catalogo → Marche</strong> e che i prodotti siano attivi con un listino {'>'} 0.
    </div>
  );
}

export function useCreaPreventivoLink() {
  const navigate = useNavigate();
  return (productCode: string) =>
    navigate(`/admin/preventivi/nuovo?product_code=${encodeURIComponent(productCode)}`);
}

// ─────────────────────────────────────────────────────────────
// BRAND PRICING RULES — sconto fornitore + markup salvati per
// brand nella tabella public.pricing_rules. Fonte unica condivisa
// tra le pagine Pricing e CreaPreventivo.
// ─────────────────────────────────────────────────────────────

type ScontoOpt = { coeff: number };

function nearestScontoIdx(table: ScontoOpt[], coeff: number): number {
  let best = 0, bestDiff = Infinity;
  table.forEach((s, i) => {
    const d = Math.abs(s.coeff - coeff);
    if (d < bestDiff) { bestDiff = d; best = i; }
  });
  return best;
}

async function resolveBrandIdForKey(key: PricingCatalogKey): Promise<string | null> {
  const { data } = await supabase
    .from('catalog_brands')
    .select('id, name')
    .order('name');
  const match = PRICING_BRAND_MATCH[key];
  const found = (data ?? []).find((b: any) => match(String(b.name ?? '').toLowerCase(), ''));
  return found?.id ?? null;
}

export function useBrandPricingRule<
  S extends { scontoIdx: number; markup: number; [k: string]: unknown }
>(key: PricingCatalogKey, scontoTable: ScontoOpt[], defaults: S) {
  const [settings, setSettings] = useState<S>(defaults);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const bid = await resolveBrandIdForKey(key);
      if (cancelled) return;
      setBrandId(bid);
      if (!bid) { setLoading(false); return; }
      const { data } = await supabase
        .from('pricing_rules')
        .select('supplier_discount_pct, markup_pct')
        .eq('brand_id', bid)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const coeff = data.supplier_discount_pct != null
          ? Number(data.supplier_discount_pct) / 100
          : scontoTable[defaults.scontoIdx].coeff;
        setSettings((prev) => ({
          ...prev,
          scontoIdx: nearestScontoIdx(scontoTable, coeff),
          markup: data.markup_pct != null ? Number(data.markup_pct) : prev.markup,
        }));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = async (partial: Partial<S>) => {
    const next = { ...settings, ...partial } as S;
    setSettings(next);
    if (!brandId) return;
    const coeff = scontoTable[next.scontoIdx]?.coeff ?? scontoTable[0].coeff;
    await supabase.from('pricing_rules').upsert({
      brand_id: brandId,
      supplier_discount_pct: Math.round(coeff * 1000) / 10, // 0.45 → 45.0
      markup_pct: next.markup,
      role: 'brand', // required NOT NULL originally; keep a marker
    }, { onConflict: 'brand_id' });
  };

  return { settings, update, brandId, loading };
}

// Map brandName-lowercase → { coeff, markupMult } for CreaPreventivo
export async function fetchBrandPricingMap(): Promise<
  Record<string, { coeff: number; markupMult: number }>
> {
  const { data } = await supabase
    .from('pricing_rules')
    .select('brand_id, supplier_discount_pct, markup_pct, catalog_brands(name)');
  const map: Record<string, { coeff: number; markupMult: number }> = {};
  (data ?? []).forEach((r: any) => {
    const name = String(r.catalog_brands?.name ?? '').toLowerCase().trim();
    if (!name) return;
    const coeff = r.supplier_discount_pct != null ? Number(r.supplier_discount_pct) / 100 : NaN;
    const markupMult = r.markup_pct != null ? 1 + Number(r.markup_pct) / 100 : NaN;
    if (Number.isFinite(coeff) || Number.isFinite(markupMult)) {
      map[name] = {
        coeff: Number.isFinite(coeff) ? coeff : 0.5,
        markupMult: Number.isFinite(markupMult) ? markupMult : 2.0,
      };
    }
  });
  return map;
}



export const fmtEur = (n: number) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

export const fmtPct = (n: number) =>
  `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;

export const fmtNum = (n: number, d = 0) =>
  new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Number.isFinite(n) ? n : 0);

export function ToolPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1
          className="font-heading text-[26px] leading-tight"
          style={{ color: '#3B2314' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] mt-1" style={{ color: '#8A7060' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function ToolCard({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 ${className}`}
      style={{ borderColor: 'rgba(59,35,20,0.10)' }}
    >
      {title && (
        <h3
          className="text-[12px] uppercase tracking-[0.12em] mb-4"
          style={{ color: '#8A7060' }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'gold' | 'green' | 'red' | 'neutral';
}) {
  const color =
    accent === 'gold'
      ? '#C8A96E'
      : accent === 'green'
        ? '#3F7A4E'
        : accent === 'red'
          ? '#A8443C'
          : '#3B2314';
  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'rgba(59,35,20,0.10)', background: '#FFFFFF' }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.12em] mb-1"
        style={{ color: '#8A7060' }}
      >
        {label}
      </div>
      <div className="font-heading text-[22px]" style={{ color }}>
        {value}
      </div>
      {hint && (
        <div className="text-[11px] mt-1" style={{ color: '#8A7060' }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '€',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[13px]" style={{ color: '#3B2314' }}>
          {label}
        </label>
        <span
          className="text-[13px] font-medium tabular-nums"
          style={{ color: '#3B2314' }}
        >
          {suffix === '€' ? fmtEur(value) : `${fmtNum(value, step < 1 ? 2 : 0)} ${suffix}`}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
