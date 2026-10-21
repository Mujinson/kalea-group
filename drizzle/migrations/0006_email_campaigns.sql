ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS do_not_contact boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email_invalid boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email_opt_out_at timestamptz;

CREATE TABLE public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sender_email text NOT NULL DEFAULT 'andrea.facchinetti@kalea.space',
  sender_name text NOT NULL DEFAULT 'Andrea Facchinetti – Kalēa',
  reply_to text NOT NULL DEFAULT 'andrea.facchinetti@kalea.space',
  status text NOT NULL DEFAULT 'paused' CHECK (status IN ('draft','active','paused')),
  daily_limit int NOT NULL DEFAULT 50,
  send_time time NOT NULL DEFAULT '09:00',
  timezone text NOT NULL DEFAULT 'Europe/Rome',
  weekdays_only boolean NOT NULL DEFAULT true,
  skip_it_holidays boolean NOT NULL DEFAULT true,
  follow_up_after_days int NOT NULL DEFAULT 10,
  presentation_url text NOT NULL DEFAULT 'https://kalea.space/presentazione-kalea.pdf',
  last_run_date date,
  started_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaigns TO authenticated;
GRANT ALL ON public.email_campaigns TO service_role;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all campaigns" ON public.email_campaigns FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.email_campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  email text NOT NULL,
  greeting_name text,
  template_version text NOT NULL DEFAULT 'privati' CHECK (template_version IN ('architetti','imprese','privati')),
  planned_send_date date,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','follow_up_sent','replied','unsubscribed','bounced','skipped')),
  sent_at timestamptz,
  follow_up_due_date date,
  follow_up_at timestamptz,
  resend_message_id text,
  follow_up_message_id text,
  replied_at timestamptz,
  unsubscribe_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  attempts int NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);
CREATE INDEX idx_ecr_queue ON public.email_campaign_recipients (campaign_id, status, planned_send_date);
CREATE INDEX idx_ecr_lead ON public.email_campaign_recipients (lead_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaign_recipients TO authenticated;
GRANT ALL ON public.email_campaign_recipients TO service_role;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all recipients" ON public.email_campaign_recipients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE CHECK (key IN ('architetti','imprese','privati','richiamo')),
  subject text NOT NULL,
  html_body text NOT NULL,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all templates" ON public.email_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.email_suppressions (
  email text PRIMARY KEY,
  reason text NOT NULL CHECK (reason IN ('unsubscribed','bounced','complained')),
  lead_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_suppressions TO authenticated;
GRANT ALL ON public.email_suppressions TO service_role;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all suppressions" ON public.email_suppressions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid,
  type text NOT NULL,
  resend_message_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_events TO authenticated;
GRANT ALL ON public.email_events TO service_role;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read events" ON public.email_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.ecr_normalize() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_ecr_normalize BEFORE INSERT OR UPDATE ON public.email_campaign_recipients
  FOR EACH ROW EXECUTE FUNCTION public.ecr_normalize();
CREATE TRIGGER trg_email_campaigns_updated BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_email_templates_updated BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.email_templates (key, subject, html_body) VALUES
('architetti','Pavimenti per i vostri progetti – Kalēa','<p>{{saluto}}</p><p>sono Andrea di Kalēa. Lavoriamo con studi di architettura e geometri su pavimenti SPC, parquet e MgO, con fornitura e posa.</p><p>Le lascio la nostra presentazione: <a href="{{presentazione_url}}">Scarica la presentazione Kalēa</a></p><p>Se le fa piacere, ci sentiamo per un caffè.</p><p>{{mittente}}</p>'),
('imprese','Fornitura e posa pavimenti per la vostra impresa – Kalēa','<p>{{saluto}}</p><p>sono Andrea di Kalēa. Seguiamo imprese edili con fornitura e posa di pavimenti con squadre interne.</p><p><a href="{{presentazione_url}}">Scarica la presentazione Kalēa</a></p><p>{{mittente}}</p>'),
('privati','Il suo nuovo pavimento – Kalēa','<p>{{saluto}}</p><p>sono Andrea di Kalēa. Ci aveva contattato per un pavimento: le lascio la nostra presentazione.</p><p><a href="{{presentazione_url}}">Scarica la presentazione Kalēa</a></p><p>Sopralluogo gratuito su richiesta.</p><p>{{mittente}}</p>'),
('richiamo','Re: la presentazione Kalēa','<p>{{saluto}}</p><p>le riscrivo brevemente per sapere se ha avuto modo di vedere la presentazione che le avevo inviato.</p><p><a href="{{presentazione_url}}">Scarica la presentazione Kalēa</a></p><p>{{mittente}}</p>');
