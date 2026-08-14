UPDATE public.telegram_allowed_chats SET approved = true WHERE approved IS DISTINCT FROM true;
INSERT INTO public.telegram_allowed_chats (chat_id, approved, chat_type, title)
VALUES ('733155347', true, 'private', 'Chat approvata manualmente')
ON CONFLICT (chat_id) DO UPDATE SET approved = true;