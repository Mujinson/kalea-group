import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  breadcrumb?: string[];
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Sticky tabs strip rendered below the title */
  tabs?: ReactNode;
  className?: string;
}

/**
 * Monday/Attio-style bright page header.
 * White surface, large title, breadcrumb + actions row, optional tabs underline.
 */
export function PageHeader({ breadcrumb, title, subtitle, actions, tabs, className }: PageHeaderProps) {
  return (
    <div className={cn("animate-crm-fade-up", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.10em] text-crm-ink-subtle mb-2">
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
          {subtitle && (
            <p className="text-[13px] text-crm-ink-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex gap-2 flex-wrap shrink-0">{actions}</div>}
      </div>

      {tabs && (
        <div className="mt-4 border-b border-crm-border flex items-end gap-1 overflow-x-auto scrollbar-hide">
          {tabs}
        </div>
      )}
    </div>
  );
}

interface PageTabProps {
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
}

export function PageTab({ active, onClick, icon, count, children }: PageTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 h-10 px-3 text-[13px] font-medium whitespace-nowrap transition-colors",
        active
          ? "text-crm-primary"
          : "text-crm-ink-muted hover:text-crm-ink",
      )}
    >
      {icon}
      <span>{children}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-1 inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold",
            active
              ? "bg-crm-primary-soft text-crm-primary"
              : "bg-crm-bg-soft text-crm-ink-muted",
          )}
        >
          {count}
        </span>
      )}
      <span
        className={cn(
          "absolute left-0 right-0 -bottom-px h-[2px] rounded-full transition-opacity",
          active ? "bg-crm-primary opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}

export default PageHeader;
