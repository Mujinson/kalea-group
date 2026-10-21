# Email campaigns ("Campagne") for the CRM

Only new things are added: new tables, new functions and one new page. The only edits to existing code are a new menu entry, a new route and an optional "Ha risposto" badge in the lead detail. No existing table changes structure, except for three new optional columns on `leads` that have defaults.

## 1. Data model

### `email_campaigns`
| column | type | default |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text NOT NULL | |
| sender_email | text NOT NULL | 'andrea.facchinetti@kalea.space' |
| sender_name | text NOT NULL | 'Andrea Facchinetti – Kalēa' |
| reply_to | text NOT NULL | 'andrea.facchinetti@kalea.space' |
| status | text NOT NULL (draft / active / paused) | 'paused' |
| daily_limit | int NOT NULL | 50 |
| send_time | time NOT NULL | '09:00' |
| timezone | text NOT NULL | 'Europe/Rome' |
| weekdays_only | bool NOT NULL | true |
| skip_it_holidays | bool NOT NULL | true |
| follow_up_after_days | int NOT NULL (working days) | 10 |
| presentation_url | text NOT NULL | 'https://kalea.space/presentazione-kalea.pdf' |
| last_run_date | date | null (stops a campaign from sending twice on the same day) |
| started_at, created_by, created_at, updated_at | | |

### `email_campaign_recipients` (you fill this table with SQL)
| column | type | notes |
|---|---|---|
| id | uuid PK | default |
| campaign_id | uuid NOT NULL → email_campaigns ON DELETE CASCADE | |
| lead_id | uuid → leads(id) ON DELETE SET NULL | |
| email | text NOT NULL | stored in lowercase by a trigger |
| greeting_name | text | null or empty gives "Buongiorno," |
| template_version | text NOT NULL | 'architetti' / 'imprese' / 'privati' |
| planned_send_date | date | optional. Null means "next free slot". A future date waits until that day |
| status | text NOT NULL | 'queued' (default) / 'sent' / 'follow_up_sent' / 'replied' / 'unsubscribed' / 'bounced' / 'skipped' |
| sent_at | timestamptz | |
| follow_up_due_date | date | calculated at send time as sent_at + 10 working days |
| follow_up_at | timestamptz | when the follow-up was actually sent |
| resend_message_id | text | first email |
| follow_up_message_id | text | |
| replied_at | timestamptz | |
| unsubscribe_token | uuid NOT NULL UNIQUE | default gen_random_uuid() |
| error | text | |
| created_at, updated_at | | |

Constraints: UNIQUE (campaign_id, email), plus an index on (campaign_id, status, planned_send_date).

Example insert you can use:
```sql
INSERT INTO email_campaign_recipients (campaign_id, lead_id, email, greeting_name, template_version)
SELECT '<campaign uuid>', id, email, first_name, 'architetti' FROM leads WHERE ...;
```

### `email_templates`
id, key (UNIQUE: architetti / imprese / privati / richiamo), subject, html_body, updated_at, updated_by. All 4 are seeded with short Italian placeholder texts. Placeholders: `{{saluto}}`, `{{presentazione_url}}`, `{{unsubscribe_url}}` and `{{mittente}}`. A fixed footer with the unsubscribe link and company details is always added, even if a template is edited by mistake.

### `email_suppressions`
email (PK, lowercase), reason (unsubscribed / bounced / complained), lead_id, created_at. This list is global. It is checked before every send, so no campaign ever emails these addresses again, even if a lead is imported twice.

### `email_events`
id, recipient_id, type, resend_message_id, payload jsonb, created_at. This is the log of webhook events received from Resend.

### Additions to `leads` (optional, with defaults, nothing existing breaks)
- `do_not_contact bool DEFAULT false`
- `email_invalid bool DEFAULT false`
- `email_opt_out_at timestamptz`

Before writing this migration I will check whether `leads` already has similar columns among its 59 and reuse them if so.

### Use of `lead_activities`
Every send, follow-up, reply, unsubscribe and bounce adds a row, for example "Email campagna inviata: <campaign name> (architetti)". The exact column names will be checked before writing.

### Why not `lead_automations`
It is not really idle: the existing `lead-automation` function writes "follow_up_email" rows into it and handles them. Sharing it would mix the two systems, so campaigns get their own tables.

## 2. Sending (new function `campaign-sender`)
- It runs on a schedule on weekdays at 07:00 and 08:00 UTC, which is 2 runs per day. Because of daylight saving time, 09:00 in Rome is 07:00 UTC in summer and 08:00 UTC in winter. Each run converts the time to Rome time and only works if send_time has passed, today is a working day (Mon–Fri, not an Italian public holiday, Easter Monday included) and `last_run_date` is not today. Cost is negligible.
- For each active campaign:
  1. Due follow-ups first: status 'sent', `follow_up_due_date` ≤ today, not suppressed. They use the "richiamo" template, in the same email thread (In-Reply-To set to the first email's message ID).
  2. Then queued recipients by created_at, with `planned_send_date` null or ≤ today, until 50 emails in total are sent that day.
  3. Every address is checked against the suppression list and against `do_not_contact` / `email_invalid` on the lead. Blocked addresses become 'skipped'.
- Emails go out one at a time with a short pause, through Resend, with: from "Andrea Facchinetti – Kalēa <andrea.facchinetti@kalea.space>", reply_to set to the same address, a plain-text version, and the `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers.
- Each recipient is updated as it is sent and logged in lead_activities. Errors are saved in `error` and the recipient stays queued; after 3 errors it becomes skipped.
- The daily total is 50 emails including follow-ups, so the domain's reputation is protected.

## 3. Unsubscribe
- A public page `/disiscrizione?t=<token>` with no login, plus a one-click POST that the function `campaign-unsubscribe` answers.
- It marks the recipient as 'unsubscribed', adds the address to suppressions and sets do_not_contact on the lead.

## 4. Resend webhook (function `resend-webhook`)
- It checks the Svix signature of each call.
- On `email.bounced` (hard bounce) and `email.complained`, the recipient becomes 'bounced', the address goes into suppressions and the lead gets email_invalid = true (do_not_contact = true for complaints).
- Every event is logged in email_events.

## 5. "Campagne" page in the CRM (`/admin/campagne`, admins only)
- **List**: each campaign with its status badge and counters: queued, sent today, sent total, follow-ups, replied, unsubscribed, bounced. Buttons: Avvia / Pausa / Modifica.
- **Settings**: name, daily limit, send time, presentation link, follow-up days.
- **Templates**: editor for subject and HTML of the 4 templates, with a live preview using a sample greeting.
- **"Invia prova"**: you type an address and it receives all 4 templates with a "[PROVA]" subject. No counter or real recipient changes.
- **Recipients**: a table with filters (status, template, search), the "Ha risposto" button (stops the follow-up and logs an activity) and "Escludi".
- **Lead detail**: a small badge "Ha risposto alla campagna X" or "Disiscritto".
- **Access**: only the existing `admin` role can use these tables (RLS with has_role) and these functions (the JWT is checked and the admin role verified). Sales staff and workers cannot see anything.

## 6. What you need to provide
1. **RESEND_API_KEY**: I will ask for it through the secure form.
2. **Resend domain**: verify `kalea.space` in Resend and add on Hostinger the DNS records Resend shows you: SPF (TXT on `send` or the root), DKIM (TXT `resend._domainkey`) and the MX for the bounce subdomain. Add a DMARC record too (TXT `_dmarc`, e.g. `v=DMARC1; p=none; rua=mailto:info@kalea.space`) if you do not have one. Careful: do not touch the existing MX records of the Hostinger mailboxes.
3. **RESEND_WEBHOOK_SECRET**: after I publish the webhook address, you create the webhook in Resend (events: bounced, complained, delivered) and paste the signing secret into the secure form.
4. The final texts of the 4 templates, and the PDF online at the agreed address.

## 7. Risks for the existing app
- **The existing `leads` table**: only optional columns with defaults are added. Existing pages do not read them, so nothing changes.
- **Other emails already sent with Resend** (landing page, online quote): they share the same key and domain. If campaigns cause many complaints, those emails could also land in spam. Mitigations: 50 per day, unsubscribe, bounce handling. Optional: use the `mail.kalea.space` subdomain just for campaigns.
- **The existing `lead-automation` function**: not touched.
- **Consent (GDPR)**: these leads were not collected with consent to marketing emails. The footer will show the company details, why they are being contacted and the unsubscribe link. The legal responsibility stays with you.
- **Replies are not detected automatically**: they arrive in the Hostinger mailbox, so "Ha risposto" has to be pressed by hand. Later the existing mailbox reader could find them.
- **New scheduled job**: 2 runs per weekday, low cost.

## Technical details
- One migration: the tables, GRANTs to authenticated and service_role, RLS with `has_role(auth.uid(),'admin')`, a trigger for lowercase emails and updated_at, and the template seed. Admin pages read and write directly. The automated functions use the service role.
- Functions: `campaign-sender` (scheduled, plus a manual "test" mode for Invia prova, admin JWT), `campaign-unsubscribe` (public), `resend-webhook` (public with a signature check). All are set to `verify_jwt = false` in the config.
- Italian holidays: a fixed list plus Easter Monday calculated in the code.
- The schedule (pg_cron + pg_net) is created with direct SQL, not with a migration.
- Edits to existing files: only the new menu entry in `AdminSidebar`, the new routes in `App.tsx` and the badge in `LeadDetailSheet`.
- Tests: small tests for the working-day calculation (holidays, +10 working days) and for the 50-per-day limit.
