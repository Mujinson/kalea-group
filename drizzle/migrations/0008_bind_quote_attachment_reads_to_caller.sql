ALTER POLICY "Read accessible quote attachments" ON storage.objects TO authenticated USING (
  bucket_id = 'quote-attachments'
  AND EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id::text = (storage.foldername(objects.name))[1]
      AND (
        public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
        OR (
          (public.has_role((SELECT auth.uid()), 'commerciale'::public.app_role) OR public.has_role((SELECT auth.uid()), 'ibrido'::public.app_role))
          AND (
            q.created_by = (SELECT auth.uid())::text
            OR q.assigned_to = (SELECT auth.uid())::text
            OR q.assigned_to IN (SELECT s.id::text FROM public.salespeople s WHERE s.user_id = (SELECT auth.uid()))
            OR q.customer_id IN (SELECT c.id FROM public.customers c JOIN public.salespeople s ON s.id = c.assigned_salesperson_id WHERE s.user_id = (SELECT auth.uid()))
          )
        )
      )
  )
);