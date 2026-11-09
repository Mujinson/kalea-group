CREATE OR REPLACE FUNCTION public.create_site_from_accepted_quote()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_site_id uuid;
  v_salesperson_id uuid;
  v_start date;
  v_end date;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND lower(NEW.status) IN ('accettato','accepted','approved','approvato')
     AND NEW.site_id IS NULL
  THEN
    SELECT id INTO v_site_id FROM public.construction_sites WHERE quote_id = NEW.id LIMIT 1;
    IF v_site_id IS NOT NULL THEN
      NEW.site_id := v_site_id;
      RETURN NEW;
    END IF;

    SELECT s.id INTO v_salesperson_id
      FROM public.salespeople s
      JOIN public.customers c ON c.assigned_salesperson_id = s.id
     WHERE c.id = NEW.customer_id LIMIT 1;

    BEGIN
      v_start := NULLIF(NEW.quote_data->>'dataInizioLavori','')::date;
    EXCEPTION WHEN others THEN v_start := NULL; END;
    BEGIN
      v_end := NULLIF(NEW.quote_data->>'dataFineLavori','')::date;
    EXCEPTION WHEN others THEN v_end := NULL; END;

    INSERT INTO public.construction_sites (
      title, project_name, customer_id, lead_id, quote_id, salesperson_id,
      address, city, province, postal_code, country, status, priority,
      estimated_hours, planned_start_date, planned_end_date, notes
    ) VALUES (
      COALESCE(NEW.project_name, NEW.subject, 'Cantiere da preventivo ' || COALESCE(NEW.quote_number,'')),
      NEW.project_name, NEW.customer_id, NEW.lead_id, NEW.id, v_salesperson_id,
      NEW.site_address, NEW.site_city, NEW.site_province, NEW.site_postal_code, NEW.site_country,
      'pianificato', 'media', NULL,
      COALESCE(v_start, CURRENT_DATE), v_end, NEW.notes
    ) RETURNING id INTO v_site_id;

    NEW.site_id := v_site_id;
  END IF;
  RETURN NEW;
END;
$function$;