CREATE OR REPLACE FUNCTION public.calculate_commission_on_quote_accept()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_pct numeric;
  v_is_earner boolean;
  v_material_total numeric := 0;
  v_item jsonb;
  v_category text;
  v_amount numeric;
  v_customer_name text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('accepted','accettato')
  THEN
    v_user_id := COALESCE(NEW.created_by, NEW.assigned_to);
    IF v_user_id IS NULL THEN RETURN NEW; END IF;

    IF EXISTS (SELECT 1 FROM public.commissions WHERE quote_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    SELECT s.is_commission_earner, COALESCE(s.commission_rate, 0)
      INTO v_is_earner, v_pct
      FROM public.salespeople s
     WHERE s.user_id = v_user_id
     LIMIT 1;

    IF NOT COALESCE(v_is_earner, false) OR COALESCE(v_pct,0) = 0 THEN
      RETURN NEW;
    END IF;

    IF NEW.items IS NOT NULL THEN
      FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
        v_category := lower(COALESCE(v_item->>'category', v_item->>'tipo', ''));
        IF v_category NOT IN ('posa','labor','servizio','manodopera','service') THEN
          v_amount := COALESCE((v_item->>'total')::numeric,
                              (v_item->>'totale')::numeric,
                              ((v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric),
                              0);
          v_material_total := v_material_total + v_amount;
        END IF;
      END LOOP;
    END IF;

    IF v_material_total = 0 THEN
      v_material_total := COALESCE(NEW.total_amount, 0);
    END IF;

    SELECT COALESCE(NULLIF(btrim(c.company_name), ''),
                    btrim(COALESCE(c.first_name,'') || ' ' || COALESCE(c.last_name,'')))
      INTO v_customer_name
      FROM public.customers c
     WHERE c.id = NEW.customer_id;

    INSERT INTO public.commissions (
      user_id, quote_id, customer_id, customer_name, base_amount, percentage, amount, status
    ) VALUES (
      v_user_id, NEW.id, NEW.customer_id, NULLIF(v_customer_name,''),
      v_material_total, v_pct, ROUND(v_material_total * v_pct / 100, 2),
      'da_liquidare'
    );
  END IF;
  RETURN NEW;
END;
$function$;

UPDATE public.commissions cm
   SET customer_name = COALESCE(NULLIF(btrim(c.company_name), ''),
                                NULLIF(btrim(COALESCE(c.first_name,'') || ' ' || COALESCE(c.last_name,'')), ''))
  FROM public.customers c
 WHERE c.id = cm.customer_id
   AND (cm.customer_name IS NULL OR btrim(cm.customer_name) = '');