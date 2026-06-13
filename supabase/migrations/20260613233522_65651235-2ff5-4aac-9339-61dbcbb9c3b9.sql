
-- 1. product_suppliers: restrict SELECT to admin + commerciale (exclude operaio)
DROP POLICY IF EXISTS "Commerciali can view product_suppliers" ON public.product_suppliers;
CREATE POLICY "Admins and commerciali can view product_suppliers"
ON public.product_suppliers FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'commerciale'));

-- 2. customer_contracts: allow salespeople to view contracts for their assigned customers
CREATE POLICY "Salespeople can view own customer contracts"
ON public.customer_contracts FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    JOIN public.salespeople s ON s.id = c.assigned_salesperson_id
    WHERE s.user_id = auth.uid() AND c.id = customer_contracts.customer_id
  )
);

-- 3. customer_reminders: allow salespeople to manage their own reminders
CREATE POLICY "Salespeople can manage own reminders"
ON public.customer_reminders FOR ALL TO authenticated
USING (
  salesperson_id IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
)
WITH CHECK (
  salesperson_id IN (SELECT id FROM public.salespeople WHERE user_id = auth.uid())
);

-- 4. customer_visits: allow salespeople to manage visits for customers in their territory
CREATE POLICY "Commerciali can manage customer_visits"
ON public.customer_visits FOR ALL TO authenticated
USING (
  customer_id IN (
    SELECT c.id FROM public.customers c
    WHERE c.region IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'regione'
    ) OR c.province IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'provincia'
    )
  )
)
WITH CHECK (
  customer_id IN (
    SELECT c.id FROM public.customers c
    WHERE c.region IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'regione'
    ) OR c.province IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'provincia'
    )
  )
);

-- 5. Storage: restrict worker-files bucket SELECT to admins only
DROP POLICY IF EXISTS "Authenticated read worker-files" ON storage.objects;
CREATE POLICY "Admins read worker-files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'worker-files' AND has_role(auth.uid(), 'admin'));
