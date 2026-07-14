import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CrmEmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6 animate-crm-fade-up",
        className,
      )}
    >
      <div
        className="w-14 h-14 rounded-full inline-flex items-center justify-center mb-4"
        style={{ background: "var(--crm-primary-soft)", color: "var(--crm-primary)" }}
      >
        {icon ?? <Inbox className="w-6 h-6" />}
      </div>
      <div className="text-[15px] font-semibold text-crm-ink">{title}</div>
      {description && (
        <div className="text-[13px] text-crm-ink-muted mt-1 max-w-md">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default CrmEmptyState;
