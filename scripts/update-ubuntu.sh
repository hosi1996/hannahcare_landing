#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="hannahcare"
APP_USER="hannahcare"
APP_ROOT="${APP_ROOT:-/srv/hannahcare}"
APP_DIR="${APP_DIR:-$APP_ROOT/app}"
DATA_DIR="${DATA_DIR:-$APP_ROOT/data}"
DEPLOY_USER="${DEPLOY_USER:-${SUDO_USER:-}}"

log() { printf '\n\033[1;32m[Hannah Care]\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31m[Hannah Care]\033[0m %s\n' "$*" >&2; exit 1; }

[[ "${EUID}" -eq 0 ]] || fail "Run this updater with sudo."
[[ -d "$APP_DIR/.git" ]] || fail "$APP_DIR is not a Git checkout. Clone the repository directly to $APP_DIR before using this updater."

if [[ -z "$DEPLOY_USER" ]]; then
  DEPLOY_USER="$(stat -c '%U' "$APP_DIR")"
fi

log "Downloading the latest main branch"
runuser -u "$DEPLOY_USER" -- git -C "$APP_DIR" fetch origin main
runuser -u "$DEPLOY_USER" -- git -C "$APP_DIR" checkout main
runuser -u "$DEPLOY_USER" -- git -C "$APP_DIR" pull --ff-only origin main

log "Installing exact dependencies"
runuser -u "$DEPLOY_USER" -- bash -lc "cd '$APP_DIR' && npm ci"

log "Building the new production version"
runuser -u "$DEPLOY_USER" -- bash -lc "cd '$APP_DIR' && npm run build"

chown -R "$DEPLOY_USER:$APP_USER" "$APP_DIR"
chmod -R g+rX "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$DATA_DIR"

log "Restarting the application"
systemctl restart "$APP_NAME"
sleep 2
systemctl is-active --quiet "$APP_NAME" || fail "The service failed to restart. Check: journalctl -u $APP_NAME -n 100"

printf '\nUpdate completed. Current commit: '
git -C "$APP_DIR" rev-parse --short HEAD
