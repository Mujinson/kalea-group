
CREATE POLICY "Admins manage worker-files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'worker-files' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'worker-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read worker-files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'worker-files');
