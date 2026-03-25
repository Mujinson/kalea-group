
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can read own chatbot_conversations" ON public.chatbot_conversations;

-- Create a restrictive SELECT policy: public users can only read their own session
CREATE POLICY "Anyone can read own chatbot_conversations"
ON public.chatbot_conversations
FOR SELECT
TO public
USING (session_id = current_setting('request.headers', true)::json->>'x-session-id' OR has_role(auth.uid(), 'admin'::app_role));
