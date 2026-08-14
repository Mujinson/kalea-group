import { ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { statusMeta, LEAD_STATUSES } from './leadConstants';

interface Props {
  status: string;
  /** Se presente, il badge diventa cliccabile e permette di cambiare stato. */
  onChange?: (value: string) => void | Promise<void>;
}

export function LeadStatusBadge({ status, onChange }: Props) {
  const s = statusMeta(status);
  const pill = (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
      {onChange && <ChevronDown className="w-3 h-3 opacity-70" />}
    </span>
  );

  if (!onChange) return pill;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" onClick={(e) => e.stopPropagation()} className="cursor-pointer hover:opacity-85" title="Clicca per cambiare stato">
          {pill}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {LEAD_STATUSES.map((o) => (
          <DropdownMenuItem
            key={o.value}
            className="gap-2"
            onSelect={(e) => { e.preventDefault(); void onChange(o.value); }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: o.dot }} />
            {o.label}
            {o.value === s.value && <Check className="w-3.5 h-3.5 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
