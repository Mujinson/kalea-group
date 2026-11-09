ALTER TABLE public.site_attachments
  ADD COLUMN IF NOT EXISTS storage_bucket text,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS source_quote_id uuid,
  ADD COLUMN IF NOT EXISTS source_attachment_id text;

CREATE UNIQUE INDEX IF NOT EXISTS site_attachments_quote_src_uniq
  ON public.site_attachments(site_id, source_quote_id, source_attachment_id)
  WHERE source_quote_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_quote_attachments_to_site(_quote_id uuid, _site_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE a jsonb; v_data jsonb;
BEGIN
  IF _quote_id IS NULL OR _site_id IS NULL THEN RETURN; END IF;
  SELECT quote_data::jsonb INTO v_data FROM public.quotes WHERE id = _quote_id;
  IF v_data IS NULL OR jsonb_typeof(v_data->'technicalAttachments') <> 'array' THEN RETURN; END IF;
  FOR a IN SELECT * FROM jsonb_array_elements(v_data->'technicalAttachments') LOOP
    IF coalesce(a->>'path','') = '' AND coalesce(a->>'url','') = '' THEN CONTINUE; END IF;
    INSERT INTO public.site_attachments(site_id, category, file_url, file_name, file_type, storage_bucket, storage_path, source_quote_id, source_attachment_id)
    VALUES (_site_id, 'Allegato preventivo',
      coalesce(nullif(a->>'url',''), 'quote-attachments/' || (a->>'path')),
      coalesce(a->>'name','Allegato'), 'application/pdf',
      CASE WHEN coalesce(a->>'path','') <> '' THEN 'quote-attachments' END,
      nullif(a->>'path',''), _quote_id, coalesce(a->>'id', a->>'path', a->>'url'))
    ON CONFLICT (site_id, source_quote_id, source_attachment_id) WHERE source_quote_id IS NOT NULL DO NOTHING;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.trg_site_copy_quote_attachments()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_TABLE_NAME = 'construction_sites' THEN
    PERFORM public.sync_quote_attachments_to_site(NEW.quote_id, NEW.id);
  ELSE
    PERFORM public.sync_quote_attachments_to_site(NEW.id, NEW.site_id);
    PERFORM public.sync_quote_attachments_to_site(NEW.id, s.id) FROM public.construction_sites s WHERE s.quote_id = NEW.id AND s.id IS DISTINCT FROM NEW.site_id;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_site_copy_quote_attachments ON public.construction_sites;
CREATE TRIGGER trg_site_copy_quote_attachments AFTER INSERT OR UPDATE OF quote_id ON public.construction_sites
  FOR EACH ROW EXECUTE FUNCTION public.trg_site_copy_quote_attachments();

DROP TRIGGER IF EXISTS trg_quote_copy_attachments_to_site ON public.quotes;
CREATE TRIGGER trg_quote_copy_attachments_to_site AFTER UPDATE OF quote_data, site_id ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.trg_site_copy_quote_attachments();

CREATE POLICY "Read quote attachments linked to visible sites" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'quote-attachments'
  AND EXISTS (SELECT 1 FROM public.site_attachments sa WHERE sa.storage_bucket = 'quote-attachments' AND sa.storage_path = objects.name)
);

SELECT public.sync_quote_attachments_to_site(q.id, s.id)
FROM public.construction_sites s JOIN public.quotes q ON q.id = s.quote_id;