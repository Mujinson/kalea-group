# Assegnazione lead & notifiche

Attualmente i commerciali vedono già solo i lead assegnati al proprio `salespersonId` o creati da loro — quindi i lead di altri non compaiono. Quello che manca è:

1. Un modo per l'**admin** di assegnare un lead a **qualsiasi utente** (commerciale, ibrido o operaio), non solo a chi ha un record in `salespeople`.
2. Una **notifica in-app** al destinatario quando riceve un nuovo lead.
3. La vista mobile del destinatario deve mostrare anche i lead assegnati a lui come utente (oltre a quelli via `salespersonId`).

## Modifiche

### Database
- Aggiungere colonna `assigned_user_id uuid` a `leads` (riferimento logico a `auth.users`).
- Creare tabella `notifications`:
  - `user_id` (destinatario), `type` (`lead_assigned` | …), `title`, `body`, `link`, `read_at`, `entity_id`.
  - RLS: ogni utente vede/aggiorna solo le proprie notifiche; admin/service_role pieno accesso.
  - Realtime abilitato.
- Trigger su `leads`: quando `assigned_user_id` o `assigned_salesperson_id` cambia (INSERT o UPDATE), crea una `notifications` per l'utente destinatario.

### Backend / vista mobile
- `CommercialeLeads.tsx`: estendere il filtro a `assigned_user_id = user.id OR assigned_salesperson_id = salespersonId OR created_by_user_id = user.id`.
- `OperaioApp` / `IbridoApp`: piccola pagina "I miei lead" basata sullo stesso filtro (per operaio: solo `assigned_user_id`).

### Notifiche
- Hook `useNotifications()` con Realtime subscription su `notifications` filtrato per `user_id = auth.uid()`.
- Badge sul tab attivo + bottom sheet/lista in `RoleProfile` o icona in header con conteggio non letti.
- Toast quando arriva una notifica nuova mentre l'app è aperta.

### Admin UI
- Nella vista admin Leads, accanto al selettore "Salesperson" aggiungere selettore "Assegna a utente" (lista di utenti con ruolo commerciale/ibrido/operaio dalla tabella `user_roles`).
- Salvataggio aggiorna `assigned_user_id` → il trigger crea automaticamente la notifica.

## Note tecniche
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;`
- Nessuna modifica al meccanismo di chat/SMS esistente — solo notifiche in-app per ora.
- I lead esistenti restano invariati; `assigned_user_id` NULL = nessun utente specifico, si applica solo il flusso salesperson attuale.

Confermi e procedo con la migrazione?
