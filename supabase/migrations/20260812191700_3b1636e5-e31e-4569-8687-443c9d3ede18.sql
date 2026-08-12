ALTER TABLE public.site_equipment
  ADD COLUMN IF NOT EXISTS quantity_needed numeric,
  ADD COLUMN IF NOT EXISTS quantity_on_site numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'da_portare',
  ADD COLUMN IF NOT EXISTS expected_date date,
  ADD COLUMN IF NOT EXISTS returned_date date;

ALTER TABLE public.site_equipment
  DROP CONSTRAINT IF EXISTS site_equipment_status_check;

ALTER TABLE public.site_equipment
  ADD CONSTRAINT site_equipment_status_check
  CHECK (status IN ('da_portare','in_cantiere','da_ritirare','mancante'));