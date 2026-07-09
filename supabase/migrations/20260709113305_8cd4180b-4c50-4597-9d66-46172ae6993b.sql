
CREATE TABLE public.worker_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES public.workers(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('start_home','arrive_site','pause_start','pause_end','leave_site','arrive_home')),
  event_at timestamptz NOT NULL DEFAULT now(),
  event_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Europe/Rome')::date,
  latitude numeric,
  longitude numeric,
  accuracy_m numeric,
  site_id uuid REFERENCES public.construction_sites(id) ON DELETE SET NULL,
  distance_from_site_m numeric,
  is_at_site boolean,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wte_user_date ON public.worker_time_entries(user_id, event_date DESC, event_at);
CREATE INDEX idx_wte_site ON public.worker_time_entries(site_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_time_entries TO authenticated;
GRANT ALL ON public.worker_time_entries TO service_role;

ALTER TABLE public.worker_time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time entries"
  ON public.worker_time_entries FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own time entries"
  ON public.worker_time_entries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own time entries"
  ON public.worker_time_entries FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete time entries"
  ON public.worker_time_entries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_wte_updated_at
  BEFORE UPDATE ON public.worker_time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
