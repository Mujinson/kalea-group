
-- Remove public INSERT policies from chatbot tables
-- The edge function uses service_role key which bypasses RLS
DROP POLICY IF EXISTS "Anyone can insert chatbot_messages" ON public.chatbot_messages;
DROP POLICY IF EXISTS "Anyone can insert chatbot_conversations" ON public.chatbot_conversations;
