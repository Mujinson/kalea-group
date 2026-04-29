-- ============================================
-- CATALOGO PRODOTTI / LISTINI / FORNITORI
-- ============================================

-- 1. FORNITORI catalogo (separato da suppliers esistente per i pagamenti)
CREATE TABLE public.product_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  country TEXT DEFAULT 'Italia',
  default_discount_percentage NUMERIC DEFAULT 0,
  payment_terms TEXT,
  lead_time_days INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CATEGORIE prodotto
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PRODOTTI catalogo (master)
CREATE TABLE public.catalog_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificativi
  product_code TEXT NOT NULL UNIQUE,
  supplier_code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Classificazione
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL DEFAULT 'article',
  collection TEXT,
  brand TEXT,
  
  -- Fornitore
  supplier_id UUID REFERENCES public.product_suppliers(id) ON DELETE SET NULL,
  
  -- COMMERCIALE - Prezzi (regole anti-perdita)
  list_price NUMERIC NOT NULL DEFAULT 0,
  supplier_discount_percentage NUMERIC NOT NULL DEFAULT 0,
  net_cost NUMERIC GENERATED ALWAYS AS (list_price * (1 - supplier_discount_percentage / 100)) STORED,
  markup_percentage NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC GENERATED ALWAYS AS (list_price * (1 - supplier_discount_percentage / 100) * (1 + markup_percentage / 100)) STORED,
  max_customer_discount_percentage NUMERIC NOT NULL DEFAULT 10,
  min_margin_percentage NUMERIC NOT NULL DEFAULT 25,
  vat_percentage NUMERIC NOT NULL DEFAULT 22,
  unit_of_measure TEXT NOT NULL DEFAULT 'mq',
  
  -- TECNICI
  format TEXT,
  thickness_mm NUMERIC,
  finish TEXT,
  color TEXT,
  weight_per_unit NUMERIC,
  certifications TEXT[],
  technical_sheet_url TEXT,
  
  -- LOGISTICA
  min_order_quantity NUMERIC DEFAULT 0,
  pieces_per_pack NUMERIC,
  pack_per_pallet NUMERIC,
  pallet_weight_kg NUMERIC,
  available_stock NUMERIC DEFAULT 0,
  low_stock_threshold NUMERIC DEFAULT 0,
  warehouse_location TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_products_code ON public.catalog_products(product_code);
CREATE INDEX idx_catalog_products_supplier ON public.catalog_products(supplier_id);
CREATE INDEX idx_catalog_products_category ON public.catalog_products(category_id);
CREATE INDEX idx_catalog_products_active ON public.catalog_products(is_active);

-- 4. STORICO MODIFICHE PREZZI (audit anti-perdita)
CREATE TABLE public.catalog_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  changed_field TEXT NOT NULL,
  old_value NUMERIC,
  new_value NUMERIC,
  changed_by TEXT,
  change_reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_history_product ON public.catalog_price_history(product_id, changed_at DESC);

-- 5. RLS
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product_suppliers" ON public.product_suppliers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Commerciali can view product_suppliers" ON public.product_suppliers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage product_categories" ON public.product_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "All authenticated can view product_categories" ON public.product_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage catalog_products" ON public.catalog_products FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Commerciali can view catalog_products" ON public.catalog_products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can view catalog_price_history" ON public.catalog_price_history FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert catalog_price_history" ON public.catalog_price_history FOR INSERT TO authenticated WITH CHECK (true);

-- 6. TRIGGER updated_at
CREATE TRIGGER update_product_suppliers_updated_at BEFORE UPDATE ON public.product_suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_products_updated_at BEFORE UPDATE ON public.catalog_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. TRIGGER per logging automatico modifiche prezzo (regola anti-perdita)
CREATE OR REPLACE FUNCTION public.log_catalog_price_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.list_price IS DISTINCT FROM NEW.list_price THEN
      INSERT INTO public.catalog_price_history(product_id, changed_field, old_value, new_value)
      VALUES (NEW.id, 'list_price', OLD.list_price, NEW.list_price);
    END IF;
    IF OLD.supplier_discount_percentage IS DISTINCT FROM NEW.supplier_discount_percentage THEN
      INSERT INTO public.catalog_price_history(product_id, changed_field, old_value, new_value)
      VALUES (NEW.id, 'supplier_discount_percentage', OLD.supplier_discount_percentage, NEW.supplier_discount_percentage);
    END IF;
    IF OLD.markup_percentage IS DISTINCT FROM NEW.markup_percentage THEN
      INSERT INTO public.catalog_price_history(product_id, changed_field, old_value, new_value)
      VALUES (NEW.id, 'markup_percentage', OLD.markup_percentage, NEW.markup_percentage);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER catalog_products_price_log AFTER UPDATE ON public.catalog_products FOR EACH ROW EXECUTE FUNCTION public.log_catalog_price_changes();

-- 8. CATEGORIE iniziali
INSERT INTO public.product_categories (name, slug, display_order) VALUES
  ('Pavimenti', 'pavimenti', 1),
  ('Rivestimenti parete', 'rivestimenti-parete', 2),
  ('Soffitti', 'soffitti', 3),
  ('Outdoor', 'outdoor', 4),
  ('Ceramiche', 'ceramiche', 5),
  ('Accessori', 'accessori', 6),
  ('Sottofondi', 'sottofondi', 7),
  ('Servizi', 'servizi', 8);