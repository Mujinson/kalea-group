
-- 1. user_roles: allow users to read own role
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. customer_reminders: tighten to authenticated only (admins remain via has_role check)
DROP POLICY IF EXISTS "Admins can manage customer_reminders" ON public.customer_reminders;
CREATE POLICY "Admins can manage customer_reminders"
ON public.customer_reminders
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. catalog_price_history: restrict INSERT to admins (triggers run as table owner and bypass RLS)
DROP POLICY IF EXISTS "System can insert catalog_price_history" ON public.catalog_price_history;
CREATE POLICY "Admins can insert catalog_price_history"
ON public.catalog_price_history
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
