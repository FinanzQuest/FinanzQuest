#!/usr/bin/env bash
# Runs ON THE SERVER, from the deploy directory, after CI has unpacked the
# deploy bundle there (compose files, Caddyfile, manifest.txt, dbinit/).
#
#   IMAGE_TAG=<sha> GHCR_USER=<user> bash .github/scripts/deploy.sh < token
#
# stdin: a token that can read the GHCR images (CI passes its GITHUB_TOKEN);
# empty stdin skips `docker login` (public images).
#
# Never touches secrets in .env except the two deploy keys it owns:
# COMPOSE_FILE and IMAGE_TAG. Database migrations are NOT applied here
# (apply dbinit/migrations/ by hand); db-init only initialises a fresh DB.
set -euo pipefail

: "${IMAGE_TAG:?IMAGE_TAG must be set}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-300}"

# Rootless Docker (nixos/nixos/docker.nix): non-interactive SSH sessions do
# not get DOCKER_HOST from the login profile.
uid=$(id -u)
if [ -z "${DOCKER_HOST:-}" ] && [ -S "/run/user/${uid}/docker.sock" ]; then
  export DOCKER_HOST="unix:///run/user/${uid}/docker.sock"
fi

if [ ! -f .env ]; then
  echo "No .env in $(pwd): create it on the server first (see docs/ci-cd.md)." >&2
  exit 1
fi

set_env() {
  local key=$1 val=$2
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    printf '%s=%s\n' "$key" "$val" >> .env
  fi
}
previous_tag=$(grep -E '^IMAGE_TAG=' .env | cut -d= -f2- || true)
set_env COMPOSE_FILE compose.yml:compose.prod.yml
set_env IMAGE_TAG "$IMAGE_TAG"
echo "==> Deploying ${IMAGE_TAG} (previous: ${previous_tag:-none})"

token=$(cat || true)
if [ -n "$token" ]; then
  printf '%s' "$token" | docker login ghcr.io -u "${GHCR_USER:?GHCR_USER must be set}" --password-stdin >/dev/null
  trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT
fi

echo "==> Pulling images"
docker compose pull --quiet frontend updater gateway auth rest db db-init

echo "==> Starting stack"
docker compose up -d --no-build --remove-orphans

echo "==> Waiting for containers to become healthy (timeout ${HEALTH_TIMEOUT}s)"
deadline=$(( $(date +%s) + HEALTH_TIMEOUT ))
for c in postgres auth_container frontend; do
  while :; do
    status=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$c" 2>/dev/null || echo missing)
    [ "$status" = healthy ] && { echo "    $c: healthy"; break; }
    if [ "$(date +%s)" -ge "$deadline" ] || [ "$status" = unhealthy ]; then
      echo "    $c: $status" >&2
      docker compose ps >&2
      docker logs --tail 100 "$c" >&2 || true
      echo "Deploy of ${IMAGE_TAG} is unhealthy. Roll back by re-running the deploy job of ${previous_tag:-the last good commit}." >&2
      exit 1
    fi
    sleep 5
  done
done

docker compose ps
docker image prune -f --filter "until=168h" >/dev/null || true
echo "==> Deployed ${IMAGE_TAG}"
