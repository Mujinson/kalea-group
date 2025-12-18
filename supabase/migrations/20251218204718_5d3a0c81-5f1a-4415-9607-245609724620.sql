-- Drop existing overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete contracts" ON storage.objects;

-- Create admin-only storage policies for contracts bucket
CREATE POLICY "Admins can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete contracts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contracts' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Add UPDATE policy for admins as well
CREATE POLICY "Admins can update contracts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'contracts' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'contracts' AND public.has_role(auth.uid(), 'admin'::public.app_role));