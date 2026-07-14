import { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Monday-style toolbar row: pill buttons + search + filter + sort.
 * White surface, soft shadow, generous height, coherent gaps.
 */
interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function CrmToolbar({ children, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        "crm-card px-3 py-2.5 flex flex-wrap items-center gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ToolbarSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function ToolbarSearch({ value, onChange, placeholder = "Cerca…", className }: ToolbarSearchProps) {
  return (
    <div className={cn("relative flex-1 min-w-[200px] max-w-sm", className)}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-crm-ink-subtle pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-3 rounded-crm-sm border border-crm-border bg-white text-[13px] placeholder:text-crm-ink-subtle focus:outline-none focus:border-crm-primary focus:shadow-[0_0_0_3px_var(--crm-primary-glow)] transition"
      />
    </div>
  );
}

interface ToolbarButtonProps {
  onClick?: () => void;
  icon?: ReactNode;
  active?: boolean;
  variant?: "default" | "primary" | "ghost";
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}

export function ToolbarButton({
  onClick, icon, active, variant = "default", disabled, children, className, type = "button",
}: ToolbarButtonProps) {
  const base =
    "inline-flex items-center gap-1.5 h-9 px-3 rounded-crm-sm text-[13px] font-medium transition disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";
  const styles =
    variant === "primary"
      ? "bg-crm-primary text-white hover:bg-crm-primary-600 shadow-[0_1px_2px_rgba(79,70,229,0.24)]"
      : variant === "ghost"
        ? "text-crm-ink-muted hover:text-crm-ink hover:bg-crm-bg-soft"
        : active
          ? "bg-crm-primary-soft text-crm-primary border border-crm-primary/20"
          : "bg-white text-crm-ink-muted border border-crm-border hover:text-crm-ink hover:border-crm-border-strong hover:bg-crm-bg-soft";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, styles, className)}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default CrmToolbar;
