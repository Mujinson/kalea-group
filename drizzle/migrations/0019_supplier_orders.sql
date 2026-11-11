CREATE TABLE public.supplier_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  site_id uuid REFERENCES public.construction_sites(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'bozza',
  payment_terms text,
  requested_delivery_date date,
  delivery_place text,
  carrier text,
  transport text,
  reference text,
  notes text,
  show_prices boolean NOT NULL DEFAULT false,
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_orders TO authenticated;
GRANT ALL ON public.supplier_orders TO service_role;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage supplier orders" ON public.supplier_orders FOR ALL TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::app_role));
CREATE TRIGGER supplier_orders_updated_at BEFORE UPDATE ON public.supplier_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();