import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CRM page primitives — Monday/Linear premium SaaS aesthetic (v2).
 *
 * The v1 API is kept: `CrmPageHeader`, `CrmKpiTile`, `CrmKpiRow`,
 * `CrmFilterBar`, `CrmTableCard`. Visuals now derive from the
 * `.admin-theme` token layer so the entire CRM reads as one product.
 *
 * For new work prefer the primitives in `src/components/admin/crm-ui/`.
 */

export type CrmTileColor =
  | "indigo" | "blue" | "cyan" | "teal" | "green" | "emerald"
  | "amber" | "orange" | "red" | "pink" | "purple" | "slate";

const TILE_ACCENT: Record<CrmTileColor, { fg: string; bg: string; ring: string }> = {
  indigo:  { fg: "#4F46E5", bg: "#EEF2FF", ring: "rgba(79,70,229,0.18)" },
  blue:    { fg: "#2563EB", bg: "#DBEAFE", ring: "rgba(37,99,235,0.18)" },
  cyan:    { fg: "#0891B2", bg: "#CFFAFE", ring: "rgba(8,145,178,0.18)" },
  teal:    { fg: "#00A3BF", bg: "#CFEEF3", ring: "rgba(0,163,191,0.18)" },
  green:   { fg: "#16A34A", bg: "#DCFCE7", ring: "rgba(22,163,74,0.18)" },
  emerald: { fg: "#059669", bg: "#D1FAE5", ring: "rgba(5,150,105,0.18)" },
  amber:   { fg: "#D97706", bg: "#FEF3C7", ring: "rgba(217,119,6,0.18)" },
  orange:  { fg: "#EA580C", bg: "#FFEDD5", ring: "rgba(234,88,12,0.18)" },
  red:     { fg: "#E44258", bg: "#FCD9DE", ring: "rgba(228,66,88,0.18)" },
  pink:    { fg: "#DB2777", bg: "#FCE7F3", ring: "rgba(219,39,119,0.18)" },
  purple:  { fg: "#A25DDC", bg: "#EEDCFB", ring: "rgba(162,93,220,0.18)" },
  slate:   { fg: "#475569", bg: "#F1F5F9", ring: "rgba(71,85,105,0.18)" },
};

interface CrmPageHeaderProps {
  breadcrumb?: string[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/** Monday-bright page header. White surface, dark title, breadcrumb, actions. */
export function CrmPageHeader({ breadcrumb, title, subtitle, actions, className }: CrmPageHeaderProps) {
  return (
    <div className={cn("animate-crm-fade-up", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.10em] text-crm-ink-subtle mb-1.5">
          {breadcrumb.map((b, i) => (
            <span
              key={i}
              className={cn(
                "flex items-center gap-1",
                i === breadcrumb.length - 1 ? "text-crm-ink-muted font-semibold" : "text-crm-ink-subtle",
              )}
            >
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span>{b}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[24px] leading-tight font-semibold text-crm-ink truncate">{title}</h1>
          {subtitle && <p className="text-[13px] text-crm-ink-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2 flex-wrap shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

interface CrmKpiTileProps {
  label: string;
  value: ReactNode;
  color?: CrmTileColor;
  icon?: ReactNode;
  hint?: ReactNode;
  onClick?: () => void;
}

/**
 * KPI tile — white card, subtle colored accent (soft chip for icon),
 * big number, tiny label. Replaces the old saturated gradient tile.
 */
export function CrmKpiTile({ label, value, color = "indigo", icon, hint, onClick }: CrmKpiTileProps) {
  const accent = TILE_ACCENT[color];
  const clickable = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        "text-left crm-card p-4 flex flex-col gap-2 animate-crm-fade-up disabled:cursor-default",
        clickable && "crm-card-hover cursor-pointer",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.10em] text-crm-ink-muted leading-tight">
          {label}
        </p>
        {icon && (
          <div
            className="w-8 h-8 rounded-crm-sm inline-flex items-center justify-center shrink-0"
            style={{ background: accent.bg, color: accent.fg }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="text-[28px] md:text-[30px] leading-none font-bold tabular-nums text-crm-ink mt-1">
        {value}
      </div>
      {hint && <div className="text-[11.5px] text-crm-ink-muted">{hint}</div>}
    </button>
  );
}

export function CrmKpiRow({ children, cols }: { children: ReactNode; cols?: number }) {
  const gridCols =
    cols === 7 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-7"
    : cols === 6 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
    : cols === 5 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
    : cols === 3 ? "grid-cols-1 sm:grid-cols-3"
    : "grid-cols-2 md:grid-cols-4";
  return <div className={`grid ${gridCols} gap-3`}>{children}</div>;
}

export function CrmFilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="crm-card px-3 py-2.5 flex flex-col md:flex-row gap-2 md:items-center">
      {children}
    </div>
  );
}

export function CrmTableCard({ children }: { children: ReactNode }) {
  return (
    <div className="crm-card overflow-hidden">
      {children}
    </div>
  );
}
