CREATE TABLE public.gabriel_email_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mail_key text NOT NULL UNIQUE,
  account text NOT NULL,
  area text NOT NULL DEFAULT 'kalea',
  from_name text, from_email text, subject text, received_at timestamptz,
  message_id text, gmail_thread_id text,
  cliente text, azienda text, progetto text, richiesta text, azione text,
  priorita text NOT NULL DEFAULT 'media',
  riassunto text, bozza_risposta text,
  status text NOT NULL DEFAULT 'da_fare',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gabriel_email_tasks TO authenticated;
GRANT ALL ON public.gabriel_email_tasks TO service_role;
ALTER TABLE public.gabriel_email_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email tasks" ON public.gabriel_email_tasks FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));