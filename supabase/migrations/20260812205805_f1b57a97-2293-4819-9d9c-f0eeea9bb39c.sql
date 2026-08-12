CREATE TABLE public.supplier_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric NOT NULL DEFAULT 0,
  vat_rate numeric DEFAULT 22,
  vat_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'da_pagare',
  is_reverse_charge boolean NOT NULL DEFAULT false,
  site_id uuid REFERENCES public.construction_sites(id) ON DELETE SET NULL,
  category text,
  payment_method text,
  attachment_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT supplier_invoices_status_check CHECK (status IN ('da_pagare','pagata_parziale','pagata'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_invoices TO authenticated;
GRANT ALL ON public.supplier_invoices TO service_role;

ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access supplier_invoices"
ON public.supplier_invoices FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_supplier_invoices_supplier ON public.supplier_invoices(supplier_id);
CREATE INDEX idx_supplier_invoices_site ON public.supplier_invoices(site_id);
CREATE INDEX idx_supplier_invoices_status ON public.supplier_invoices(status);
CREATE INDEX idx_supplier_invoices_due ON public.supplier_invoices(due_date);

-- normalizza importi e stato
CREATE OR REPLACE FUNCTION public.normalize_supplier_invoice()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_reverse_charge THEN
    NEW.vat_rate := 0;
    NEW.vat_amount := 0;
  ELSE
    NEW.vat_amount := COALESCE(NEW.vat_amount, 0);
  END IF;
  NEW.total := COALESCE(NEW.subtotal,0) + COALESCE(NEW.vat_amount,0);
  IF COALESCE(NEW.paid_amount,0) <= 0 THEN
    NEW.status := 'da_pagare';
  ELSIF NEW.paid_amount >= NEW.total THEN
    NEW.status := 'pagata';
  ELSE
    NEW.status := 'pagata_parziale';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_supplier_invoice
BEFORE INSERT OR UPDATE ON public.supplier_invoices
FOR EACH ROW EXECUTE FUNCTION public.normalize_supplier_invoice();

-- A2: supplier_payments
ALTER TABLE public.supplier_payments
  ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supplier_invoice_id uuid REFERENCES public.supplier_invoices(id) ON DELETE CASCADE;

UPDATE public.supplier_payments sp
SET supplier_id = s.id
FROM public.suppliers s
WHERE sp.supplier_id IS NULL
  AND lower(trim(sp.supplier_name)) = lower(trim(s.name));

CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier ON public.supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_invoice ON public.supplier_payments(supplier_invoice_id);

CREATE OR REPLACE FUNCTION public.sync_supplier_invoice_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid;
BEGIN
  target := COALESCE(NEW.supplier_invoice_id, OLD.supplier_invoice_id);
  IF target IS NOT NULL THEN
    UPDATE public.supplier_invoices si
    SET paid_amount = COALESCE((
      SELECT SUM(p.payment_amount) FROM public.supplier_payments p
      WHERE p.supplier_invoice_id = si.id
    ), 0)
    WHERE si.id = target;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.supplier_invoice_id IS DISTINCT FROM NEW.supplier_invoice_id
     AND OLD.supplier_invoice_id IS NOT NULL THEN
    UPDATE public.supplier_invoices si
    SET paid_amount = COALESCE((
      SELECT SUM(p.payment_amount) FROM public.supplier_payments p
      WHERE p.supplier_invoice_id = si.id
    ), 0)
    WHERE si.id = OLD.supplier_invoice_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_supplier_invoice_paid
AFTER INSERT OR UPDATE OR DELETE ON public.supplier_payments
FOR EACH ROW EXECUTE FUNCTION public.sync_supplier_invoice_paid();

-- A3: fixed_costs next_due_date
ALTER TABLE public.fixed_costs ADD COLUMN IF NOT EXISTS next_due_date date;

UPDATE public.fixed_costs SET next_due_date = cost_date WHERE next_due_date IS NULL;

CREATE OR REPLACE FUNCTION public.roll_fixed_cost_next_due()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  step interval;
  base date;
BEGIN
  IF NEW.is_paid IS TRUE AND COALESCE(OLD.is_paid, false) IS FALSE THEN
    step := CASE NEW.frequency::text
      WHEN 'mensile' THEN interval '1 month'
      WHEN 'trimestrale' THEN interval '3 months'
      WHEN 'annuale' THEN interval '12 months'
      ELSE NULL
    END;
    IF step IS NOT NULL THEN
      base := COALESCE(NEW.next_due_date, NEW.cost_date, CURRENT_DATE);
      NEW.next_due_date := (base + step)::date;
      NEW.is_paid := false;
      NEW.paid_date := NULL;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_roll_fixed_cost_next_due
BEFORE UPDATE ON public.fixed_costs
FOR EACH ROW EXECUTE FUNCTION public.roll_fixed_cost_next_due();