CREATE TABLE public.crew_cost_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  origin text NOT NULL DEFAULT 'Alzano Lombardo (BG)',
  net_salary numeric NOT NULL DEFAULT 2000,
  taxes numeric NOT NULL DEFAULT 1297,
  cape numeric NOT NULL DEFAULT 300,
  other_f24 numeric NOT NULL DEFAULT 400,
  work_days_month numeric NOT NULL DEFAULT 22,
  fuel_l_100km numeric NOT NULL DEFAULT 10,
  fuel_price numeric NOT NULL DEFAULT 1.75,
  lunch numeric NOT NULL DEFAULT 15,
  hotel numeric NOT NULL DEFAULT 80,
  dinner numeric NOT NULL DEFAULT 25,
  trasferta_km numeric NOT NULL DEFAULT 150,
  reference_daily numeric NOT NULL DEFAULT 300,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.crew_cost_settings TO authenticated;
GRANT ALL ON public.crew_cost_settings TO service_role;
ALTER TABLE public.crew_cost_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage crew settings" ON public.crew_cost_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.crew_cost_settings (singleton) VALUES (true);

CREATE TABLE public.site_daily_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  workers_count numeric NOT NULL DEFAULT 1,
  labor numeric NOT NULL DEFAULT 0,
  fuel numeric NOT NULL DEFAULT 0,
  tolls numeric NOT NULL DEFAULT 0,
  meals numeric NOT NULL DEFAULT 0,
  hotel numeric NOT NULL DEFAULT 0,
  other numeric NOT NULL DEFAULT 0,
  notes text,
  is_estimate boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX site_daily_costs_site_date ON public.site_daily_costs(site_id, work_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_daily_costs TO authenticated;
GRANT ALL ON public.site_daily_costs TO service_role;
ALTER TABLE public.site_daily_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage site daily costs" ON public.site_daily_costs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));