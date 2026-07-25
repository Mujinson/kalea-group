
ALTER TABLE public.construction_sites
  ADD COLUMN IF NOT EXISTS sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS budget_amount numeric;

CREATE INDEX IF NOT EXISTS idx_construction_sites_sale_id ON public.construction_sites(sale_id);

ALTER TABLE public.commissions
  ADD COLUMN IF NOT EXISTS sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_commissions_sale_id ON public.commissions(sale_id);
