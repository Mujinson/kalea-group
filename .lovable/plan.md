# Migrazione CRM su `crm.kalea.space`

Obiettivo: quando un utente apre `crm.kalea.space`, vede **solo il CRM** (login + dashboard admin/commerciale/operaio), senza poter navigare il sito pubblico Kalēa. Il sito pubblico continua a vivere su `kalea.space`.

## 1. DNS (lato tuo, su registrar)

Aggiungere un record per il sottodominio che punti all'hosting Lovable:

```text
Type:  A
Name:  crm
Value: 185.158.133.1
TTL:   Auto
```

(Se usi Cloudflare in proxy, useremo invece la modalità CNAME proxy nel pannello Lovable.)

## 2. Collegamento dominio in Lovable

In **Project Settings → Domains → Connect domain** aggiungere `crm.kalea.space`. Lovable verifica DNS e provisiona automaticamente l'SSL. `kalea.space` e `www.kalea.space` restano collegati come oggi.

## 3. Routing app: rilevare il sottodominio

L'app è una SPA con React Router. Aggiungiamo un rilevamento di hostname in `src/App.tsx` (o in un nuovo wrapper `CrmHostGate`) con questa logica:

- Se `window.location.hostname === "crm.kalea.space"`:
  - **Qualsiasi path** viene gestito come se fosse sotto `/admin`.
  - Path pubblici (`/`, `/it`, `/parquet`, `/chi-siamo`, ecc.) → redirect a `/admin` (o a `/admin/login` se non loggato).
  - Le route pubbliche **non vengono montate** su questo host: l'utente non può raggiungerle nemmeno digitandole.
- Altrimenti (host `kalea.space`, `www.kalea.space`, preview Lovable):
  - Comportamento attuale invariato: sito pubblico + `/admin` raggiungibile come oggi.

In pratica `App.tsx` espone due alberi di route distinti in base all'host.

## 4. Link interni e redirect post-login

- `useAdminAuth.signUp` usa `${window.location.origin}/admin` come `emailRedirectTo`: continuerà a funzionare, perché su `crm.kalea.space` l'origin è già quello giusto.
- `AdminLayout`: il bottone "Dashboard" naviga a `/admin` → ok su entrambi gli host.
- I link nel sito pubblico verso `/admin` (es. footer, navbar admin shortcut, se presenti) restano puntati a `kalea.space/admin`. Opzionale: farli puntare a `https://crm.kalea.space` con un link assoluto. Da confermare se vuoi questa modifica ora o dopo.

## 5. SEO

Su `crm.kalea.space` aggiungere `<meta name="robots" content="noindex,nofollow">` e un `robots.txt` virtuale (via meta tag, dato che è SPA) per non indicizzare il CRM. Sitemap pubblica resta solo su `kalea.space`.

## 6. Cosa NON cambia

- Database, edge functions, Supabase auth: nessuna modifica. Le sessioni sono per-origin, quindi un utente loggato su `kalea.space/admin` dovrà rifare login su `crm.kalea.space` la prima volta (origin diverso = storage diverso). Questo è il comportamento standard e atteso.
- URL interne del CRM (`/admin/leads`, `/admin/cantieri`, ecc.): identiche. Cambia solo l'host.

## Dettagli tecnici (per riferimento)

File toccati:
- `src/App.tsx` — split routing per hostname (host gate).
- *(nuovo)* `src/lib/host.ts` — helper `isCrmHost()`.
- `index.html` — meta `robots` condizionale via piccolo script inline che legge `location.hostname`.
- `src/pages/admin/AdminLogin.tsx` — nessuna modifica logica; eventualmente titolo "Kalēa CRM".

Nessuna modifica a Supabase, RLS, edge functions o schema DB.

## Domanda prima di procedere

Vuoi che, quando un utente apre `kalea.space/admin` (vecchio URL), venga **redirezionato automaticamente a `crm.kalea.space/admin`**? Oppure preferisci che entrambi gli URL restino funzionanti in parallelo?
