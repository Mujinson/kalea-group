import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

/**
 * CRM page shell components — Creatio-inspired dense aesthetic.
 * - CrmPageHeader: indigo banner with breadcrumb + title + actions
 * - CrmKpiTile: large saturated tile with big white number + label inside
 * - CrmKpiRow: responsive wrapper grid
 * - CrmFilterBar: white rounded filter strip
 */

export type CrmTileColor =
  | "indigo" | "blue" | "cyan" | "teal" | "green" | "emerald"
  | "amber" | "orange" | "red" | "pink" | "purple" | "slate";

const TILE_BG: Record<CrmTileColor, string> = {
  indigo: "linear-gradient(135deg,#4F46E5,#6366F1)",
  blue:   "linear-gradient(135deg,#2563EB,#3B82F6)",
  cyan:   "linear-gradient(135deg,#0891B2,#06B6D4)",
  teal:   "linear-gradient(135deg,#0D9488,#14B8A6)",
  green:  "linear-gradient(135deg,#16A34A,#22C55E)",
  emerald:"linear-gradient(135deg,#059669,#10B981)",
  amber:  "linear-gradient(135deg,#D97706,#F59E0B)",
  orange: "linear-gradient(135deg,#EA580C,#F97316)",
  red:    "linear-gradient(135deg,#DC2626,#EF4444)",
  pink:   "linear-gradient(135deg,#DB2777,#EC4899)",
  purple: "linear-gradient(135deg,#7C3AED,#A855F7)",
  slate:  "linear-gradient(135deg,#475569,#64748B)",
};

interface CrmPageHeaderProps {
  breadcrumb?: string[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function CrmPageHeader({ breadcrumb, title, subtitle, actions }: CrmPageHeaderProps) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      style={{
        background: "linear-gradient(120deg,#1E1B4B 0%,#2A1F5C 55%,#312866 100%)",
        boxShadow: "0 4px 18px -8px rgba(30,27,75,0.45)",
      }}
    >
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-white/55 mb-1">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === breadcrumb.length - 1 ? "text-white/80" : ""}>{b}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-[22px] md:text-2xl font-bold text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-white/65 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap shrink-0">{actions}</div>}
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

export function CrmKpiTile({ label, value, color = "indigo", icon, hint, onClick }: CrmKpiTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl p-4 text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-100"
      style={{
        background: TILE_BG[color],
        boxShadow: "0 6px 18px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/85 leading-tight">{label}</p>
        {icon && <div className="text-white/85">{icon}</div>}
      </div>
      <div className="mt-2 text-[28px] md:text-[32px] leading-none font-extrabold tabular-nums">{value}</div>
      {hint && <div className="mt-1.5 text-[11px] text-white/80">{hint}</div>}
    </button>
  );
}

export function CrmKpiRow({ children, cols }: { children: ReactNode; cols?: number }) {
  const gridCols =
    cols === 6 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
    : cols === 5 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
    : cols === 3 ? "grid-cols-1 sm:grid-cols-3"
    : "grid-cols-2 md:grid-cols-4";
  return <div className={`grid ${gridCols} gap-3`}>{children}</div>;
}

export function CrmFilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-[#E7E3DA] px-3 py-2.5 flex flex-col md:flex-row gap-2 md:items-center shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      {children}
    </div>
  );
}

export function CrmTableCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-[#E7E3DA] overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      {children}
    </div>
  );
}
