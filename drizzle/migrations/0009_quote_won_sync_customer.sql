CREATE OR REPLACE FUNCTION public.sync_customer_on_quote_won()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE c record;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  IF NEW.status IN ('accepted','converted','invoiced') AND NEW.customer_id IS NOT NULL THEN
    NEW.accepted_date := coalesce(NEW.accepted_date, now());
    UPDATE customers SET status = 'signed' WHERE id = NEW.customer_id AND status = 'opportunity';
    IF NEW.lead_id IS NULL THEN
      SELECT email, company_name INTO c FROM customers WHERE id = NEW.customer_id;
      UPDATE leads SET status='vinto', pipeline_stage='hot', last_interaction_at=now()
      WHERE status <> 'vinto' AND (
        (coalesce(trim(c.email),'')<>'' AND lower(trim(email))=lower(trim(c.email)))
        OR lower(trim(coalesce(nullif(company_name,''),name)))=lower(trim(c.company_name)));
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sync_customer_on_quote_won ON public.quotes;
CREATE TRIGGER trg_sync_customer_on_quote_won BEFORE INSERT OR UPDATE OF status ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.sync_customer_on_quote_won();