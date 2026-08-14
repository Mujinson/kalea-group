import { useState } from "react";
import { ChevronDown, Loader2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { StatusPill, StatusTone } from "./StatusPill";

export interface StatusOption<T extends string = string> {
  value: T;
  label: string;
  tone?: StatusTone;
}

interface Props<T extends string = string> {
  value: T;
  options: StatusOption<T>[];
  onChange: (value: T) => void | Promise<void>;
  size?: "sm" | "md";
  disabled?: boolean;
  fallbackLabel?: string;
  className?: string;
}

/**
 * Pill di stato cliccabile: apre un menu con gli stati disponibili
 * e chiama `onChange` con quello scelto (persistenza a carico del chiamante).
 */
export function StatusSelectPill<T extends string = string>({
  value,
  options,
  onChange,
  size = "sm",
  disabled,
  fallbackLabel,
  className,
}: Props<T>) {
  const [busy, setBusy] = useState(false);
  const current = options.find((o) => o.value === value);

  const handle = async (next: T) => {
    if (next === value) return;
    setBusy(true);
    try {
      await onChange(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || busy}>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1 rounded-md transition-opacity",
            disabled ? "cursor-default" : "cursor-pointer hover:opacity-85",
            className,
          )}
          title="Clicca per cambiare stato"
        >
          <StatusPill size={size} tone={current?.tone ?? "neutral"}>
            <span className="inline-flex items-center gap-1">
              {current?.label ?? fallbackLabel ?? value ?? "—"}
              {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : !disabled && <ChevronDown className="w-3 h-3" />}
            </span>
          </StatusPill>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[190px] bg-popover text-popover-foreground">
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onSelect={(e) => {
              e.preventDefault();
              void handle(o.value);
            }}
            className="gap-2 text-[13px] font-medium text-foreground"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: TONE_DOT[o.tone ?? "neutral"] }}
            />
            <span className="flex-1 truncate">{o.label}</span>
            {o.value === value && <Check className="w-3.5 h-3.5 ml-auto text-crm-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>

    </DropdownMenu>
  );
}

export const PAID_OPTIONS: StatusOption<"paid" | "unpaid">[] = [
  { value: "unpaid", label: "Da pagare", tone: "danger" },
  { value: "paid", label: "Pagato", tone: "success" },
];

export default StatusSelectPill;
