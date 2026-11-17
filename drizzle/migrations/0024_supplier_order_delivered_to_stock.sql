CREATE OR REPLACE FUNCTION public.supplier_order_to_inventory()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE l jsonb; v_marker text;
BEGIN
  IF NEW.status = 'consegnato' AND COALESCE(NEW.direction,'uscita') = 'uscita'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    v_marker := 'Ordine ' || NEW.order_number;
    IF EXISTS (SELECT 1 FROM public.inventory WHERE notes LIKE v_marker || '%') THEN RETURN NEW; END IF;
    FOR l IN SELECT * FROM jsonb_array_elements(COALESCE(NEW.lines,'[]'::jsonb)) LOOP
      IF COALESCE((l->>'qty')::numeric,0) <= 0 THEN CONTINUE; END IF;
      INSERT INTO public.inventory(product_type, quantity_sqm, purchase_cost, movement_type, notes, movement_date, supplier_id, product_id)
      VALUES (
        COALESCE(NULLIF(l->>'description',''), l->>'code', 'Articolo'),
        (l->>'qty')::numeric,
        round((l->>'qty')::numeric * COALESCE(NULLIF(l->>'price','')::numeric,0) * (1 - COALESCE(NULLIF(l->>'discount','')::numeric,0)/100), 2),
        'carico',
        v_marker || ' · ' || COALESCE(l->>'um','') || COALESCE(' · cod. ' || NULLIF(l->>'supplierCode',''), ''),
        COALESCE(NEW.requested_delivery_date, CURRENT_DATE),
        NEW.supplier_id,
        (SELECT id FROM public.catalog_products WHERE NULLIF(l->>'code','') IS NOT NULL AND product_code = l->>'code' LIMIT 1)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.supplier_order_to_inventory() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_supplier_order_to_inventory AFTER INSERT OR UPDATE ON public.supplier_orders
FOR EACH ROW EXECUTE FUNCTION public.supplier_order_to_inventory();