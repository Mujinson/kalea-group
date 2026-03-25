
-- Drop the current policy that tries to use request headers (won't work reliably)
DROP POLICY IF EXISTS "Anyone can read own chatbot_conversations" ON public.chatbot_conversations;

-- Only admins need to SELECT conversations (the edge function uses service role key)
-- No public SELECT policy needed
