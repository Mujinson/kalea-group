
CREATE TABLE IF NOT EXISTS public.preventivi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  numero_preventivo TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  importo_totale NUMERIC(12,2) NOT NULL DEFAULT 0,
  stato TEXT NOT NULL DEFAULT 'bozza',
  lingua TEXT NOT NULL DEFAULT 'IT',
  cliente_nome TEXT,
  cantiere TEXT,
  json_dati JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.preventivi TO authenticated;
GRANT ALL ON public.preventivi TO service_role;

ALTER TABLE public.preventivi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view preventivi"
  ON public.preventivi FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert preventivi"
  ON public.preventivi FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update preventivi"
  ON public.preventivi FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete preventivi"
  ON public.preventivi FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_preventivi_lead_id ON public.preventivi(lead_id);
CREATE INDEX IF NOT EXISTS idx_preventivi_customer_id ON public.preventivi(customer_id);
CREATE INDEX IF NOT EXISTS idx_preventivi_created_at ON public.preventivi(created_at DESC);

CREATE TRIGGER trg_preventivi_updated_at
  BEFORE UPDATE ON public.preventivi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
