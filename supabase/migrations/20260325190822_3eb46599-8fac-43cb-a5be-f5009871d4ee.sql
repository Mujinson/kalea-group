
-- Remove the public SELECT policy on chatbot_messages
DROP POLICY IF EXISTS "Anyone can read chatbot_messages" ON public.chatbot_messages;
