
CREATE POLICY "auth read lead attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lead-attachments');

CREATE POLICY "auth upload lead attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lead-attachments' AND owner = auth.uid());

CREATE POLICY "auth delete own lead attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lead-attachments' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "auth update own lead attachments"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'lead-attachments' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin')));
