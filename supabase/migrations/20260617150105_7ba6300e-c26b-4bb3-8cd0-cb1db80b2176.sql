
ALTER TABLE public.construction_sites
  ADD COLUMN IF NOT EXISTS floor_type text,
  ADD COLUMN IF NOT EXISTS floor_brand text,
  ADD COLUMN IF NOT EXISTS floor_model text,
  ADD COLUMN IF NOT EXISTS floor_color text,
  ADD COLUMN IF NOT EXISTS floor_thickness text,
  ADD COLUMN IF NOT EXISTS floor_sqm numeric,
  ADD COLUMN IF NOT EXISTS floor_lot text,
  ADD COLUMN IF NOT EXISTS floor_tech_notes text,
  ADD COLUMN IF NOT EXISTS planned_start_date date,
  ADD COLUMN IF NOT EXISTS planned_end_date date,
  ADD COLUMN IF NOT EXISTS available_days integer,
  ADD COLUMN IF NOT EXISTS estimated_hours numeric,
  ADD COLUMN IF NOT EXISTS building_floor text,
  ADD COLUMN IF NOT EXISTS has_elevator boolean,
  ADD COLUMN IF NOT EXISTS access_difficulty text,
  ADD COLUMN IF NOT EXISTS parking_available boolean,
  ADD COLUMN IF NOT EXISTS parking_distance_m integer,
  ADD COLUMN IF NOT EXISTS ztl_zone boolean,
  ADD COLUMN IF NOT EXISTS permits_required boolean,
  ADD COLUMN IF NOT EXISTS electricity_available boolean,
  ADD COLUMN IF NOT EXISTS water_available boolean,
  ADD COLUMN IF NOT EXISTS inhabited boolean,
  ADD COLUMN IF NOT EXISTS construction_type text,
  ADD COLUMN IF NOT EXISTS logistics_notes text,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;

ALTER TABLE public.site_work_logs
  ADD COLUMN IF NOT EXISTS start_latitude numeric,
  ADD COLUMN IF NOT EXISTS start_longitude numeric,
  ADD COLUMN IF NOT EXISTS end_latitude numeric,
  ADD COLUMN IF NOT EXISTS end_longitude numeric,
  ADD COLUMN IF NOT EXISTS start_distance_m integer,
  ADD COLUMN IF NOT EXISTS end_distance_m integer;

CREATE TABLE IF NOT EXISTS public.site_accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  type text NOT NULL,
  quantity numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_accessories TO authenticated;
GRANT ALL ON public.site_accessories TO service_role;
ALTER TABLE public.site_accessories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage accessories" ON public.site_accessories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Workers read accessories" ON public.site_accessories FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = site_accessories.site_id AND sw.worker_user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.site_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  type text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_equipment TO authenticated;
GRANT ALL ON public.site_equipment TO service_role;
ALTER TABLE public.site_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage equipment" ON public.site_equipment FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Workers read equipment" ON public.site_equipment FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = site_equipment.site_id AND sw.worker_user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.site_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  completed_by uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_checklist_items TO authenticated;
GRANT ALL ON public.site_checklist_items TO service_role;
ALTER TABLE public.site_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage checklist" ON public.site_checklist_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Workers read checklist" ON public.site_checklist_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = site_checklist_items.site_id AND sw.worker_user_id = auth.uid()));
CREATE POLICY "Workers tick checklist" ON public.site_checklist_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = site_checklist_items.site_id AND sw.worker_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = site_checklist_items.site_id AND sw.worker_user_id = auth.uid()));
CREATE TRIGGER trg_checklist_updated BEFORE UPDATE ON public.site_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.site_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  reported_by uuid NOT NULL,
  reporter_name text,
  issue_type text NOT NULL,
  description text,
  photo_url text NOT NULL,
  status text NOT NULL DEFAULT 'aperta',
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_issues TO authenticated;
GRANT ALL ON public.site_issues TO service_role;
ALTER TABLE public.site_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage issues" ON public.site_issues FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Workers view site issues" ON public.site_issues FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = site_issues.site_id AND sw.worker_user_id = auth.uid()));
CREATE POLICY "Workers create issues" ON public.site_issues FOR INSERT TO authenticated
  WITH CHECK (reported_by = auth.uid() AND EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = site_issues.site_id AND sw.worker_user_id = auth.uid()));
CREATE TRIGGER trg_issues_updated BEFORE UPDATE ON public.site_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.site_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  category text,
  file_url text NOT NULL,
  file_name text,
  file_type text,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_attachments TO authenticated;
GRANT ALL ON public.site_attachments TO service_role;
ALTER TABLE public.site_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage attachments" ON public.site_attachments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Workers read attachments" ON public.site_attachments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = site_attachments.site_id AND sw.worker_user_id = auth.uid()));
