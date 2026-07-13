CREATE TABLE public.crm_assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_assistant_conversations TO authenticated;
GRANT ALL ON public.crm_assistant_conversations TO service_role;

ALTER TABLE public.crm_assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own conversations"
  ON public.crm_assistant_conversations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_crm_assistant_conversations_updated_at
  BEFORE UPDATE ON public.crm_assistant_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.crm_assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.crm_assistant_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_assistant_messages TO authenticated;
GRANT ALL ON public.crm_assistant_messages TO service_role;

ALTER TABLE public.crm_assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own conversation messages"
  ON public.crm_assistant_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_assistant_conversations c
      WHERE c.id = conversation_id
        AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users insert own conversation messages"
  ON public.crm_assistant_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.crm_assistant_conversations c
      WHERE c.id = conversation_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete own conversation messages"
  ON public.crm_assistant_messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_assistant_conversations c
      WHERE c.id = conversation_id
        AND (c.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE INDEX idx_crm_assistant_messages_conversation ON public.crm_assistant_messages(conversation_id, created_at);
CREATE INDEX idx_crm_assistant_conversations_user ON public.crm_assistant_conversations(user_id, updated_at DESC);