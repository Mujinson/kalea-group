
-- ============================================
-- CUSTOMER INVOICES
-- ============================================
CREATE TABLE public.customer_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  invoice_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  invoice_seq integer NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  site_id uuid REFERENCES public.construction_sites(id) ON DELETE SET NULL,
  description text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  vat_rate numeric(5,2) NOT NULL DEFAULT 22,
  vat_amount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  tranche_scheme text NOT NULL DEFAULT 'custom', -- '100_anticipo' | '50_50' | '30_40_30' | 'custom'
  tranche_type text, -- 'anticipo' | 'sal' | 'saldo' | 'unico' | 'custom'
  tranche_percentage numeric(5,2),
  status text NOT NULL DEFAULT 'bozza', -- 'bozza' | 'emessa' | 'parziale' | 'pagata' | 'scaduta' | 'annullata'
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invoice_year, invoice_seq)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_invoices TO authenticated;
GRANT ALL ON public.customer_invoices TO service_role;

ALTER TABLE public.customer_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access invoices" ON public.customer_invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_invoices_customer ON public.customer_invoices(customer_id);
CREATE INDEX idx_invoices_quote ON public.customer_invoices(quote_id);
CREATE INDEX idx_invoices_site ON public.customer_invoices(site_id);
CREATE INDEX idx_invoices_status ON public.customer_invoices(status);
CREATE INDEX idx_invoices_date ON public.customer_invoices(invoice_date);

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON public.customer_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CUSTOMER PAYMENTS
-- ============================================
CREATE TABLE public.customer_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.customer_invoices(id) ON DELETE CASCADE,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  method text NOT NULL DEFAULT 'bonifico', -- 'bonifico' | 'assegno' | 'carta' | 'contanti' | 'altro'
  tranche_type text, -- 'anticipo' | 'sal' | 'saldo' | 'unico'
  reference text, -- CRO, n. assegno, note
  notes text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_payments TO authenticated;
GRANT ALL ON public.customer_payments TO service_role;

ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access payments" ON public.customer_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_payments_invoice ON public.customer_payments(invoice_id);
CREATE INDEX idx_payments_date ON public.customer_payments(payment_date);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.customer_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- NUMERAZIONE AUTOMATICA
-- ============================================
CREATE OR REPLACE FUNCTION public.assign_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year int;
  v_seq int;
BEGIN
  IF NEW.invoice_number IS NOT NULL AND NEW.invoice_number <> '' THEN
    RETURN NEW;
  END IF;
  v_year := COALESCE(NEW.invoice_year, EXTRACT(YEAR FROM COALESCE(NEW.invoice_date, CURRENT_DATE))::int);
  SELECT COALESCE(MAX(invoice_seq), 0) + 1 INTO v_seq
    FROM public.customer_invoices WHERE invoice_year = v_year;
  NEW.invoice_year := v_year;
  NEW.invoice_seq := v_seq;
  NEW.invoice_number := v_year::text || '/' || LPAD(v_seq::text, 3, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assign_invoice_number
  BEFORE INSERT ON public.customer_invoices
  FOR EACH ROW EXECUTE FUNCTION public.assign_invoice_number();

-- ============================================
-- RICALCOLO STATO FATTURA
-- ============================================
CREATE OR REPLACE FUNCTION public.recalc_invoice_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid;
  v_paid numeric;
  v_total numeric;
  v_due date;
  v_current_status text;
  v_new_status text;
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  SELECT COALESCE(SUM(amount), 0) INTO v_paid
    FROM public.customer_payments WHERE invoice_id = v_invoice_id;
  SELECT total, due_date, status INTO v_total, v_due, v_current_status
    FROM public.customer_invoices WHERE id = v_invoice_id;

  IF v_current_status IN ('bozza','annullata') THEN
    UPDATE public.customer_invoices SET paid_amount = v_paid WHERE id = v_invoice_id;
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_paid >= v_total AND v_total > 0 THEN
    v_new_status := 'pagata';
  ELSIF v_paid > 0 THEN
    v_new_status := 'parziale';
  ELSIF v_due IS NOT NULL AND v_due < CURRENT_DATE THEN
    v_new_status := 'scaduta';
  ELSE
    v_new_status := 'emessa';
  END IF;

  UPDATE public.customer_invoices
    SET paid_amount = v_paid, status = v_new_status
    WHERE id = v_invoice_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_payment_recalc_status
  AFTER INSERT OR UPDATE OR DELETE ON public.customer_payments
  FOR EACH ROW EXECUTE FUNCTION public.recalc_invoice_status();

-- ============================================
-- VISTA AGGREGATA CREDITI PER CLIENTE
-- ============================================
CREATE OR REPLACE VIEW public.v_customer_receivables AS
SELECT
  c.id AS customer_id,
  c.first_name || ' ' || COALESCE(c.last_name,'') AS customer_name,
  COALESCE(SUM(CASE WHEN lower(q.status) IN ('accettato','accepted','approved','approvato')
                    THEN q.total_amount ELSE 0 END), 0) AS venduto,
  COALESCE((SELECT SUM(i.total) FROM public.customer_invoices i
            WHERE i.customer_id = c.id AND i.status <> 'annullata'), 0) AS fatturato,
  COALESCE((SELECT SUM(i.paid_amount) FROM public.customer_invoices i
            WHERE i.customer_id = c.id AND i.status <> 'annullata'), 0) AS incassato,
  COALESCE((SELECT SUM(i.total - i.paid_amount) FROM public.customer_invoices i
            WHERE i.customer_id = c.id AND i.status IN ('emessa','parziale','scaduta')), 0) AS da_incassare,
  COALESCE((SELECT SUM(i.total - i.paid_amount) FROM public.customer_invoices i
            WHERE i.customer_id = c.id AND i.status = 'scaduta'), 0) AS scaduto
FROM public.customers c
LEFT JOIN public.quotes q ON q.customer_id = c.id
GROUP BY c.id, c.first_name, c.last_name;

GRANT SELECT ON public.v_customer_receivables TO authenticated;
