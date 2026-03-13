-- Enhance leads table with status, assignment, notes
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'nuovo';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city text;

-- Enhance customer_action_logs with contact person details
ALTER TABLE public.customer_action_logs ADD COLUMN IF NOT EXISTS contact_person_name text;
ALTER TABLE public.customer_action_logs ADD COLUMN IF NOT EXISTS contact_person_role text;
ALTER TABLE public.customer_action_logs ADD COLUMN IF NOT EXISTS contact_person_contact text;
ALTER TABLE public.customer_action_logs ADD COLUMN IF NOT EXISTS next_steps text;

-- Create customer_documents table for general file attachments
CREATE TABLE IF NOT EXISTS public.customer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'altro',
  title text NOT NULL,
  file_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer_documents"
ON public.customer_documents FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Commerciali can view documents for customers in their territories
CREATE POLICY "Commerciali can view own customer_documents"
ON public.customer_documents FOR SELECT TO authenticated
USING (
  customer_id IN (
    SELECT c.id FROM public.customers c
    WHERE c.region IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'regione'
    )
    OR c.province IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'provincia'
    )
  )
);

-- Commerciali can manage action logs for their territory customers
CREATE POLICY "Commerciali can manage action_logs"
ON public.customer_action_logs FOR ALL TO authenticated
USING (
  customer_id IN (
    SELECT c.id FROM public.customers c
    WHERE c.region IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'regione'
    )
    OR c.province IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'provincia'
    )
  )
)
WITH CHECK (
  customer_id IN (
    SELECT c.id FROM public.customers c
    WHERE c.region IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'regione'
    )
    OR c.province IN (
      SELECT st.territory_value FROM public.salesperson_territories st
      JOIN public.salespeople sp ON sp.id = st.salesperson_id
      WHERE sp.user_id = auth.uid() AND st.territory_type = 'provincia'
    )
  )
);

-- Create storage bucket for customer documents
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-documents', 'customer-documents', false) ON CONFLICT (id) DO NOTHING;