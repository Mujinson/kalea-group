GRANT SELECT ON public.app_settings TO anon;
CREATE POLICY "Public can read social_latest_posts" ON public.app_settings FOR SELECT TO anon USING (key = 'social_latest_posts');