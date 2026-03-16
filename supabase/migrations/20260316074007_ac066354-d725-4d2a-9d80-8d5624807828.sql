
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lead_type text,
  ADD COLUMN IF NOT EXISTS contact_person_name text,
  ADD COLUMN IF NOT EXISTS contact_person_role text,
  ADD COLUMN IF NOT EXISTS contact_person_email text,
  ADD COLUMN IF NOT EXISTS contact_person_phone text,
  ADD COLUMN IF NOT EXISTS address text;
