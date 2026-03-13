-- Add commerciale to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'commerciale';

-- Add user_id to salespeople to link to auth accounts
ALTER TABLE public.salespeople ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_salespeople_user_id ON public.salespeople(user_id) WHERE user_id IS NOT NULL;

-- Create territory assignments table
CREATE TABLE IF NOT EXISTS public.salesperson_territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id uuid NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  territory_type text NOT NULL CHECK (territory_type IN ('regione', 'provincia')),
  territory_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id, territory_type, territory_value)
);

ALTER TABLE public.salesperson_territories ENABLE ROW LEVEL SECURITY;

-- Admins can manage all territories
CREATE POLICY "Admins can manage salesperson_territories" 
ON public.salesperson_territories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Commerciali can view their own territories
CREATE POLICY "Commerciali can view own territories" 
ON public.salesperson_territories FOR SELECT TO authenticated
USING (
  salesperson_id IN (
    SELECT id FROM public.salespeople WHERE user_id = auth.uid()
  )
);