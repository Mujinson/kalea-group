
DROP POLICY IF EXISTS "Authenticated can select quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated can insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated can update quotes" ON public.quotes;

-- Salespeople can insert quotes for customers they own
CREATE POLICY "Salespeople can insert own quotes"
ON public.quotes FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM customers c
    JOIN salespeople s ON s.id = c.assigned_salesperson_id
    WHERE s.user_id = auth.uid() AND c.id = quotes.customer_id
  )
);

-- Salespeople can update quotes for customers they own
CREATE POLICY "Salespeople can update own quotes"
ON public.quotes FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM customers c
    JOIN salespeople s ON s.id = c.assigned_salesperson_id
    WHERE s.user_id = auth.uid() AND c.id = quotes.customer_id
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM customers c
    JOIN salespeople s ON s.id = c.assigned_salesperson_id
    WHERE s.user_id = auth.uid() AND c.id = quotes.customer_id
  )
);
