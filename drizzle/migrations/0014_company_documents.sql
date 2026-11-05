CREATE TABLE public.company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'altro',
  doc_type text,
  title text NOT NULL,
  worker_id uuid REFERENCES public.workers(id) ON DELETE SET NULL,
  issuer text,
  document_number text,
  issue_date date,
  expiry_date date,
  file_path text,
  file_name text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_documents TO authenticated;
GRANT ALL ON public.company_documents TO service_role;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage company documents" ON public.company_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_company_documents_updated BEFORE UPDATE ON public.company_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ON public.company_documents(category);
CREATE INDEX ON public.company_documents(expiry_date);
CREATE POLICY "Admin read company-documents" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='company-documents' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin upload company-documents" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='company-documents' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete company-documents" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='company-documents' AND public.has_role(auth.uid(),'admin'));