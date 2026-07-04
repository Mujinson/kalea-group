-- Restrict SELECT on wc_accessories and wc_prices to admin and commerciale roles only
-- These tables expose list_price and supplier_discount_pct which workers (operaio) should not see.

DROP POLICY IF EXISTS "auth read wc_accessories" ON public.wc_accessories;
CREATE POLICY "admin_commerciale read wc_accessories"
  ON public.wc_accessories
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));

DROP POLICY IF EXISTS "auth read wc_prices" ON public.wc_prices;
CREATE POLICY "admin_commerciale read wc_prices"
  ON public.wc_prices
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));