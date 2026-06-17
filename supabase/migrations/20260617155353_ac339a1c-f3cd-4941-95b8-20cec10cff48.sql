
-- 1) crews
CREATE TABLE public.crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#8C7B6B',
  max_workers integer NOT NULL DEFAULT 5,
  lead_worker_id uuid REFERENCES public.workers(id) ON DELETE SET NULL,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crews TO authenticated;
GRANT ALL ON public.crews TO service_role;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage crews" ON public.crews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "authenticated read crews" ON public.crews FOR SELECT TO authenticated USING (true);
CREATE TRIGGER trg_crews_updated BEFORE UPDATE ON public.crews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) crew_members
CREATE TABLE public.crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'operaio',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(worker_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crew_members TO authenticated;
GRANT ALL ON public.crew_members TO service_role;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage crew_members" ON public.crew_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "authenticated read crew_members" ON public.crew_members FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_crew_members_crew ON public.crew_members(crew_id);

-- 3) crew_assignments
CREATE TABLE public.crew_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  hours_per_day numeric NOT NULL DEFAULT 8,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crew_assignments TO authenticated;
GRANT ALL ON public.crew_assignments TO service_role;
ALTER TABLE public.crew_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage crew_assignments" ON public.crew_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "authenticated read crew_assignments" ON public.crew_assignments FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_crew_assignments_site ON public.crew_assignments(site_id, start_date);
CREATE INDEX idx_crew_assignments_crew ON public.crew_assignments(crew_id, start_date);
CREATE TRIGGER trg_crew_assignments_updated BEFORE UPDATE ON public.crew_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
