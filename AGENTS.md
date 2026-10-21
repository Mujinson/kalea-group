
- Email campaigns live in dedicated tables (email_campaigns, email_campaign_recipients, email_templates, email_suppressions, email_events) and edge functions campaign-sender / campaign-unsubscribe / resend-webhook; working-day logic lives in supabase/functions/_shared/workdays.ts (tested with bun test). Why: keeps campaigns separate from lead_automations, which lead-automation already uses.
