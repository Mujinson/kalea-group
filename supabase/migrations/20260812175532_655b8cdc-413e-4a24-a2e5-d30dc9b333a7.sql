-- Una vendita non può essere il risultato di due preventivi diversi
CREATE UNIQUE INDEX IF NOT EXISTS quotes_converted_sale_id_unique
  ON public.quotes (converted_sale_id)
  WHERE converted_sale_id IS NOT NULL;

-- Un preventivo già convertito non può essere riconvertito su un'altra vendita
CREATE OR REPLACE FUNCTION public.prevent_quote_reconversion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.converted_sale_id IS NOT NULL
     AND NEW.converted_sale_id IS NOT NULL
     AND NEW.converted_sale_id IS DISTINCT FROM OLD.converted_sale_id
  THEN
    RAISE EXCEPTION 'Preventivo già convertito in vendita: scollegare prima la vendita esistente';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_quote_reconversion ON public.quotes;
CREATE TRIGGER trg_prevent_quote_reconversion
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.prevent_quote_reconversion();