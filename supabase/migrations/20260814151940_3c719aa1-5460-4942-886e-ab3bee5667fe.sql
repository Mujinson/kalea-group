CREATE TABLE public.telegram_allowed_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id text NOT NULL UNIQUE,
  title text,
  chat_type text,
  approved boolean NOT NULL DEFAULT false,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_allowed_chats TO authenticated;
GRANT ALL ON public.telegram_allowed_chats TO service_role;
ALTER TABLE public.telegram_allowed_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage telegram chats" ON public.telegram_allowed_chats FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));