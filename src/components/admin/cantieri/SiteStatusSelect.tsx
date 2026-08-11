import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SITE_STATUSES, normalizeSiteStatus, siteStatusLabel, siteStatusClasses } from '@/lib/siteStatus';

const CUSTOM = '__custom__';

interface Props {
  siteId: string;
  status?: string | null;
  className?: string;
  size?: 'sm' | 'md';
}

/** Select stato cantiere: salva subito su DB e aggiorna tutte le viste collegate. */
const SiteStatusSelect = ({ siteId, status, className = '', size = 'md' }: Props) => {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const current = normalizeSiteStatus(status);
  const isPreset = SITE_STATUSES.some((s) => s.value === current);

  const persist = async (value: string) => {
    setSaving(true);
    const { error } = await supabase.from('construction_sites').update({ status: value }).eq('id', siteId);
    setSaving(false);
    if (error) { toast.error(`Errore: ${error.message}`); return; }
    toast.success(`Stato aggiornato: ${siteStatusLabel(value)}`);
    qc.invalidateQueries({ queryKey: ['construction-sites'] });
    qc.invalidateQueries({ queryKey: ['construction-site', siteId] });
    qc.invalidateQueries({ queryKey: ['cantieri-sites'] });
    qc.invalidateQueries();
  };

  const onChange = (v: string) => {
    if (v === CUSTOM) { setCustomValue(isPreset ? '' : (status || '')); setCustomOpen(true); return; }
    persist(v);
  };

  if (customOpen) {
    return (
      <div className={`flex items-center gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
        <Input
          autoFocus
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Stato personalizzato"
          className={size === 'sm' ? 'h-8 w-40 text-xs' : 'h-9 w-48'}
        />
        <Button
          size="sm"
          disabled={!customValue.trim() || saving}
          onClick={async () => { await persist(customValue.trim()); setCustomOpen(false); }}
        >OK</Button>
        <Button size="sm" variant="ghost" onClick={() => setCustomOpen(false)}>✕</Button>
      </div>
    );
  }

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <Select value={isPreset ? current : CUSTOM} onValueChange={onChange} disabled={saving}>
        <SelectTrigger
          className={`${size === 'sm' ? 'h-8 text-xs w-[190px]' : 'h-9 w-[220px]'} border ${siteStatusClasses(status)} font-medium`}
        >
          <SelectValue placeholder="Stato">{isPreset ? siteStatusLabel(current) : (status || 'Stato')}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SITE_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
          <SelectItem value={CUSTOM}>Altro (personalizzato)…</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SiteStatusSelect;
