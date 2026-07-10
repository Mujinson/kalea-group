
-- 1. Extend leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS code text UNIQUE,
  ADD COLUMN IF NOT EXISTS contact_type text DEFAULT 'azienda' CHECK (contact_type IN ('azienda','privato')),
  ADD COLUMN IF NOT EXISTS vat_number text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Italia',
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'it',
  ADD COLUMN IF NOT EXISTS site_address text,
  ADD COLUMN IF NOT EXISTS site_city text,
  ADD COLUMN IF NOT EXISTS site_province text,
  ADD COLUMN IF NOT EXISTS site_postal_code text,
  ADD COLUMN IF NOT EXISTS site_country text DEFAULT 'Italia',
  ADD COLUMN IF NOT EXISTS project_name text,
  ADD COLUMN IF NOT EXISTS has_thermal_insulation boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS visited_showroom boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS referrer_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS message text;

-- Allow nullable phone/email for cases where only one is provided
ALTER TABLE public.leads ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.leads ALTER COLUMN email DROP NOT NULL;

-- 2. Code generator trigger
CREATE OR REPLACE FUNCTION public.generate_lead_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year text;
  v_rand text;
  v_code text;
  v_try int := 0;
BEGIN
  IF NEW.code IS NOT NULL AND NEW.code <> '' THEN RETURN NEW; END IF;
  v_year := to_char(COALESCE(NEW.created_at, now()), 'YY');
  LOOP
    v_rand := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    v_code := v_rand || '-' || v_year;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.leads WHERE code = v_code);
    v_try := v_try + 1;
    IF v_try > 10 THEN RAISE EXCEPTION 'Impossibile generare codice lead univoco'; END IF;
  END LOOP;
  NEW.code := v_code;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_lead_code ON public.leads;
CREATE TRIGGER trg_generate_lead_code
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.generate_lead_code();

-- Backfill codes for existing rows
UPDATE public.leads SET code = upper(substr(md5(id::text), 1, 8)) || '-' || to_char(created_at,'YY')
WHERE code IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_code ON public.leads(code);
CREATE INDEX IF NOT EXISTS idx_leads_archived_at ON public.leads(archived_at);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON public.leads(deleted_at);

-- 3. lead_activities table
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('note','call','email','meeting','status_change','whatsapp','sms','task')),
  title text,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_activities TO authenticated;
GRANT ALL ON public.lead_activities TO service_role;

ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all lead activities" ON public.lead_activities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users see activities of accessible leads" ON public.lead_activities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_activities.lead_id
        AND (
          l.assigned_user_id = auth.uid()
          OR l.created_by_user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.salespeople s
            WHERE s.user_id = auth.uid()
              AND s.id = l.assigned_salesperson_id
          )
        )
    )
  );

CREATE POLICY "Users create activities on accessible leads" ON public.lead_activities
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_activities.lead_id
        AND (
          l.assigned_user_id = auth.uid()
          OR l.created_by_user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.salespeople s
            WHERE s.user_id = auth.uid() AND s.id = l.assigned_salesperson_id
          )
        )
    )
  );

CREATE POLICY "Users edit own activities" ON public.lead_activities
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own activities" ON public.lead_activities
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id, occurred_at DESC);

-- 4. lead_attachments table
CREATE TABLE IF NOT EXISTS public.lead_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_attachments TO authenticated;
GRANT ALL ON public.lead_attachments TO service_role;

ALTER TABLE public.lead_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all lead attachments" ON public.lead_attachments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users view accessible lead attachments" ON public.lead_attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_attachments.lead_id
        AND (
          l.assigned_user_id = auth.uid()
          OR l.created_by_user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.salespeople s
            WHERE s.user_id = auth.uid() AND s.id = l.assigned_salesperson_id
          )
        )
    )
  );

CREATE POLICY "Users upload accessible lead attachments" ON public.lead_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_attachments.lead_id
        AND (
          l.assigned_user_id = auth.uid()
          OR l.created_by_user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.salespeople s
            WHERE s.user_id = auth.uid() AND s.id = l.assigned_salesperson_id
          )
        )
    )
  );

CREATE POLICY "Users delete own attachments" ON public.lead_attachments
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_lead_attachments_lead ON public.lead_attachments(lead_id);
