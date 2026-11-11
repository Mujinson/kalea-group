CREATE TABLE public.floor_visualizer_textures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL UNIQUE,
  texture_url text,
  real_width_cm numeric,
  real_height_cm numeric,
  default_rotation numeric NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.floor_visualizer_textures TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.floor_visualizer_textures TO authenticated;
GRANT ALL ON public.floor_visualizer_textures TO service_role;
ALTER TABLE public.floor_visualizer_textures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads visualizer textures" ON public.floor_visualizer_textures FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage visualizer textures" ON public.floor_visualizer_textures FOR ALL TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::app_role)) WITH CHECK (public.has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins write visualizer textures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'visualizer-textures' AND public.has_role((select auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins update visualizer textures" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'visualizer-textures' AND public.has_role((select auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins delete visualizer textures" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'visualizer-textures' AND public.has_role((select auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "Read quote attachments linked to visible sites" ON storage.objects;
CREATE POLICY "Read quote attachments linked to visible sites" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'quote-attachments' AND EXISTS (
  SELECT 1 FROM public.site_attachments sa
  WHERE sa.storage_bucket = 'quote-attachments' AND sa.storage_path = objects.name
    AND (public.has_role((select auth.uid()), 'admin'::app_role)
         OR EXISTS (SELECT 1 FROM public.site_workers sw WHERE sw.site_id = sa.site_id AND sw.worker_user_id = (select auth.uid())))
));