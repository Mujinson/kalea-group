CREATE OR REPLACE FUNCTION public.submit_public_lead(_name text, _email text, _phone text DEFAULT NULL::text, _message text DEFAULT NULL::text, _company_name text DEFAULT NULL::text, _source text DEFAULT 'website'::text, _interest text DEFAULT NULL::text, _city text DEFAULT NULL::text, _province text DEFAULT NULL::text, _region text DEFAULT NULL::text, _country text DEFAULT NULL::text)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE new_id uuid;
BEGIN
  IF _name IS NULL OR length(btrim(_name)) = 0 THEN RAISE EXCEPTION 'name required'; END IF;
  IF _email IS NULL OR _email !~* '^[^@]+@[^@]+\.[^@]+$' THEN RAISE EXCEPTION 'valid email required'; END IF;
  INSERT INTO public.leads (name, email, phone, message, company_name, source, notes, city, province, region, country)
  VALUES (btrim(_name), lower(btrim(_email)), _phone, _message, _company_name, COALESCE(_source,'website'),
          CASE WHEN _interest IS NOT NULL AND btrim(_interest) <> '' THEN 'Interesse: ' || _interest END,
          _city, _province, _region, _country)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$function$;