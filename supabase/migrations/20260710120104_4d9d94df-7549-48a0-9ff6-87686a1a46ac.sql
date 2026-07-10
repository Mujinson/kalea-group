DROP POLICY IF EXISTS "auth read lead attachments" ON storage.objects;

CREATE POLICY "auth read lead attachments" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lead-attachments'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR owner = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.lead_attachments la
      JOIN public.leads l ON l.id = la.lead_id
      LEFT JOIN public.salespeople s ON s.id = l.assigned_salesperson_id
      WHERE la.file_path = storage.objects.name
        AND (
          la.uploaded_by = auth.uid()
          OR l.assigned_user_id = auth.uid()
          OR l.created_by_user_id = auth.uid()
          OR s.user_id = auth.uid()
        )
    )
  )
);