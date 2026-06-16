
-- Realtime for site chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_chat_messages;

-- Notify on time-off events
CREATE OR REPLACE FUNCTION public.notify_time_off()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid;
  v_label text;
BEGIN
  v_label := CASE NEW.kind
    WHEN 'ferie' THEN 'Ferie'
    WHEN 'malattia' THEN 'Malattia'
    WHEN 'permesso' THEN 'Permesso'
    ELSE 'Indisponibilità'
  END;

  IF TG_OP = 'INSERT' THEN
    FOR v_admin IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
      INSERT INTO public.notifications(user_id, type, title, body, link, entity_id)
      VALUES (
        v_admin,
        'time_off_requested',
        'Nuova richiesta: ' || v_label,
        to_char(NEW.start_date,'DD/MM') || ' → ' || to_char(NEW.end_date,'DD/MM'),
        '/admin/time-off',
        NEW.id
      );
    END LOOP;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status
        AND NEW.status IN ('approved','rejected') THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, entity_id)
    VALUES (
      NEW.user_id,
      'time_off_decided',
      'Richiesta ' || v_label || ' ' || CASE NEW.status WHEN 'approved' THEN 'approvata' ELSE 'rifiutata' END,
      to_char(NEW.start_date,'DD/MM') || ' → ' || to_char(NEW.end_date,'DD/MM'),
      '/app',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_time_off ON public.time_off_requests;
CREATE TRIGGER trg_notify_time_off
  AFTER INSERT OR UPDATE OF status ON public.time_off_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_time_off();
