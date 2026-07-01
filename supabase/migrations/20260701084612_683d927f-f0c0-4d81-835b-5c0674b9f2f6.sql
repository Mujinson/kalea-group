
GRANT SELECT, INSERT, UPDATE, DELETE ON public.preventivi TO authenticated;
GRANT ALL ON public.preventivi TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='preventivi' AND policyname='Authenticated can insert own preventivi') THEN
    CREATE POLICY "Authenticated can insert own preventivi"
      ON public.preventivi FOR INSERT TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='preventivi' AND policyname='Authenticated can select own preventivi') THEN
    CREATE POLICY "Authenticated can select own preventivi"
      ON public.preventivi FOR SELECT TO authenticated
      USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='preventivi' AND policyname='Authenticated can update own preventivi') THEN
    CREATE POLICY "Authenticated can update own preventivi"
      ON public.preventivi FOR UPDATE TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quotes' AND policyname='Authenticated can insert quotes') THEN
    CREATE POLICY "Authenticated can insert quotes"
      ON public.quotes FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quotes' AND policyname='Authenticated can update quotes') THEN
    CREATE POLICY "Authenticated can update quotes"
      ON public.quotes FOR UPDATE TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quotes' AND policyname='Authenticated can select quotes') THEN
    CREATE POLICY "Authenticated can select quotes"
      ON public.quotes FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;
