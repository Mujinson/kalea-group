
-- Workers anagrafica table
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  fiscal_code TEXT,
  role TEXT,
  hourly_cost NUMERIC NOT NULL DEFAULT 25,
  hire_date DATE,
  status TEXT NOT NULL DEFAULT 'attivo',
  photo_url TEXT,
  notes TEXT,
  user_id UUID,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workers TO authenticated;
GRANT ALL ON public.workers TO service_role;

ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage workers"
ON public.workers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Workers can view own record"
ON public.workers FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER trg_workers_updated_at
BEFORE UPDATE ON public.workers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Worker documents
CREATE TABLE public.worker_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'altro',
  title TEXT NOT NULL,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_documents TO authenticated;
GRANT ALL ON public.worker_documents TO service_role;

ALTER TABLE public.worker_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage worker_documents"
ON public.worker_documents FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_worker_documents_updated_at
BEFORE UPDATE ON public.worker_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Extend site_workers and site_work_logs with worker_id
ALTER TABLE public.site_workers
  ADD COLUMN IF NOT EXISTS worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  ALTER COLUMN worker_user_id DROP NOT NULL;

ALTER TABLE public.site_work_logs
  ADD COLUMN IF NOT EXISTS worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS break_minutes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hourly_cost NUMERIC,
  ALTER COLUMN worker_user_id DROP NOT NULL;
