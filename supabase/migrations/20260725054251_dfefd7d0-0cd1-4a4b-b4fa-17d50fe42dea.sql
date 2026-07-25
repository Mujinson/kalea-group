
-- 1. Add salesperson_id to customer_invoices
ALTER TABLE public.customer_invoices
  ADD COLUMN IF NOT EXISTS salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL;

-- 2. Link payment_schedules to customer_invoices
ALTER TABLE public.payment_schedules
  ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.customer_invoices(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payment_schedules_invoice_id ON public.payment_schedules(invoice_id);

-- 3. Link customer_payments to a specific rata (optional)
ALTER TABLE public.customer_payments
  ADD COLUMN IF NOT EXISTS payment_schedule_id uuid REFERENCES public.payment_schedules(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_customer_payments_schedule_id ON public.customer_payments(payment_schedule_id);

-- 4. Trigger: marca la rata come pagata quando arriva un pagamento collegato,
--    e la rimette in "non pagata" se tutti i pagamenti vengono rimossi.
CREATE OR REPLACE FUNCTION public.sync_payment_schedule_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sched uuid;
  v_remaining int;
BEGIN
  IF TG_OP IN ('INSERT','UPDATE') AND NEW.payment_schedule_id IS NOT NULL THEN
    UPDATE public.payment_schedules
       SET is_paid = true,
           paid_date = COALESCE(paid_date, NEW.payment_date, CURRENT_DATE)
     WHERE id = NEW.payment_schedule_id;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.payment_schedule_id IS NOT NULL
     AND (NEW.payment_schedule_id IS DISTINCT FROM OLD.payment_schedule_id) THEN
    v_sched := OLD.payment_schedule_id;
    SELECT count(*) INTO v_remaining FROM public.customer_payments
      WHERE payment_schedule_id = v_sched AND id <> NEW.id;
    IF v_remaining = 0 THEN
      UPDATE public.payment_schedules SET is_paid = false, paid_date = NULL WHERE id = v_sched;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' AND OLD.payment_schedule_id IS NOT NULL THEN
    v_sched := OLD.payment_schedule_id;
    SELECT count(*) INTO v_remaining FROM public.customer_payments
      WHERE payment_schedule_id = v_sched AND id <> OLD.id;
    IF v_remaining = 0 THEN
      UPDATE public.payment_schedules SET is_paid = false, paid_date = NULL WHERE id = v_sched;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_customer_payments_sync_schedule ON public.customer_payments;
CREATE TRIGGER trg_customer_payments_sync_schedule
AFTER INSERT OR UPDATE OR DELETE ON public.customer_payments
FOR EACH ROW EXECUTE FUNCTION public.sync_payment_schedule_paid();

-- 5. Deprecata commercial_invoices (vuota)
ALTER TABLE IF EXISTS public.commercial_invoices RENAME TO _deprecated_commercial_invoices;
