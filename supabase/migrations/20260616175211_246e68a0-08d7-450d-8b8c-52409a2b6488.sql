
-- 1) Add assigned_user_id to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_user_id uuid;
CREATE INDEX IF NOT EXISTS idx_leads_assigned_user_id ON public.leads(assigned_user_id);

-- 2) Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins delete notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- 3) Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 4) Trigger to notify on lead assignment
CREATE OR REPLACE FUNCTION public.notify_lead_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target uuid;
BEGIN
  -- Direct user assignment
  IF NEW.assigned_user_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.assigned_user_id IS DISTINCT FROM OLD.assigned_user_id)
  THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, entity_id)
    VALUES (
      NEW.assigned_user_id,
      'lead_assigned',
      'Nuovo lead assegnato',
      COALESCE(NEW.name, 'Lead') || COALESCE(' — ' || NEW.city, ''),
      '/app/commerciale/lead/' || NEW.id::text,
      NEW.id
    );
  END IF;

  -- Salesperson assignment → resolve to user
  IF NEW.assigned_salesperson_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.assigned_salesperson_id IS DISTINCT FROM OLD.assigned_salesperson_id)
  THEN
    SELECT user_id INTO v_target FROM public.salespeople WHERE id = NEW.assigned_salesperson_id LIMIT 1;
    IF v_target IS NOT NULL AND v_target <> COALESCE(NEW.assigned_user_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
      INSERT INTO public.notifications(user_id, type, title, body, link, entity_id)
      VALUES (
        v_target,
        'lead_assigned',
        'Nuovo lead assegnato',
        COALESCE(NEW.name, 'Lead') || COALESCE(' — ' || NEW.city, ''),
        '/app/commerciale/lead/' || NEW.id::text,
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_lead_assignment ON public.leads;
CREATE TRIGGER trg_notify_lead_assignment
  AFTER INSERT OR UPDATE OF assigned_user_id, assigned_salesperson_id ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.notify_lead_assignment();
