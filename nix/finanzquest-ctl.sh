# finanzquest-ctl: runs the FinanzQuest stack as the service user, on that
# user's rootless Docker. Packaged by nix/module.nix, which prepends:
#   STATE_DIR RUNTIME_DIR ENV_FILE IMAGE_PREFIX HTTP_PORT HTTPS_PORT HEALTH_TIMEOUT
#
# Modes:
#   (no args, via SSH)  forced command of the CI deploy key. Only accepts
#                       SSH_ORIGINAL_COMMAND="deploy <commit sha> <github actor>"
#                       stdin: one line GHCR token (may be empty), then a
#                       tar.gz bundle of the runtime files (data only: nothing
#                       from it is executed here).
#   boot                systemd: start the last deployed version
#   compose ARGS...     admin pass-through to the stack, e.g.
#                       sudo -iu finanzquest finanzquest-ctl compose ps
#   docker ARGS...      admin pass-through to the user's Docker daemon

APP="$STATE_DIR/app"
TAG_FILE="$STATE_DIR/image-tag"
BUNDLE_FILES=(compose.yml compose.core.yml compose.prod.yml Caddyfile manifest.txt)
HEALTHY_CONTAINERS=(postgres auth_container frontend)

# the user's own rootless daemon (finanzquest-docker.service)
export DOCKER_HOST="unix://${RUNTIME_DIR}/docker.sock"
export DOCKER_CONFIG="$STATE_DIR/.docker"
cd "$STATE_DIR"

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

compose() { (cd "$APP" && docker-compose "$@"); }

wait_for_docker() {
  for _ in $(seq 90); do
    docker info >/dev/null 2>&1 && return 0
    sleep 2
  done
  die "rootless Docker is not reachable at $DOCKER_HOST"
}

# .env = the admin's secrets file + the keys this tool owns. Owned keys are
# dropped from the admin file so every key appears exactly once.
write_env() {
  local tag=$1 tmp
  tmp=$(mktemp "$APP/.env.XXXXXX")
  chmod 600 "$tmp"
  {
    grep -vE '^[[:space:]]*(export[[:space:]]+)?(COMPOSE_FILE|IMAGE_PREFIX|IMAGE_TAG|HTTP_PORT|HTTPS_PORT)=' "$ENV_FILE" || true
    printf '\n# managed by finanzquest-ctl\n'
    printf 'COMPOSE_FILE=compose.yml:compose.prod.yml\n'
    printf 'IMAGE_PREFIX=%s\n' "$IMAGE_PREFIX"
    printf 'IMAGE_TAG=%s\n' "$tag"
    printf 'HTTP_PORT=%s\n' "$HTTP_PORT"
    printf 'HTTPS_PORT=%s\n' "$HTTPS_PORT"
  } > "$tmp"
  mv "$tmp" "$APP/.env"
}

wait_healthy() {
  local deadline status c
  deadline=$(( $(date +%s) + HEALTH_TIMEOUT ))
  for c in "${HEALTHY_CONTAINERS[@]}"; do
    while :; do
      status=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$c" 2>/dev/null || echo missing)
      if [ "$status" = healthy ]; then
        echo "    $c: healthy"
        break
      fi
      if [ "$status" = unhealthy ] || [ "$(date +%s)" -ge "$deadline" ]; then
        echo "    $c: $status" >&2
        docker logs --tail 80 "$c" >&2 || true
        return 1
      fi
      sleep 5
    done
  done
}

start() {
  write_env "$1"
  compose up -d --no-build --remove-orphans
}

cmd_boot() {
  if [ ! -f "$TAG_FILE" ] || [ ! -d "$APP" ]; then
    log "nothing deployed yet; waiting for the first CI deploy"
    return 0
  fi
  wait_for_docker
  start "$(cat "$TAG_FILE")"
}

cmd_deploy() {
  local cmd sha actor extra token staging entry name previous
  read -r cmd sha actor extra <<< "${SSH_ORIGINAL_COMMAND:-}" || true
  [ "${cmd:-}" = deploy ] && [ -z "${extra:-}" ] \
    && [[ "${sha:-}" =~ ^[0-9a-f]{40}$ ]] \
    && [[ "${actor:-}" =~ ^[A-Za-z0-9][A-Za-z0-9-]{0,38}(\[bot\])?$ ]] \
    || die "this key may only run: deploy <40-char commit sha> <github actor>"

  IFS= read -r token || token=""

  staging=$(mktemp -d "$STATE_DIR/incoming.XXXXXX")
  # shellcheck disable=SC2064 # expand $staging now
  trap "rm -rf '$staging'; docker logout ghcr.io >/dev/null 2>&1 || true" EXIT

  log "receiving bundle for $sha (by $actor)"
  tar -xz -C "$staging" --no-same-owner --no-same-permissions

  for entry in "$staging"/* "$staging"/.[!.]*; do
    [ -e "$entry" ] || continue
    name=$(basename "$entry")
    case " ${BUNDLE_FILES[*]} dbinit " in
      *" $name "*) ;;
      *) die "unexpected file in bundle: $name" ;;
    esac
  done
  for name in "${BUNDLE_FILES[@]}"; do
    [ -f "$staging/$name" ] || die "bundle is missing $name"
  done
  [ -d "$staging/dbinit" ] || die "bundle is missing dbinit/"
  if [ -n "$(find "$staging" ! -type f ! -type d -print -quit)" ]; then
    die "bundle may only contain regular files and directories"
  fi

  wait_for_docker
  previous=$(cat "$TAG_FILE" 2>/dev/null || true)

  rm -rf "$STATE_DIR/app.previous"
  if [ -d "$APP" ]; then mv "$APP" "$STATE_DIR/app.previous"; fi
  mv "$staging" "$APP"

  if [ -n "$token" ]; then
    printf '%s' "$token" | docker login ghcr.io -u "$actor" --password-stdin >/dev/null
  fi

  log "deploying $sha (previous: ${previous:-none})"
  write_env "$sha"
  compose pull --quiet
  compose up -d --no-build --remove-orphans

  log "waiting for health checks (timeout ${HEALTH_TIMEOUT}s)"
  if ! wait_healthy; then
    if [ -n "$previous" ] && [ -d "$STATE_DIR/app.previous" ]; then
      log "unhealthy: rolling back to $previous"
      rm -rf "$APP.failed"
      mv "$APP" "$APP.failed"
      mv "$STATE_DIR/app.previous" "$APP"
      start "$previous" || true
    fi
    die "deploy of $sha failed its health checks"
  fi

  echo "$sha" > "$TAG_FILE"
  compose ps
  docker image prune -af --filter "until=168h" >/dev/null 2>&1 || true
  log "deployed $sha"
}

case "${1:-}" in
  boot) cmd_boot ;;
  compose) shift; [ -d "$APP" ] || die "nothing deployed yet"; compose "$@" ;;
  docker) shift; docker "$@" ;;
  "")
    [ -n "${SSH_ORIGINAL_COMMAND:-}" ] || die "usage: finanzquest-ctl boot | compose ARGS... | docker ARGS... (deploys arrive via SSH)"
    cmd_deploy
    ;;
  *) die "usage: finanzquest-ctl boot | compose ARGS... | docker ARGS..." ;;
esac
