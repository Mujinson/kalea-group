
-- Appointments table for scheduled meetings
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  appointment_type TEXT NOT NULL DEFAULT 'chiamata',
  status TEXT NOT NULL DEFAULT 'confermato',
  location TEXT,
  notes TEXT,
  created_by TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Chatbot conversations table
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'website',
  session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  qualification_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chatbot_conversations" ON public.chatbot_conversations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Chatbot messages table
CREATE TABLE public.chatbot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chatbot_messages" ON public.chatbot_messages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow anonymous inserts for chatbot (website visitors)
CREATE POLICY "Anyone can insert chatbot_conversations" ON public.chatbot_conversations
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read own chatbot_conversations" ON public.chatbot_conversations
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can insert chatbot_messages" ON public.chatbot_messages
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read chatbot_messages" ON public.chatbot_messages
  FOR SELECT TO public
  USING (true);

-- Follow-up automations table
CREATE TABLE public.lead_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  automation_type TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lead_automations" ON public.lead_automations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add pipeline_stage column to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'cold';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS qualification_score INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS project_sqm TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS project_type TEXT;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatbot_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_automations;
