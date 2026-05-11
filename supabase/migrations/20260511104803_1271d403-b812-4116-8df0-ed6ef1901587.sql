
-- =====================================================
-- 1. Restrict {public} admin policies to {authenticated}
-- =====================================================

-- customers
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
CREATE POLICY "Admins can manage customers"
  ON public.customers
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- leads
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
CREATE POLICY "Admins can manage leads"
  ON public.leads
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Keep "Anyone can insert leads" for public lead form (intentional).

-- salespeople
DROP POLICY IF EXISTS "Admins can manage salespeople" ON public.salespeople;
CREATE POLICY "Admins can manage salespeople"
  ON public.salespeople
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow each salesperson to view their own profile only
CREATE POLICY "Salespeople can view own profile"
  ON public.salespeople
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- suppliers
DROP POLICY IF EXISTS "Admins can manage suppliers" ON public.suppliers;
CREATE POLICY "Admins can manage suppliers"
  ON public.suppliers
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 2. Scoped SELECT for commerciali on business tables
-- =====================================================

-- customers: salesperson can view only their assigned customers
CREATE POLICY "Salespeople can view own customers"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.salespeople s
      WHERE s.user_id = auth.uid()
        AND s.id = customers.assigned_salesperson_id
    )
  );

-- sales: salesperson can view sales tied to their own customers
CREATE POLICY "Salespeople can view own sales"
  ON public.sales
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.customers c
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid()
        AND c.id = sales.customer_id
    )
  );

-- quotes: salesperson can view quotes tied to their own customers
CREATE POLICY "Salespeople can view own quotes"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.customers c
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid()
        AND c.id = quotes.customer_id
    )
  );

-- =====================================================
-- 3. Scope construction_sites and site_media
-- =====================================================

DROP POLICY IF EXISTS "Commerciali can view construction_sites" ON public.construction_sites;
CREATE POLICY "Commerciali can view assigned construction_sites"
  ON public.construction_sites
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.customers c
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid()
        AND c.id = construction_sites.customer_id
    )
  );

-- Workers see only sites they are assigned to (replaces blanket "active" policy)
DROP POLICY IF EXISTS "Workers can view active sites" ON public.construction_sites;
CREATE POLICY "Workers can view assigned sites"
  ON public.construction_sites
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'operaio'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.site_workers sw
      WHERE sw.site_id = construction_sites.id
        AND sw.worker_user_id = auth.uid()
        AND COALESCE(sw.is_active, true) = true
    )
  );

DROP POLICY IF EXISTS "Commerciali can view site_media" ON public.site_media;
CREATE POLICY "Commerciali can view own site_media"
  ON public.site_media
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.construction_sites cs
      JOIN public.customers c ON c.id = cs.customer_id
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid()
        AND cs.id = site_media.site_id
    )
    OR EXISTS (
      SELECT 1 FROM public.site_workers sw
      WHERE sw.site_id = site_media.site_id
        AND sw.worker_user_id = auth.uid()
        AND COALESCE(sw.is_active, true) = true
    )
  );

-- =====================================================
-- 4. Storage: lock down work-photos and customer-documents
-- =====================================================

-- Make work-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'work-photos';

-- Replace the public SELECT and unrestricted INSERT on work-photos
DROP POLICY IF EXISTS "Anyone can view work photos" ON storage.objects;
DROP POLICY IF EXISTS "Workers can upload work photos" ON storage.objects;

CREATE POLICY "Authenticated can view work photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'work-photos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'operaio'::app_role)
    )
  );

CREATE POLICY "Workers and admins can upload work photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'work-photos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'operaio'::app_role)
    )
  );

-- customer-documents: scoped read for commerciali on their customers
CREATE POLICY "Commerciali can view own customer-documents files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'customer-documents'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1
        FROM public.customer_documents cd
        JOIN public.customers c ON c.id = cd.customer_id
        JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
        WHERE s.user_id = auth.uid()
          AND storage.objects.name = (
            regexp_replace(cd.file_url, '^.*/customer-documents/', '')
          )
      )
    )
  );

-- =====================================================
-- 5. Realtime: lock broadcast/presence channels to admins,
--    and remove sensitive financial tables from publication
-- =====================================================

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins only realtime broadcast" ON realtime.messages;
CREATE POLICY "Admins only realtime broadcast"
  ON realtime.messages
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Remove highly sensitive financial tables from realtime broadcast.
-- (postgres_changes still respect RLS, but we narrow the surface.)
ALTER PUBLICATION supabase_realtime DROP TABLE public.sales;
ALTER PUBLICATION supabase_realtime DROP TABLE public.fixed_costs;
ALTER PUBLICATION supabase_realtime DROP TABLE public.variable_costs;
ALTER PUBLICATION supabase_realtime DROP TABLE public.payment_schedules;
