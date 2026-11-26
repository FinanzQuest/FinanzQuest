# CI/CD

GitHub Actions workflow `.github/workflows/ci-cd.yml` + NixOS module
`nix/module.nix` (exported by this repo's flake) on the production server.

| Trigger | What runs |
|---|---|
| Pull request | frontend, updater, database checks → image builds (not pushed) |
| Push to `main` | same checks → push images to GHCR → deploy |
| Manual (*Run workflow* on `main`) | same as a push: redeploys current `main` |

## CI jobs

- **frontend**: `yarn install --immutable` (Yarn 4 via corepack), Biome
  `ci` (lint + format, version pinned to `biome.json`'s schema), `next build`
  (includes the TypeScript check) with throwaway env values.
- **updater**: `cargo fmt --check`, `clippy -D warnings`, `cargo test`, with
  `SQLX_OFFLINE=true` against `updater/.sqlx`. After changing a `query!`,
  regenerate it (`cargo sqlx prepare`) or CI fails.
- **database**: `.github/scripts/db-test.sh` starts the real `db`, `auth`
  (GoTrue) and `db-init` services from `compose.core.yml`, then runs
  `dbinit/verify_schema.sql` and every `dbinit/tests/*.sql` (except
  `*_perf.sql`). Runs locally next to a dev stack too:
  `bash .github/scripts/db-test.sh`.
- **images**: `frontend` (target `runner`) and `updater`. On `main` pushed as
  `ghcr.io/finanzquest/finanzquest-{frontend,updater}:<sha>` and `:latest`.

All actions are pinned to commit SHAs; Dependabot (`.github/dependabot.yml`)
proposes updates weekly.

## Deploy: how it works

The server's flake imports this repo's NixOS module. It only adds
FinanzQuest's own pieces: the system user `finanzquest` and two services,
`finanzquest-docker` and `finanzquest`. It does not enable Docker for the
host, change sysctls, add global packages or open firewall ports (checked
by `nix build .#checks.x86_64-linux.module`, a VM test).

- `finanzquest` has **no sudo** and is **not in the `docker` group**.
  `finanzquest-docker.service` is a rootless Docker daemon for this user
  only (socket `/run/finanzquest/docker.sock`). Only that service gets
  `CAP_NET_BIND_SERVICE`, so Caddy can use 80/443 without changing the
  host-wide unprivileged port limit. A compromised deploy can only affect
  FinanzQuest's containers, not the host or other services.
- The CI deploy key works **only as a forced command**
  (`restrict,command="finanzquest-ctl"`): no shell, no port forwarding, no
  other commands.

The deploy job makes one SSH call, `deploy <sha> <actor>`, with stdin =
GHCR token line + a tar.gz of the runtime files (`compose*.yml`,
`Caddyfile`, `manifest.txt`, `dbinit/`). `finanzquest-ctl` (code from the
module, pinned by the server's flake, never from the upload):

1. validates the command, sha and actor; rejects bundles with unexpected
   files, symlinks or missing files
2. swaps the files into `/var/lib/finanzquest/app` (keeps `app.previous`)
3. writes `.env` = your secrets file + `COMPOSE_FILE`, `IMAGE_TAG`,
   `IMAGE_PREFIX`, `HTTP_PORT`, `HTTPS_PORT`
4. logs in to GHCR with the job's short-lived token, pulls, `up -d`, logs out
5. waits for `postgres`, `auth_container`, `frontend` to be healthy;
   otherwise **rolls back** to the previous release and fails the job

`compose.prod.yml` makes production use the GHCR images and publish only
Caddy's ports (Postgres and the frontend stay internal). Dev
(`compose.dev.yml`) is unaffected. `finanzquest.service` starts the last
deployed version at boot; `nixos-rebuild` never restarts the stack.

Not automated (on purpose):

- **Database migrations.** `db-init` only initialises an empty database.
  Apply new `dbinit/migrations/` files by hand, *before* merging code that
  needs them (back up first). Use `dbinit/migrate.sh` inside the `db-init`
  service: it runs the files in the given order as superuser, stops at the
  first error, and the `\ir` includes of the migrations resolve (piping a
  file into `psql` over stdin does not work for them):
  `sudo -iu finanzquest finanzquest-ctl compose run --rm -T db-init sh /init/dbinit/migrate.sh <file>.sql [<file>.sql ...]`
  The server's `dbinit/` is the one of the last deploy (`app/dbinit/` in the
  service user's state directory), so a migration that ships with a PR is not
  there before that PR is deployed: copy the files into `app/dbinit/migrations/`
  (and `migrate.sh` into `app/dbinit/` the first time) before running it.
- **Module updates.** Changes to `nix/module.nix` or `nix/finanzquest-ctl.sh`
  reach the server with `nix flake update finanzquest && nixos-rebuild switch`.

## Rollback

Automatic when health checks fail. Manually: open the *CI/CD* run of the
last good `main` commit → *Re-run jobs* → **deploy** (images stay in GHCR).

## Operating the stack

`finanzquest-ctl` is only in the service user's profile, hence `sudo -iu`:

```
sudo -iu finanzquest finanzquest-ctl compose ps
sudo -iu finanzquest finanzquest-ctl compose logs -f frontend
sudo -iu finanzquest finanzquest-ctl compose exec db psql -U postgres
systemctl status finanzquest-docker finanzquest
```

## One-time setup

### 1. Server flake

```nix
{
  inputs.finanzquest = {
    url = "github:FinanzQuest/FinanzQuest";
    inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { nixpkgs, finanzquest, ... }: {
    nixosConfigurations.<host> = nixpkgs.lib.nixosSystem {
      modules = [
        ./configuration.nix
        finanzquest.nixosModules.default
        {
          services.finanzquest = {
            enable = true;
            environmentFile = "/var/lib/finanzquest-secrets/env";
            deployKeys = [ "ssh-ed25519 AAAA... finanzquest-ci-deploy" ];
            # httpPort = 80; httpsPort = 443;  (defaults)
            # openFirewall = true;  # or open the ports in your own config
          };
        }
      ];
    };
  };
}
```

Options: `nix/module.nix`. The firewall is left to you (`openFirewall`
defaults to false, as in nixpkgs modules). If another service on the host
already uses 80/443, pick other ports and put that host's reverse proxy in
front. Remove any old `systemd.services.finanzquest` definition (e.g. from
this repo's `nixos/configuration.nix`): same unit name.

### 2. Secrets file (on the server, never in Git or the Nix store)

```
sudo install -d -m 750 -o root -g finanzquest /var/lib/finanzquest-secrets
sudo install -m 640 -o root -g finanzquest /dev/null /var/lib/finanzquest-secrets/env
sudoedit /var/lib/finanzquest-secrets/env
```

Contents, `.env` syntax: `POSTGRES_PASSWORD`, `JWT_SECRET`,
`AUTH_ADMIN_PASSWORD`, `AUTHENTICATOR_PASSWORD`, `SERVICE_WORKER_PASSWORD`,
`SITE_URL`, `API_URL_SERVER`, `API_URL_CLIENT`, `ALPACA_KEY_ID`,
`ALPACA_SECRET_KEY`, `CADDY_HOST`, `FRONTEND_URL`. agenix/sops-nix work too
(owner `finanzquest`, mode 0400).

### 3. GitHub

Secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | server hostname or IP |
| `DEPLOY_SSH_KEY` | private half of the deploy key (public half goes into `deployKeys`) |
| `DEPLOY_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 <host>`, checked against the server's `/etc/ssh/ssh_host_ed25519_key.pub` |
| `JWT_SECRET` | the **production** JWT secret; the frontend build signs the public anon key with it |

Variables: `API_URL_SERVER`, `API_URL_CLIENT` (inlined into the frontend
build, same as in the secrets file); optional `PRODUCTION_URL`,
`DEPLOY_USER` (default `finanzquest`), `DEPLOY_PORT` (default `22`).

Environment `production` (Settings → Environments): *Deployment branches →
Selected branches → `main`*, so only `main` can use the deploy secrets.

### 4. Moving an existing stack (data migration)

Run once, after the first `nixos-rebuild switch` and **before** the first CI
deploy. Old stack = the one currently serving (here: `admin`'s Docker).

```
# as admin: stop the old stack, export its volumes (Postgres, Caddy certs)
cd ~/FinanzQuest && docker compose down
umask 077
docker run --rm -v finanzquest_postgres:/v alpine tar -C /v -cpf - . > ~/pg.tar
docker run --rm -v finanzquest_caddy_data:/v alpine tar -C /v -cpf - . > ~/caddy.tar

# import into finanzquest's daemon (stdin is redirected as admin, so the
# service user never needs to read admin's files)
fq() { sudo -iu finanzquest finanzquest-ctl docker "$@"; }
fq volume create finanzquest_postgres
fq volume create finanzquest_caddy_data
fq run --rm -i -v finanzquest_postgres:/v alpine tar -C /v -xpf - < ~/pg.tar
fq run --rm -i -v finanzquest_caddy_data:/v alpine tar -C /v -xpf - < ~/caddy.tar
rm ~/pg.tar ~/caddy.tar
```

Then disable the old way of starting it (e.g. the `finanzquest` unit in the
old `nixos/configuration.nix`, which the module replaces) and trigger the
first deploy (*Run workflow* on `main`). Volume names come from the compose
project name `FinanzQuest` → `finanzquest_*`; check with `docker volume ls`
(old) and `fq volume ls` (new).
