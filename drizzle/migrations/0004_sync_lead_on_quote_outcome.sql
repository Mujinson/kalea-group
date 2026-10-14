CREATE OR REPLACE FUNCTION public.sync_lead_on_quote_outcome()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE l record; cid uuid;
BEGIN
  IF NEW.lead_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;

  IF NEW.status IN ('accepted','converted','invoiced') THEN
    SELECT * INTO l FROM leads WHERE id = NEW.lead_id;
    IF NOT FOUND THEN RETURN NEW; END IF;
    cid := NEW.customer_id;
    IF cid IS NULL AND coalesce(trim(l.email),'') <> '' THEN
      SELECT id INTO cid FROM customers WHERE lower(email) = lower(trim(l.email)) LIMIT 1;
    END IF;
    IF cid IS NULL THEN
      SELECT id INTO cid FROM customers WHERE lower(company_name) = lower(trim(coalesce(nullif(l.company_name,''), l.name))) LIMIT 1;
    END IF;
    IF cid IS NULL THEN
      INSERT INTO customers (company_name, first_name, email, phone, address, city, province, postal_code, country,
        vat_number, sdi_code, pec, iban, bank_name, customer_type, status, assigned_salesperson_id, notes)
      VALUES (trim(coalesce(nullif(l.company_name,''), l.name)), nullif(l.contact_person_name,''), l.email, l.phone, l.address,
        l.city, l.province, l.postal_code, coalesce(l.country,'Italia'), l.vat_number, l.sdi_code, l.pec, l.iban, l.bank_name,
        'cliente_privato', 'signed', l.assigned_salesperson_id, 'Convertito da lead a seguito di preventivo vinto')
      RETURNING id INTO cid;
    END IF;
    IF NEW.customer_id IS NULL THEN NEW.customer_id := cid; END IF;
    UPDATE leads SET status = 'vinto', pipeline_stage = 'hot', last_interaction_at = now() WHERE id = NEW.lead_id;
  ELSIF NEW.status = 'rejected' THEN
    IF NOT EXISTS (SELECT 1 FROM quotes WHERE lead_id = NEW.lead_id AND id <> NEW.id AND status IN ('accepted','converted','invoiced','sent','in_trattativa','draft')) THEN
      UPDATE leads SET status = 'perso', last_interaction_at = now() WHERE id = NEW.lead_id AND status <> 'vinto';
    END IF;
  ELSIF NEW.status IN ('sent','in_trattativa') THEN
    UPDATE leads SET status = CASE WHEN NEW.status='sent' THEN 'proposta' ELSE 'negoziazione' END
    WHERE id = NEW.lead_id AND status IN ('nuovo','contattato','qualificato','proposta');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_sync_lead_on_quote_outcome
BEFORE INSERT OR UPDATE OF status ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.sync_lead_on_quote_outcome();

UPDATE leads SET status = 'vinto', pipeline_stage = 'hot'
WHERE id IN (SELECT lead_id FROM quotes WHERE status IN ('accepted','converted','invoiced') AND lead_id IS NOT NULL);
UPDATE leads SET status = 'vinto' WHERE status = 'convertito';
UPDATE quotes SET status = status WHERE status IN ('accepted','converted','invoiced') AND lead_id IS NOT NULL AND customer_id IS NULL;