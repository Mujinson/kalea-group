
CREATE TABLE public.tool_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_key text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_settings TO authenticated;
GRANT ALL ON public.tool_settings TO service_role;

ALTER TABLE public.tool_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tool settings"
ON public.tool_settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_tool_settings_updated_at
BEFORE UPDATE ON public.tool_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
