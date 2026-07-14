import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiTone = "primary" | "success" | "warning" | "danger" | "info" | "purple" | "teal" | "neutral";

const ACCENT: Record<KpiTone, { icon: string; iconBg: string; delta: string }> = {
  primary: { icon: "var(--crm-primary)", iconBg: "var(--crm-primary-soft)", delta: "var(--crm-primary)" },
  success: { icon: "var(--crm-success)", iconBg: "var(--crm-success-soft)", delta: "var(--crm-success)" },
  warning: { icon: "var(--crm-warning)", iconBg: "var(--crm-warning-soft)", delta: "var(--crm-warning)" },
  danger:  { icon: "var(--crm-danger)",  iconBg: "var(--crm-danger-soft)",  delta: "var(--crm-danger)"  },
  info:    { icon: "var(--crm-info)",    iconBg: "var(--crm-info-soft)",    delta: "var(--crm-info)"    },
  purple:  { icon: "var(--crm-purple)",  iconBg: "var(--crm-purple-soft)",  delta: "var(--crm-purple)"  },
  teal:    { icon: "var(--crm-teal)",    iconBg: "var(--crm-teal-soft)",    delta: "var(--crm-teal)"    },
  neutral: { icon: "#64748B",             iconBg: "#F1F5F9",                  delta: "#64748B"           },
};

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: KpiTone;
  delta?: { value: string | number; direction?: "up" | "down" | "flat"; label?: string };
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  /** Small area rendered under the value (mini chart, progress, etc.) */
  footer?: ReactNode;
}

export function KpiCard({
  label, value, hint, icon, tone = "primary", delta, onClick, loading, className, footer,
}: Props) {
  const accent = ACCENT[tone];
  const clickable = !!onClick;

  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cn(
        "group crm-card p-5 flex flex-col gap-3 animate-crm-fade-up",
        clickable && "cursor-pointer crm-card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-crm-ink-muted">
            {label}
          </p>
        </div>
        {icon && (
          <div
            className="w-9 h-9 rounded-crm-sm inline-flex items-center justify-center shrink-0"
            style={{ background: accent.iconBg, color: accent.icon }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="min-h-[44px] flex items-end">
        {loading ? (
          <div className="crm-shimmer h-9 w-32 rounded-md" />
        ) : (
          <div className="text-[34px] leading-none font-bold tabular-nums text-crm-ink">
            {value}
          </div>
        )}
      </div>

      {(delta || hint) && (
        <div className="flex items-center gap-2 text-[12px] text-crm-ink-muted">
          {delta && (
            <span
              className="inline-flex items-center gap-0.5 font-semibold"
              style={{ color: accent.delta }}
            >
              {delta.direction === "down" ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : delta.direction === "flat" ? (
                <Minus className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              {delta.value}
            </span>
          )}
          {delta?.label && <span className="text-crm-ink-subtle">{delta.label}</span>}
          {hint && <span>{hint}</span>}
        </div>
      )}

      {footer && <div className="pt-1">{footer}</div>}
    </div>
  );
}

export default KpiCard;
