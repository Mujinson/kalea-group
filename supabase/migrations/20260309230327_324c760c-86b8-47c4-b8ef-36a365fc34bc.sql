INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public video access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'videos');