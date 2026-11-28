CREATE TABLE IF NOT EXISTS public.site_attendance_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  decision text NOT NULL CHECK (decision IN ('ammessa', 'esclusa')),
  note text,
  decided_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, worker_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_site_attendance_overrides_site
  ON public.site_attendance_overrides (site_id, work_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_attendance_overrides TO authenticated;
GRANT ALL ON public.site_attendance_overrides TO service_role;

ALTER TABLE public.site_attendance_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage site attendance overrides" ON public.site_attendance_overrides;
CREATE POLICY "Admins manage site attendance overrides"
  ON public.site_attendance_overrides
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_site_attendance_overrides_updated_at ON public.site_attendance_overrides;
CREATE TRIGGER update_site_attendance_overrides_updated_at
  BEFORE UPDATE ON public.site_attendance_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.construction_sites
  ADD COLUMN IF NOT EXISTS travel_mode text NOT NULL DEFAULT 'auto'
  CHECK (travel_mode IN ('auto', 'on', 'off'));