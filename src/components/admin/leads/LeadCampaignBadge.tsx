import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Small badge in the lead detail: replied / unsubscribed / invalid email. Silent if nothing to show. */
export default function LeadCampaignBadge({ leadId }: { leadId: string }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: recs }, { data: lead }] = await Promise.all([
        supabase.from('email_campaign_recipients').select('status, email_campaigns(name)').eq('lead_id', leadId),
        supabase.from('leads').select('do_not_contact, email_invalid').eq('id', leadId).maybeSingle(),
      ]);
      if (!alive) return;
      const replied = (recs || []).find((r: any) => r.status === 'replied') as any;
      if (replied) setLabel(`Ha risposto alla campagna ${replied.email_campaigns?.name ?? ''}`);
      else if (lead?.do_not_contact) setLabel('Disiscritto dalle email');
      else if (lead?.email_invalid) setLabel('Email non valida');
      else setLabel(null);
    })();
    return () => { alive = false; };
  }, [leadId]);
  if (!label) return null;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-crm-bg-soft text-crm-ink border border-crm-border">{label}</span>;
}
