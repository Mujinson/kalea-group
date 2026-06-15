DROP POLICY IF EXISTS "Commerciali can view catalog_products" ON public.catalog_products;

CREATE POLICY "Admins and commerciali can view catalog_products"
ON public.catalog_products
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'commerciale'::public.app_role)
);