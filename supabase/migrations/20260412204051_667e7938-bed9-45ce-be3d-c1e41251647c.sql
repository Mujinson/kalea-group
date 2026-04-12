-- Site Workers: assign workers to construction sites
CREATE TABLE public.site_workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  worker_user_id UUID NOT NULL,
  worker_role TEXT DEFAULT 'operaio',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, worker_user_id)
);

ALTER TABLE public.site_workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site_workers" ON public.site_workers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Workers can view own assignments" ON public.site_workers
  FOR SELECT TO authenticated
  USING (worker_user_id = auth.uid());

-- Site Materials: track materials used per site
CREATE TABLE public.site_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pz',
  unit_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  usage_date DATE DEFAULT CURRENT_DATE,
  added_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site_materials" ON public.site_materials
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Workers can insert site_materials" ON public.site_materials
  FOR INSERT TO authenticated
  WITH CHECK (added_by = auth.uid());

CREATE POLICY "Workers can view site_materials" ON public.site_materials
  FOR SELECT TO authenticated
  USING (site_id IN (SELECT sw.site_id FROM public.site_workers sw WHERE sw.worker_user_id = auth.uid()));

-- Site Expenses: track expenses per site
CREATE TABLE public.site_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  expense_type TEXT NOT NULL DEFAULT 'altro',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE DEFAULT CURRENT_DATE,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  receipt_url TEXT,
  added_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site_expenses" ON public.site_expenses
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add start_date and end_date triggers for updated_at
CREATE TRIGGER update_site_workers_updated_at
  BEFORE UPDATE ON public.site_workers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_expenses_updated_at
  BEFORE UPDATE ON public.site_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();