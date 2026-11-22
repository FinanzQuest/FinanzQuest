# CI/CD

One workflow: `.github/workflows/ci-cd.yml`.

| Trigger | What runs |
|---|---|
| Pull request | frontend, updater, database checks → image builds (not pushed) |
| Push to `main` | same checks → build & push images to GHCR → deploy over SSH |
| Manual (*Run workflow* on `main`) | same as a push: redeploys current `main` |

## Jobs

- **frontend**: `yarn install --immutable` (Yarn 4 via corepack), Biome
  `ci` (lint + format, version pinned to `biome.json`'s schema), `next build`
  (includes the TypeScript check) with throwaway env values.
- **updater**: `cargo fmt --check`, `clippy -D warnings`, `cargo test`, all
  with `SQLX_OFFLINE=true` against `updater/.sqlx`. After changing a
  `query!`, regenerate it (`cargo sqlx prepare`) or CI fails.
- **database**: `.github/scripts/db-test.sh` starts the real `db`, `auth`
  (GoTrue) and `db-init` services from `compose.core.yml`, so the manifest is
  applied exactly as in production, then runs `dbinit/verify_schema.sql` and
  every `dbinit/tests/*.sql` (except `*_perf.sql`). Runs locally too, next to
  a dev stack: `bash .github/scripts/db-test.sh`.
- **images**: builds `frontend` (target `runner`) and `updater`. On `main`
  they are pushed as `ghcr.io/finanzquest/finanzquest-{frontend,updater}`
  with tags `<commit sha>` and `latest`.
- **deploy** (`main` only, environment `production`, one at a time): copies
  the runtime files (compose files, `Caddyfile`, `manifest.txt`, `dbinit/`)
  to the server, then runs `.github/scripts/deploy.sh` there: pull images,
  `docker compose up -d`, wait until `postgres`, `auth_container` and
  `frontend` are healthy. A failed health check fails the job.

## How production runs the images

`compose.prod.yml` points `frontend` and `updater` at the GHCR images.
`deploy.sh` keeps two lines in the server's `.env` up to date (and touches
nothing else in it):

```
COMPOSE_FILE=compose.yml:compose.prod.yml
IMAGE_TAG=<deployed commit sha>
```

So the NixOS unit's plain `docker compose up -d` also runs the deployed
version after a reboot. Local dev (`compose.dev.yml`) is unaffected.

## Not automated (on purpose)

- **Database migrations.** `db-init` only initialises an empty database.
  Apply new files from `dbinit/migrations/` on the server by hand, *before*
  merging code that needs them.
- **Server secrets.** They live only in the server's `.env`.

## Rollback

Open the *CI/CD* run of the last good `main` commit → *Re-run jobs* → pick
**deploy**. Its images are still in GHCR, so nothing is rebuilt.
Emergency on the server: set `IMAGE_TAG=<good sha>` in `.env`, then
`docker compose up -d`.

## One-time setup

### GitHub secrets (Settings → Secrets and variables → Actions)

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | server hostname or IP |
| `DEPLOY_USER` | `admin` |
| `DEPLOY_SSH_KEY` | private half of the deploy key (public half is in `nixos/nixos/users.nix`) |
| `DEPLOY_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 <host>` output, checked against the server's `/etc/ssh/ssh_host_ed25519_key.pub` |
| `JWT_SECRET` | the **production** JWT secret (same as the server's `.env`); the frontend build signs the public anon key with it |

### GitHub variables

| Variable | Value |
|---|---|
| `API_URL_SERVER` | as in the server's `.env` (inlined into the frontend build) |
| `API_URL_CLIENT` | as in the server's `.env` (inlined into the frontend build) |
| `PRODUCTION_URL` | optional, shown on the deployment |
| `DEPLOY_PATH` | optional, default `/home/admin/FinanzQuest` |
| `DEPLOY_PORT` | optional, default `22` |

### Server

1. `nixos-rebuild switch` with this repo's `nixos/` config, which authorises
   the deploy key for `admin`.
2. `/home/admin/FinanzQuest/.env` exists with the production secrets
   (`POSTGRES_PASSWORD`, `JWT_SECRET`, `AUTH_ADMIN_PASSWORD`,
   `AUTHENTICATOR_PASSWORD`, `SERVICE_WORKER_PASSWORD`, `SITE_URL`,
   `API_URL_SERVER`, `API_URL_CLIENT`, `ALPACA_KEY_ID`, `ALPACA_SECRET_KEY`,
   `CADDY_HOST`, ...).
3. Docker daemon: the server runs both rootful and rootless Docker
   (`nixos/nixos/docker.nix`). `deploy.sh` uses the rootless socket of the
   SSH user when it exists, like an interactive `admin` shell does. The
   systemd unit `finanzquest` runs as root and would use the rootful daemon.
   Run the stack under **one** of them, otherwise both try to bind ports
   80/443.

### GHCR

Images are published by the workflow's own `GITHUB_TOKEN`. The deploy
logs in on the server with that token for the pull, then logs out again, so
the packages can stay private. If you make them public, nothing changes.
