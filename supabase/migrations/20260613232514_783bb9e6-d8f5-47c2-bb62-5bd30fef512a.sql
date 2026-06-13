-- Fix 1: Restrict preventivi access. Drop open policies, add admin + commerciale-scoped policies.
DROP POLICY IF EXISTS "Authenticated users can delete preventivi" ON public.preventivi;
DROP POLICY IF EXISTS "Authenticated users can insert preventivi" ON public.preventivi;
DROP POLICY IF EXISTS "Authenticated users can update preventivi" ON public.preventivi;
DROP POLICY IF EXISTS "Authenticated users can view preventivi" ON public.preventivi;

CREATE POLICY "Admins can manage preventivi"
  ON public.preventivi FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Salespeople can view own preventivi"
  ON public.preventivi FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid() AND c.id = preventivi.customer_id
    )
  );

CREATE POLICY "Salespeople can insert preventivi for own customers"
  ON public.preventivi FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid() AND c.id = preventivi.customer_id
    )
  );

CREATE POLICY "Salespeople can update own preventivi"
  ON public.preventivi FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid() AND c.id = preventivi.customer_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid() AND c.id = preventivi.customer_id
    )
  );

-- Fix 2: Remove sensitive tables from Realtime publication to prevent PII broadcast.
ALTER PUBLICATION supabase_realtime DROP TABLE public.customers;
ALTER PUBLICATION supabase_realtime DROP TABLE public.quotes;
ALTER PUBLICATION supabase_realtime DROP TABLE public.construction_sites;
ALTER PUBLICATION supabase_realtime DROP TABLE public.preventivi;