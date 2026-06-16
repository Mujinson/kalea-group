## Risposta diretta alla tua domanda

Tutti — admin, commerciali e operai — entrano **da un unico link**:

**`https://crm.kalea.space/admin/login`**

Dopo aver inserito email + password, il sistema legge il ruolo dell'utente da `user_roles` e lo smista automaticamente:

| Ruolo | Destinazione |
|---|---|
| admin | `/admin` (CRM completo) |
| commerciale | `/app/commerciale` (app mobile) |
| operaio | `/app/operaio` (app mobile cantieri) |
| ibrido | `/app/ibrido` (app mobile mista) |

L'utente non deve ricordare URL diversi: stesso login per tutti, la app giusta gli si apre da sola.

## Cosa sistemo con questo piano

In base alle tue risposte, faccio tre cose mirate:

### 1. Auto-redirect post-login per ruolo
Oggi `AdminLogin` manda tutti a `/admin`. Modifico in modo che dopo il login chiami `routeForRole(role)`:
- admin → `/admin`
- commerciale → `/app/commerciale`
- operaio → `/app/operaio`
- ibrido → `/app/ibrido`

Stessa logica applicata anche quando un utente già autenticato apre `/admin/login` (oggi resta sulla pagina di login).

### 2. Unificazione `/cantieri-app` → `/app/operaio`
- La route `/cantieri-app` diventa un redirect permanente a `/app/operaio`.
- Stesso redirect per `/:lang/cantieri-app` (già gestito da `AppLangRedirect`, lo allineo).
- Aggiorno la memoria `mem://admin/crm/worker-auth-flow` di conseguenza (oggi dice che gli operai vanno su `/cantieri-app`).

Le funzionalità di `WorkerApp` (timbra ore, foto pre/post, chat cantiere) restano disponibili — vanno migrate dentro `/app/operaio` come moduli della bottom-nav. Per non bloccare questa iterazione, in questo step faccio solo il redirect; la migrazione vera dei moduli WorkerApp dentro `OperaioApp` la faccio nello step successivo se confermi.

### 3. Schermata "stai per essere reindirizzato" più chiara
Oggi se un admin apre per sbaglio `/app/commerciale` vede "Questa app non è per il tuo ruolo" con un bottone manuale. Aggiungo un piccolo auto-redirect (1.5s) verso `routeForRole(role)` così non resta bloccato.

## File toccati

- `src/pages/admin/AdminLogin.tsx` — dopo `signIn` ok, leggere il ruolo e fare `navigate(routeForRole(role))` invece di `navigate('/admin')`.
- `src/App.tsx` — sostituire la route `/cantieri-app` con un `<Navigate to="/app/operaio" replace />`.
- `src/pages/AppLangRedirect.tsx` — assicurarsi che `/it/cantieri-app` finisca su `/app/operaio`.
- `src/components/role-app/RoleAppLayout.tsx` — aggiungere auto-redirect alla schermata "ruolo errato".
- `mem://admin/crm/worker-auth-flow` — aggiornare per riflettere il nuovo entry point unico.

## Cosa NON faccio in questo step

- Non sposto i moduli operativi di `WorkerApp` (timbratura, foto, chat) dentro `OperaioApp`: oggi `OperaioApp` ha solo "I miei cantieri" + stub. Se vuoi che li migri davvero, lo faccio come step separato per non mescolare troppe cose.
- Non tocco la creazione utenti — già funzionante in `CommercialiSection`.

Confermi e procedo?