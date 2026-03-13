
-- Add new fields to quotes table for the enhanced form
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS site_country TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS site_address TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS site_postal_code TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS site_city TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS site_province TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS transport_method TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS delivery_time TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 0.22;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS payment_terms_text TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS tipologia TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS subject TEXT;
