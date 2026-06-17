DROP POLICY IF EXISTS "Workers can view assigned sites" ON public.construction_sites;

CREATE POLICY "Workers and hybrid users can view assigned sites"
ON public.construction_sites
FOR SELECT
TO authenticated
USING (
  (public.has_role(auth.uid(), 'operaio'::public.app_role) OR public.has_role(auth.uid(), 'ibrido'::public.app_role))
  AND EXISTS (
    SELECT 1
    FROM public.site_workers sw
    WHERE sw.site_id = construction_sites.id
      AND sw.worker_user_id = auth.uid()
      AND COALESCE(sw.is_active, true) = true
  )
);