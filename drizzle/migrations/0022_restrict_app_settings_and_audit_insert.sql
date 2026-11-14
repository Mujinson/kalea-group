DROP POLICY IF EXISTS "Authenticated can read app_settings" ON public.app_settings;
CREATE POLICY "Authenticated can read public app_settings" ON public.app_settings FOR SELECT TO authenticated USING (key = 'social_latest_posts');
DROP POLICY IF EXISTS "audit insert auth" ON public.catalog_audit_log;