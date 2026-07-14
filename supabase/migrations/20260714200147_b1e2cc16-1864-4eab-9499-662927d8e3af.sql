
ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS price_base_sqm numeric,
  ADD COLUMN IF NOT EXISTS price_over_pallet_sqm numeric,
  ADD COLUMN IF NOT EXISTS price_over_3_pallets_sqm numeric;

CREATE TABLE IF NOT EXISTS public.catalog_import_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_match_hint text,
  issue_note text,
  csv_row jsonb,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_import_flags TO authenticated;
GRANT ALL ON public.catalog_import_flags TO service_role;

ALTER TABLE public.catalog_import_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage catalog import flags"
  ON public.catalog_import_flags
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_catalog_import_flags_updated_at
  BEFORE UPDATE ON public.catalog_import_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
