CREATE OR REPLACE FUNCTION public.assign_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_year int;
  v_seq int;
BEGIN
  v_year := COALESCE(NEW.invoice_year, EXTRACT(YEAR FROM COALESCE(NEW.invoice_date, CURRENT_DATE))::int);

  IF NEW.invoice_seq IS NULL THEN
    SELECT COALESCE(MAX(invoice_seq), 0) + 1
      INTO v_seq
      FROM public.customer_invoices
     WHERE invoice_year = v_year;
    NEW.invoice_seq := v_seq;
  END IF;

  NEW.invoice_year := v_year;

  IF NEW.invoice_number IS NULL OR btrim(NEW.invoice_number) = '' THEN
    NEW.invoice_number := v_year::text || '/' || LPAD(NEW.invoice_seq::text, 3, '0');
  END IF;

  RETURN NEW;
END;
$function$;

ALTER TABLE public.invoice_sales
  DROP CONSTRAINT IF EXISTS invoice_sales_invoice_id_fkey;

ALTER TABLE public.invoice_sales
  ADD CONSTRAINT invoice_sales_invoice_id_fkey
  FOREIGN KEY (invoice_id)
  REFERENCES public.customer_invoices(id)
  ON DELETE CASCADE;