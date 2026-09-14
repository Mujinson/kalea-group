CREATE TABLE public.public_quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_en text,
  name_de text,
  name_fr text,
  description text,
  category text NOT NULL DEFAULT 'posa',
  unit text NOT NULL DEFAULT 'mq',
  price_min numeric NOT NULL DEFAULT 0,
  price_max numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.public_quote_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_quote_items TO authenticated;
GRANT ALL ON public.public_quote_items TO service_role;

ALTER TABLE public.public_quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active public quote items"
  ON public.public_quote_items FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage public quote items"
  ON public.public_quote_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_public_quote_items_updated
  BEFORE UPDATE ON public.public_quote_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.public_quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text,
  province text,
  customer_type text,
  notes text,
  language text NOT NULL DEFAULT 'it',
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_min numeric NOT NULL DEFAULT 0,
  total_max numeric NOT NULL DEFAULT 0,
  vat_rate numeric NOT NULL DEFAULT 22,
  privacy_consent boolean NOT NULL DEFAULT false,
  lead_id uuid,
  status text NOT NULL DEFAULT 'nuova',
  source_ip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.public_quote_requests TO authenticated;
GRANT ALL ON public.public_quote_requests TO service_role;

ALTER TABLE public.public_quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff read quote requests"
  ON public.public_quote_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated staff update quote requests"
  ON public.public_quote_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER trg_public_quote_requests_updated
  BEFORE UPDATE ON public.public_quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_public_quote_requests_created ON public.public_quote_requests (created_at DESC);