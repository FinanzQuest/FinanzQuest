# E-Mail verification (Brevo SMTP)

GoTrue sends the confirmation mails (sign-up and guest upgrade). The mail
bodies are static files in `frontend/public/email/`, fetched by GoTrue from
`http://frontend:3000/email/*.html`; links point to the app's `/confirm` route
(`token_hash` + `type`). There is no password reset yet, so no recovery template.

## Environment (server secrets file / `.env`)

| Variable | Value |
|---|---|
| `SITE_URL` | public URL, e.g. `https://finanzquest.example` (also used for `API_EXTERNAL_URL=${SITE_URL}/auth/v1`) |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` (STARTTLS) |
| `SMTP_USER` | Brevo SMTP login (shown under SMTP & API) |
| `SMTP_PASS` | Brevo SMTP key (not the account password) |
| `SMTP_ADMIN_EMAIL` | sender address on the verified domain, e.g. `noreply@finanzquest.example` |
| `EMAILS_PER_HOUR` | optional, default 300 (`GOTRUE_RATE_LIMIT_EMAIL_SENT`; GoTrue's own default is far lower) |
| `MAILER_AUTOCONFIRM` | default `false`; **dev only: `true`** (no SMTP needed, sign-ups are confirmed at once) |

Local dev: put `MAILER_AUTOCONFIRM=true` in `.env.local`.

## Brevo and DNS (Namecheap)

1. Brevo: Senders, Domains & Dedicated IPs → Domains → add the sender domain.
2. Namecheap: Domain List → Manage → Advanced DNS; add the records Brevo shows:
   - Brevo code: `TXT @` with `brevo-code:...`
   - DKIM: the `brevo1._domainkey` / `brevo2._domainkey` CNAMEs Brevo lists
   - SPF: one `TXT @` record `v=spf1 include:spf.brevo.com ~all`
     (merge into an existing SPF record, only one is allowed)
   - DMARC: `TXT _dmarc` = `v=DMARC1; p=none; rua=mailto:<your address>`
     (tighten to `quarantine` once mails pass)
3. Brevo: Authenticate the domain (can take up to 48 h).
4. Brevo: SMTP & API → SMTP → generate a key; login is `SMTP_USER`, the key is `SMTP_PASS`.

Brevo's free plan has a daily send limit; sign-ups beyond it get no mail.

## Existing databases

Apply `dbinit/migrations/2026-12-12_email_verification.sql` (guests with a pending
upgrade are not cleaned up). Users that signed up while auto-confirm was on stay confirmed.
