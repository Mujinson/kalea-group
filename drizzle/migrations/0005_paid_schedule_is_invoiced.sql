CREATE OR REPLACE FUNCTION public.mark_paid_schedule_invoiced()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_paid AND NOT coalesce(NEW.is_invoiced,false) THEN
    NEW.is_invoiced := true;
    NEW.invoiced_amount := coalesce(NEW.invoiced_amount, NEW.amount);
  ELSIF NOT coalesce(NEW.is_paid,false) AND TG_OP='UPDATE' AND coalesce(OLD.is_paid,false)
        AND NEW.invoice_id IS NULL AND coalesce(NEW.invoice_number,'') = '' THEN
    NEW.is_invoiced := false;
    NEW.invoiced_amount := NULL;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_mark_paid_schedule_invoiced
BEFORE INSERT OR UPDATE ON public.payment_schedules
FOR EACH ROW EXECUTE FUNCTION public.mark_paid_schedule_invoiced();

UPDATE public.payment_schedules SET is_invoiced = true, invoiced_amount = coalesce(invoiced_amount, amount)
WHERE is_paid AND NOT coalesce(is_invoiced,false);