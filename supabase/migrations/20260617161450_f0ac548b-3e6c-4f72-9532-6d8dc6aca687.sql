
-- 1) Colonne di collegamento
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.construction_sites(id) ON DELETE SET NULL;

ALTER TABLE public.construction_sites
  ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_lead_id ON public.quotes(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotes_site_id ON public.quotes(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_quote_id ON public.construction_sites(quote_id);
CREATE INDEX IF NOT EXISTS idx_sites_salesperson_id ON public.construction_sites(salesperson_id);

-- 2) Trigger: alla accettazione di un preventivo, crea il cantiere se non esiste
CREATE OR REPLACE FUNCTION public.create_site_from_accepted_quote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_id uuid;
  v_salesperson_id uuid;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND lower(NEW.status) IN ('accettato','accepted','approved','approvato')
     AND NEW.site_id IS NULL
  THEN
    -- Cantiere già esistente con questo quote_id?
    SELECT id INTO v_site_id FROM public.construction_sites WHERE quote_id = NEW.id LIMIT 1;
    IF v_site_id IS NOT NULL THEN
      NEW.site_id := v_site_id;
      RETURN NEW;
    END IF;

    -- Risolvo commerciale da cliente
    SELECT s.id INTO v_salesperson_id
      FROM public.salespeople s
      JOIN public.customers c ON c.assigned_salesperson_id = s.id
     WHERE c.id = NEW.customer_id
     LIMIT 1;

    INSERT INTO public.construction_sites (
      title, project_name, customer_id, lead_id, quote_id, salesperson_id,
      address, city, province, postal_code, country, status, priority,
      estimated_hours, planned_start_date, planned_end_date, notes
    ) VALUES (
      COALESCE(NEW.project_name, NEW.subject, 'Cantiere da preventivo ' || COALESCE(NEW.quote_number,'')),
      NEW.project_name,
      NEW.customer_id,
      NEW.lead_id,
      NEW.id,
      v_salesperson_id,
      NEW.site_address, NEW.site_city, NEW.site_province, NEW.site_postal_code, NEW.site_country,
      'pianificato', 'media',
      NULL,
      CURRENT_DATE,
      NULL,
      NEW.notes
    ) RETURNING id INTO v_site_id;

    NEW.site_id := v_site_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_site_from_accepted_quote ON public.quotes;
CREATE TRIGGER trg_create_site_from_accepted_quote
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.create_site_from_accepted_quote();

-- 3) Backfill: per ogni preventivo già accettato senza cantiere collegato → creo il cantiere
DO $$
DECLARE
  q RECORD;
  v_site_id uuid;
  v_salesperson_id uuid;
BEGIN
  FOR q IN
    SELECT * FROM public.quotes
     WHERE lower(COALESCE(status,'')) IN ('accettato','accepted','approved','approvato')
       AND site_id IS NULL
  LOOP
    SELECT id INTO v_site_id FROM public.construction_sites WHERE quote_id = q.id LIMIT 1;
    IF v_site_id IS NULL THEN
      SELECT s.id INTO v_salesperson_id
        FROM public.salespeople s
        JOIN public.customers c ON c.assigned_salesperson_id = s.id
       WHERE c.id = q.customer_id
       LIMIT 1;

      INSERT INTO public.construction_sites (
        title, project_name, customer_id, lead_id, quote_id, salesperson_id,
        address, city, province, postal_code, country, status, priority,
        planned_start_date, notes
      ) VALUES (
        COALESCE(q.project_name, q.subject, 'Cantiere da preventivo ' || COALESCE(q.quote_number,'')),
        q.project_name, q.customer_id, q.lead_id, q.id, v_salesperson_id,
        q.site_address, q.site_city, q.site_province, q.site_postal_code, q.site_country,
        'pianificato', 'media',
        CURRENT_DATE, q.notes
      ) RETURNING id INTO v_site_id;
    END IF;
    UPDATE public.quotes SET site_id = v_site_id WHERE id = q.id;
  END LOOP;
END;
$$;
