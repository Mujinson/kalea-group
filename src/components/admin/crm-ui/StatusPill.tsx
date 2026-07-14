import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Monday-style status pill: filled solid color, white uppercase text, small radius.
 * Use `tone` for a semantic color, or pass explicit `color` (hex/rgb) for arbitrary values.
 */
export type StatusTone =
  | "success" | "warning" | "danger" | "info"
  | "primary" | "purple" | "teal" | "pink"
  | "amber"   | "slate"   | "sky"    | "neutral";

const TONE_MAP: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: "var(--crm-success)", fg: "#fff" },
  warning: { bg: "var(--crm-warning)", fg: "#fff" },
  danger:  { bg: "var(--crm-danger)",  fg: "#fff" },
  info:    { bg: "var(--crm-info)",    fg: "#fff" },
  primary: { bg: "var(--crm-primary)", fg: "#fff" },
  purple:  { bg: "var(--crm-purple)",  fg: "#fff" },
  teal:    { bg: "var(--crm-teal)",    fg: "#fff" },
  pink:    { bg: "#F472B6",            fg: "#fff" },
  amber:   { bg: "#F59E0B",            fg: "#fff" },
  sky:     { bg: "#0EA5E9",            fg: "#fff" },
  slate:   { bg: "#64748B",            fg: "#fff" },
  neutral: { bg: "#E2E8F0",            fg: "#334155" },
};

interface Props {
  tone?: StatusTone;
  color?: string;
  bg?: string;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

export function StatusPill({ tone = "primary", color, bg, size = "md", className, children }: Props) {
  const t = TONE_MAP[tone];
  const height = size === "sm" ? "h-5 text-[10px] px-2" : "h-6 text-[11px] px-2.5";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-semibold uppercase tracking-wider rounded-md whitespace-nowrap leading-none",
        height,
        className,
      )}
      style={{ background: bg ?? t.bg, color: color ?? t.fg }}
    >
      {children}
    </span>
  );
}

export default StatusPill;
