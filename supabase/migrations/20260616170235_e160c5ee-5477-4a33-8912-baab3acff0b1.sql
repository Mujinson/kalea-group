
-- 1. Add 'ibrido' role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ibrido';

-- 2. Extend salespeople with commission flag (commission_rate already exists)
ALTER TABLE public.salespeople
  ADD COLUMN IF NOT EXISTS is_commission_earner boolean NOT NULL DEFAULT false;

-- 3. Extend leads with creator user id
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid;

-- ============================================================
-- monthly_targets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.monthly_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  year int NOT NULL,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  target_eur numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year, month)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_targets TO authenticated;
GRANT ALL ON public.monthly_targets TO service_role;
ALTER TABLE public.monthly_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all targets" ON public.monthly_targets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own targets" ON public.monthly_targets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER monthly_targets_updated_at BEFORE UPDATE ON public.monthly_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- commissions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  preventivo_id uuid REFERENCES public.preventivi(id) ON DELETE SET NULL,
  customer_id uuid,
  customer_name text,
  base_amount numeric NOT NULL DEFAULT 0,
  percentage numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'maturata' CHECK (status IN ('maturata','da_liquidare','liquidata')),
  paid_at date,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all commissions" ON public.commissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own commissions" ON public.commissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER commissions_updated_at BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS commissions_user_id_idx ON public.commissions(user_id);
CREATE INDEX IF NOT EXISTS commissions_status_idx ON public.commissions(status);

-- ============================================================
-- time_off_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  kind text NOT NULL DEFAULT 'ferie' CHECK (kind IN ('ferie','permesso','malattia')),
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by uuid,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_off_requests TO authenticated;
GRANT ALL ON public.time_off_requests TO service_role;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all time off" ON public.time_off_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own time off" ON public.time_off_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own time off" ON public.time_off_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Users delete own pending time off" ON public.time_off_requests
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

CREATE TRIGGER time_off_requests_updated_at BEFORE UPDATE ON public.time_off_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- availability_blocks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  block_date date NOT NULL,
  slot text NOT NULL DEFAULT 'all_day' CHECK (slot IN ('morning','afternoon','all_day')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_blocks TO authenticated;
GRANT ALL ON public.availability_blocks TO service_role;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all blocks" ON public.availability_blocks
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users manage own blocks" ON public.availability_blocks
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- site_chat_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text,
  message text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_chat_messages TO authenticated;
GRANT ALL ON public.site_chat_messages TO service_role;
ALTER TABLE public.site_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all site messages" ON public.site_chat_messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned workers view site messages" ON public.site_chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.site_workers sw
      WHERE sw.site_id = site_chat_messages.site_id
        AND sw.worker_user_id = auth.uid()
    )
  );

CREATE POLICY "Assigned workers post site messages" ON public.site_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.site_workers sw
      WHERE sw.site_id = site_chat_messages.site_id
        AND sw.worker_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS site_chat_site_id_idx ON public.site_chat_messages(site_id);

-- ============================================================
-- Trigger: auto-create commission when quote is accepted
-- Only counts material (excludes posa/labor lines)
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_commission_on_quote_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_pct numeric;
  v_is_earner boolean;
  v_material_total numeric := 0;
  v_item jsonb;
  v_category text;
  v_amount numeric;
BEGIN
  -- Only on status transition to 'accepted'/'accettato'
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('accepted','accettato','accettato','accepted')
  THEN
    v_user_id := COALESCE(NEW.created_by, NEW.assigned_to);
    IF v_user_id IS NULL THEN RETURN NEW; END IF;

    -- Skip if commission already exists
    IF EXISTS (SELECT 1 FROM public.commissions WHERE quote_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    SELECT s.is_commission_earner, COALESCE(s.commission_rate, 0)
      INTO v_is_earner, v_pct
      FROM public.salespeople s
     WHERE s.user_id = v_user_id
     LIMIT 1;

    IF NOT COALESCE(v_is_earner, false) OR COALESCE(v_pct,0) = 0 THEN
      RETURN NEW;
    END IF;

    -- Sum only material items (exclude posa/labor)
    IF NEW.items IS NOT NULL THEN
      FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
        v_category := lower(COALESCE(v_item->>'category', v_item->>'tipo', ''));
        IF v_category NOT IN ('posa','labor','servizio','manodopera','service') THEN
          v_amount := COALESCE((v_item->>'total')::numeric,
                              (v_item->>'totale')::numeric,
                              ((v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric),
                              0);
          v_material_total := v_material_total + v_amount;
        END IF;
      END LOOP;
    END IF;

    -- Fallback: if no items breakdown, use total_amount (assume all material)
    IF v_material_total = 0 THEN
      v_material_total := COALESCE(NEW.total_amount, 0);
    END IF;

    INSERT INTO public.commissions (
      user_id, quote_id, customer_id, base_amount, percentage, amount, status
    ) VALUES (
      v_user_id, NEW.id, NEW.customer_id,
      v_material_total, v_pct, ROUND(v_material_total * v_pct / 100, 2),
      'da_liquidare'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quote_commission_trigger ON public.quotes;
CREATE TRIGGER quote_commission_trigger
  AFTER UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_commission_on_quote_accept();
