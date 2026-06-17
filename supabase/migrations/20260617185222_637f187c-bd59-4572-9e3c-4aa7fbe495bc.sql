
CREATE OR REPLACE FUNCTION public.submit_public_lead(
  _name text,
  _email text,
  _phone text DEFAULT NULL,
  _message text DEFAULT NULL,
  _company text DEFAULT NULL,
  _source text DEFAULT 'website',
  _interest text DEFAULT NULL,
  _city text DEFAULT NULL,
  _province text DEFAULT NULL,
  _region text DEFAULT NULL,
  _country text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF _name IS NULL OR length(btrim(_name)) = 0 THEN
    RAISE EXCEPTION 'name required';
  END IF;
  IF _email IS NULL OR _email !~* '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'valid email required';
  END IF;

  INSERT INTO public.leads (name, email, phone, message, company, source, interest, city, province, region, country)
  VALUES (btrim(_name), lower(btrim(_email)), _phone, _message, _company, COALESCE(_source,'website'), _interest, _city, _province, _region, _country)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_lead(text,text,text,text,text,text,text,text,text,text,text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
