
-- 1. Rename empty legacy preventivi table
ALTER TABLE IF EXISTS public.preventivi RENAME TO _deprecated_preventivi;

-- 2. LEADS: commerciale / ibrido
DROP POLICY IF EXISTS "Commerciali can view own leads" ON public.leads;
CREATE POLICY "Commerciali can view own leads" ON public.leads
FOR SELECT TO authenticated
USING (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    assigned_user_id = auth.uid()
    OR assigned_salesperson_id IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Commerciali can insert own leads" ON public.leads;
CREATE POLICY "Commerciali can insert own leads" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    assigned_user_id = auth.uid()
    OR assigned_salesperson_id IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Commerciali can update own leads" ON public.leads;
CREATE POLICY "Commerciali can update own leads" ON public.leads
FOR UPDATE TO authenticated
USING (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    assigned_user_id = auth.uid()
    OR assigned_salesperson_id IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    assigned_user_id = auth.uid()
    OR assigned_salesperson_id IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
  )
);

-- 3. APPOINTMENTS: commerciale / ibrido (created_by is text, assigned_to is uuid)
DROP POLICY IF EXISTS "Commerciali can view own appointments" ON public.appointments;
CREATE POLICY "Commerciali can view own appointments" ON public.appointments
FOR SELECT TO authenticated
USING (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    created_by = auth.uid()::text
    OR assigned_to IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Commerciali can insert own appointments" ON public.appointments;
CREATE POLICY "Commerciali can insert own appointments" ON public.appointments
FOR INSERT TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    created_by = auth.uid()::text
    OR assigned_to IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Commerciali can update own appointments" ON public.appointments;
CREATE POLICY "Commerciali can update own appointments" ON public.appointments
FOR UPDATE TO authenticated
USING (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    created_by = auth.uid()::text
    OR assigned_to IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    created_by = auth.uid()::text
    OR assigned_to IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
  )
);

-- 4. QUOTES: commerciale / ibrido SELECT (created_by/assigned_to are text)
DROP POLICY IF EXISTS "Salespeople can view own quotes" ON public.quotes;
CREATE POLICY "Salespeople can view own quotes" ON public.quotes
FOR SELECT TO authenticated
USING (
  (has_role(auth.uid(), 'commerciale'::app_role) OR has_role(auth.uid(), 'ibrido'::app_role))
  AND (
    created_by = auth.uid()::text
    OR assigned_to = auth.uid()::text
    OR assigned_to IN (SELECT id::text FROM public.salespeople WHERE user_id = auth.uid())
    OR customer_id IN (
      SELECT c.id FROM public.customers c
      JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
      WHERE s.user_id = auth.uid()
    )
  )
);
