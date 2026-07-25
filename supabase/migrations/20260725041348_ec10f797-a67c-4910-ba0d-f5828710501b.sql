
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.catalog_products(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS inventory_product_id_idx ON public.inventory(product_id);

ALTER TABLE public.pricing_rules
  ALTER COLUMN role DROP NOT NULL,
  ALTER COLUMN max_discount_pct DROP NOT NULL,
  ALTER COLUMN min_margin_pct DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.catalog_brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS supplier_discount_pct numeric,
  ADD COLUMN IF NOT EXISTS markup_pct numeric;

CREATE UNIQUE INDEX IF NOT EXISTS pricing_rules_brand_unique
  ON public.pricing_rules(brand_id) WHERE brand_id IS NOT NULL;
