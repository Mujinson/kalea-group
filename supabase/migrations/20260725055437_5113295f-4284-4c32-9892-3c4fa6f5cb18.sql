
-- 1. inventory_movements
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.catalog_products(id) ON DELETE SET NULL,
  inventory_id uuid REFERENCES public.inventory(id) ON DELETE SET NULL,
  quantity numeric NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('carico','scarico_vendita','scarico_cantiere','rettifica')),
  reference_sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  reference_site_id uuid REFERENCES public.construction_sites(id) ON DELETE SET NULL,
  reference_site_material_id uuid,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inventory_movements_inventory_id_idx ON public.inventory_movements(inventory_id);
CREATE INDEX inventory_movements_product_id_idx ON public.inventory_movements(product_id);
CREATE INDEX inventory_movements_site_id_idx ON public.inventory_movements(reference_site_id);
CREATE UNIQUE INDEX inventory_movements_site_material_uk
  ON public.inventory_movements(reference_site_material_id)
  WHERE reference_site_material_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory_movements"
  ON public.inventory_movements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 2. inventory.min_stock
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS min_stock numeric;
UPDATE public.inventory SET min_stock = low_stock_threshold WHERE min_stock IS NULL;

-- 3. site_materials.product_id + delivered
ALTER TABLE public.site_materials
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.catalog_products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_delivered boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
CREATE INDEX IF NOT EXISTS site_materials_product_id_idx ON public.site_materials(product_id);

-- 4. Trigger: on delivery, create scarico movement
CREATE OR REPLACE FUNCTION public.on_site_material_delivered()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv_id uuid;
BEGIN
  IF NEW.is_delivered = true
     AND (TG_OP = 'INSERT' OR OLD.is_delivered IS DISTINCT FROM NEW.is_delivered)
     AND NEW.product_id IS NOT NULL
  THEN
    -- find matching inventory row (most recent) for this product
    SELECT id INTO v_inv_id
      FROM public.inventory
     WHERE product_id = NEW.product_id
     ORDER BY movement_date DESC, created_at DESC
     LIMIT 1;

    IF NEW.delivered_at IS NULL THEN NEW.delivered_at := now(); END IF;

    -- skip if a movement was already recorded for this site_material
    IF NOT EXISTS (
      SELECT 1 FROM public.inventory_movements
       WHERE reference_site_material_id = NEW.id
    ) THEN
      INSERT INTO public.inventory_movements(
        product_id, inventory_id, quantity, movement_type,
        reference_site_id, reference_site_material_id, note, created_by
      ) VALUES (
        NEW.product_id, v_inv_id, -abs(COALESCE(NEW.quantity,0)),
        'scarico_cantiere', NEW.site_id, NEW.id,
        'Consegna materiale: ' || COALESCE(NEW.material_name,''),
        COALESCE(NEW.added_by, auth.uid())
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_material_delivered ON public.site_materials;
CREATE TRIGGER trg_site_material_delivered
BEFORE INSERT OR UPDATE ON public.site_materials
FOR EACH ROW EXECUTE FUNCTION public.on_site_material_delivered();
