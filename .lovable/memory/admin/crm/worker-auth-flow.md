---
name: Worker auth flow
description: Unified login entry point — all roles (admin, commerciale, operaio, ibrido) sign in at /admin/login and are auto-redirected to their role app
type: feature
---
Tutti gli utenti del CRM (admin, commerciale, operaio, ibrido) entrano dallo **stesso URL**: `crm.kalea.space/admin/login`.

Dopo il login, `AdminLogin` legge `user_roles` e redirige automaticamente via `routeForRole(role)`:
- admin → `/admin`
- ibrido → `/app/ibrido`
- commerciale → `/app/commerciale`
- operaio → `/app/operaio`

Se un utente già autenticato apre `/admin/login`, viene reindirizzato subito alla sua area.

La vecchia route `/cantieri-app` è un **redirect permanente** a `/app/operaio` (sia nuda che con prefisso lingua). Non esistono più entry point separati per gli operai.

`RoleAppLayout` blocca l'accesso se il ruolo non è nella whitelist `allowedRoles` della singola app, e auto-redirige all'area corretta dopo 1.2s.
