ALTER TABLE public.payment_schedules
  ADD COLUMN IF NOT EXISTS is_invoiced boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS invoice_number text,
  ADD COLUMN IF NOT EXISTS invoiced_amount numeric;