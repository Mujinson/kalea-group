
-- Construction sites table
CREATE TABLE public.construction_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  project_name TEXT,
  customer_id UUID REFERENCES public.customers(id),
  lead_id UUID REFERENCES public.leads(id),
  address TEXT,
  city TEXT,
  province TEXT,
  region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Italia',
  tipologia TEXT,
  product_model TEXT,
  status TEXT NOT NULL DEFAULT 'attivo',
  notes TEXT,
  contact_name TEXT,
  contact_surname TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.construction_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage construction_sites" ON public.construction_sites
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Commerciali can view construction_sites" ON public.construction_sites
  FOR SELECT TO authenticated
  USING (true);

-- Site media table
CREATE TABLE public.site_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  file_size BIGINT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site_media" ON public.site_media
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Commerciali can view site_media" ON public.site_media
  FOR SELECT TO authenticated
  USING (true);

-- Add assigned_to for appointments (salesperson tracking)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.salespeople(id);

-- Add updated_at trigger to construction_sites
CREATE TRIGGER update_construction_sites_updated_at
  BEFORE UPDATE ON public.construction_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
