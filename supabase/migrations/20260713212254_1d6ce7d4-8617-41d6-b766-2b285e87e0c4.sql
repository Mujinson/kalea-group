DROP POLICY IF EXISTS "Authenticated can read pricing rules" ON public.pricing_rules;

CREATE POLICY "Admin and commerciale can read pricing rules"
ON public.pricing_rules
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'commerciale')
  OR public.has_role(auth.uid(), 'ibrido')
);