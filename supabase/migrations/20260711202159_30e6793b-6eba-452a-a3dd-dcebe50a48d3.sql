
-- estensione trigram prima degli indici
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ENUMs
DO $$ BEGIN CREATE TYPE public.catalog_macro_category AS ENUM ('articoli','accessori','servizi');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.catalog_price_list_status AS ENUM ('draft','applied','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.catalog_diff_type AS ENUM ('new','updated','deleted','price_changed','unchanged');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- catalog_brands
CREATE TABLE IF NOT EXISTS public.catalog_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text UNIQUE,
  logo_url text,
  color text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.catalog_brands TO authenticated;
GRANT ALL ON public.catalog_brands TO service_role;
ALTER TABLE public.catalog_brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "brands select auth" ON public.catalog_brands;
CREATE POLICY "brands select auth" ON public.catalog_brands FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "brands manage admin" ON public.catalog_brands;
CREATE POLICY "brands manage admin" ON public.catalog_brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP TRIGGER IF EXISTS trg_brands_updated ON public.catalog_brands;
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON public.catalog_brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- catalog_collections
CREATE TABLE IF NOT EXISTS public.catalog_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES public.catalog_brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(brand_id, name)
);
GRANT SELECT ON public.catalog_collections TO authenticated;
GRANT ALL ON public.catalog_collections TO service_role;
ALTER TABLE public.catalog_collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coll select auth" ON public.catalog_collections;
CREATE POLICY "coll select auth" ON public.catalog_collections FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "coll manage admin" ON public.catalog_collections;
CREATE POLICY "coll manage admin" ON public.catalog_collections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP TRIGGER IF EXISTS trg_coll_updated ON public.catalog_collections;
CREATE TRIGGER trg_coll_updated BEFORE UPDATE ON public.catalog_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- product_categories: macro_category
ALTER TABLE public.product_categories
  ADD COLUMN IF NOT EXISTS macro_category public.catalog_macro_category;

-- catalog_products: nuovi campi
ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.catalog_brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS collection_id uuid REFERENCES public.catalog_collections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS purchase_price numeric,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS technical_sheet_pdf_url text,
  ADD COLUMN IF NOT EXISTS attributes jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_catalog_products_brand_id ON public.catalog_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_collection_id ON public.catalog_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_barcode ON public.catalog_products(barcode);
CREATE INDEX IF NOT EXISTS idx_catalog_products_name_trgm ON public.catalog_products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_catalog_products_type ON public.catalog_products(product_type);

-- Backfill brands + collections
INSERT INTO public.catalog_brands (name)
SELECT DISTINCT btrim(brand) FROM public.catalog_products
WHERE brand IS NOT NULL AND btrim(brand) <> ''
ON CONFLICT (name) DO NOTHING;

UPDATE public.catalog_products p
SET brand_id = b.id
FROM public.catalog_brands b
WHERE p.brand_id IS NULL AND lower(btrim(p.brand)) = lower(b.name);

INSERT INTO public.catalog_collections (brand_id, name)
SELECT DISTINCT p.brand_id, btrim(p.collection)
FROM public.catalog_products p
WHERE p.collection IS NOT NULL AND btrim(p.collection) <> '' AND p.brand_id IS NOT NULL
ON CONFLICT (brand_id, name) DO NOTHING;

UPDATE public.catalog_products p
SET collection_id = c.id
FROM public.catalog_collections c
WHERE p.collection_id IS NULL
  AND p.brand_id = c.brand_id
  AND lower(btrim(p.collection)) = lower(c.name);

UPDATE public.product_categories SET macro_category = 'accessori'
  WHERE macro_category IS NULL AND lower(name) LIKE '%access%';
UPDATE public.product_categories SET macro_category = 'servizi'
  WHERE macro_category IS NULL AND lower(name) LIKE '%serviz%';
UPDATE public.product_categories SET macro_category = 'articoli'
  WHERE macro_category IS NULL;

-- catalog_price_lists
CREATE TABLE IF NOT EXISTS public.catalog_price_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version integer NOT NULL,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  source_file text,
  brand_id uuid REFERENCES public.catalog_brands(id) ON DELETE SET NULL,
  status public.catalog_price_list_status NOT NULL DEFAULT 'draft',
  totals jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_price_lists TO authenticated;
GRANT ALL ON public.catalog_price_lists TO service_role;
ALTER TABLE public.catalog_price_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pricelists admin only" ON public.catalog_price_lists;
CREATE POLICY "pricelists admin only" ON public.catalog_price_lists FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP TRIGGER IF EXISTS trg_pl_updated ON public.catalog_price_lists;
CREATE TRIGGER trg_pl_updated BEFORE UPDATE ON public.catalog_price_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- catalog_price_list_items
CREATE TABLE IF NOT EXISTS public.catalog_price_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id uuid NOT NULL REFERENCES public.catalog_price_lists(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.catalog_products(id) ON DELETE SET NULL,
  product_code text NOT NULL,
  name text,
  brand text,
  collection text,
  list_price numeric,
  supplier_discount_percentage numeric,
  vat_percentage numeric,
  unit_of_measure text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  diff_type public.catalog_diff_type NOT NULL DEFAULT 'unchanged',
  old_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_price_list_items TO authenticated;
GRANT ALL ON public.catalog_price_list_items TO service_role;
ALTER TABLE public.catalog_price_list_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plitems admin only" ON public.catalog_price_list_items;
CREATE POLICY "plitems admin only" ON public.catalog_price_list_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_plitems_pl ON public.catalog_price_list_items(price_list_id);
CREATE INDEX IF NOT EXISTS idx_plitems_prod ON public.catalog_price_list_items(product_id);

-- catalog_audit_log
CREATE TABLE IF NOT EXISTS public.catalog_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  entity_code text,
  action text NOT NULL,
  field text,
  old_value jsonb,
  new_value jsonb,
  user_id uuid,
  user_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.catalog_audit_log TO authenticated;
GRANT ALL ON public.catalog_audit_log TO service_role;
ALTER TABLE public.catalog_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit view admin" ON public.catalog_audit_log;
CREATE POLICY "audit view admin" ON public.catalog_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "audit insert auth" ON public.catalog_audit_log;
CREATE POLICY "audit insert auth" ON public.catalog_audit_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.catalog_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.catalog_audit_log(created_at DESC);

CREATE OR REPLACE FUNCTION public.log_catalog_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_code text;
BEGIN
  v_uid := auth.uid();
  BEGIN SELECT email INTO v_email FROM auth.users WHERE id = v_uid; EXCEPTION WHEN OTHERS THEN v_email := NULL; END;

  IF TG_OP = 'INSERT' THEN
    v_code := COALESCE(to_jsonb(NEW)->>'product_code', to_jsonb(NEW)->>'name', NULL);
    INSERT INTO public.catalog_audit_log(entity_type, entity_id, entity_code, action, new_value, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id, v_code, 'insert', to_jsonb(NEW), v_uid, v_email);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_code := COALESCE(to_jsonb(NEW)->>'product_code', to_jsonb(NEW)->>'name', NULL);
    INSERT INTO public.catalog_audit_log(entity_type, entity_id, entity_code, action, old_value, new_value, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id, v_code, 'update', to_jsonb(OLD), to_jsonb(NEW), v_uid, v_email);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_code := COALESCE(to_jsonb(OLD)->>'product_code', to_jsonb(OLD)->>'name', NULL);
    INSERT INTO public.catalog_audit_log(entity_type, entity_id, entity_code, action, old_value, user_id, user_email)
    VALUES (TG_TABLE_NAME, OLD.id, v_code, 'delete', to_jsonb(OLD), v_uid, v_email);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_catalog_products ON public.catalog_products;
CREATE TRIGGER trg_audit_catalog_products
  AFTER INSERT OR UPDATE OR DELETE ON public.catalog_products
  FOR EACH ROW EXECUTE FUNCTION public.log_catalog_audit();

DROP TRIGGER IF EXISTS trg_audit_catalog_brands ON public.catalog_brands;
CREATE TRIGGER trg_audit_catalog_brands
  AFTER INSERT OR UPDATE OR DELETE ON public.catalog_brands
  FOR EACH ROW EXECUTE FUNCTION public.log_catalog_audit();

DROP TRIGGER IF EXISTS trg_audit_catalog_collections ON public.catalog_collections;
CREATE TRIGGER trg_audit_catalog_collections
  AFTER INSERT OR UPDATE OR DELETE ON public.catalog_collections
  FOR EACH ROW EXECUTE FUNCTION public.log_catalog_audit();
