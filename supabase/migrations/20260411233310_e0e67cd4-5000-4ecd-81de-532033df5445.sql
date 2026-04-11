
-- Work logs table
CREATE TABLE public.site_work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  worker_user_id uuid NOT NULL,
  work_date date NOT NULL DEFAULT CURRENT_DATE,
  hours_worked numeric NOT NULL DEFAULT 0,
  notes text,
  materials_used text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_work_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site_work_logs"
  ON public.site_work_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Workers can view own logs"
  ON public.site_work_logs FOR SELECT TO authenticated
  USING (worker_user_id = auth.uid());

CREATE POLICY "Workers can insert own logs"
  ON public.site_work_logs FOR INSERT TO authenticated
  WITH CHECK (worker_user_id = auth.uid());

-- Work photos table
CREATE TABLE public.site_work_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_log_id uuid NOT NULL REFERENCES public.site_work_logs(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_work_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site_work_photos"
  ON public.site_work_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Workers can view own photos"
  ON public.site_work_photos FOR SELECT TO authenticated
  USING (work_log_id IN (SELECT id FROM public.site_work_logs WHERE worker_user_id = auth.uid()));

CREATE POLICY "Workers can insert own photos"
  ON public.site_work_photos FOR INSERT TO authenticated
  WITH CHECK (work_log_id IN (SELECT id FROM public.site_work_logs WHERE worker_user_id = auth.uid()));

-- Workers can view active construction sites
CREATE POLICY "Workers can view active sites"
  ON public.construction_sites FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'operaio') AND status = 'attivo');

-- Storage bucket for work photos
INSERT INTO storage.buckets (id, name, public) VALUES ('work-photos', 'work-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Workers can upload work photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'work-photos');

CREATE POLICY "Anyone can view work photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'work-photos');

-- Trigger for updated_at
CREATE TRIGGER update_site_work_logs_updated_at
  BEFORE UPDATE ON public.site_work_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
