-- Update customer_status enum to new cluster values
ALTER TYPE customer_status RENAME VALUE 'lead' TO 'opportunity';
ALTER TYPE customer_status RENAME VALUE 'attivo' TO 'signed';
ALTER TYPE customer_status RENAME VALUE 'inattivo' TO 'working';

-- Create storage bucket for contract documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for contracts bucket
CREATE POLICY "Authenticated users can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can view contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can delete contracts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contracts');

-- Add quotes table for preventivi
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    quote_number TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, accepted, rejected, converted
    total_amount NUMERIC NOT NULL DEFAULT 0,
    vat_amount NUMERIC DEFAULT 0,
    vat_included BOOLEAN DEFAULT false,
    valid_until DATE,
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    additional_costs JSONB DEFAULT '[]'::jsonb,
    created_by TEXT,
    sent_date TIMESTAMP WITH TIME ZONE,
    accepted_date TIMESTAMP WITH TIME ZONE,
    converted_sale_id UUID REFERENCES public.sales(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS policy for quotes
CREATE POLICY "Admins can manage quotes"
ON public.quotes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));