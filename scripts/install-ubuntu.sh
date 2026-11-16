#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="hannahcare"
APP_USER="hannahcare"
APP_ROOT="${APP_ROOT:-/srv/hannahcare}"
APP_DIR="${APP_DIR:-$APP_ROOT/app}"
DATA_DIR="${DATA_DIR:-$APP_ROOT/data}"
ENV_FILE="${ENV_FILE:-/etc/hannahcare.env}"
APP_PORT="${APP_PORT:-3101}"
PUBLIC_PORT="${PUBLIC_PORT:-8080}"
DOMAIN="${DOMAIN:-hannahcare.ae}"
SERVICE_FILE="/etc/systemd/system/$APP_NAME.service"
NGINX_SITE="/etc/nginx/sites-available/$APP_NAME"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
DEPLOY_USER="${SUDO_USER:-$(id -un)}"

log() { printf '\n\033[1;32m[Hannah Care]\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31m[Hannah Care]\033[0m %s\n' "$*" >&2; exit 1; }

[[ "${EUID}" -eq 0 ]] || fail "Run this installer with sudo."
[[ -f "$SOURCE_DIR/package.json" ]] || fail "Run the installer from the cloned Hannah Care repository."

if [[ -r /etc/os-release ]]; then
  # shellcheck disable=SC1091
  source /etc/os-release
  [[ "${ID:-}" == "ubuntu" ]] || fail "This installer supports Ubuntu only."
else
  fail "Unable to identify the operating system."
fi

log "Installing operating-system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git nginx build-essential python3 openssl rsync

node_major=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || printf '0')"
fi
if (( node_major < 20 )); then
  log "Installing Node.js 22 LTS"
  curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
  bash /tmp/nodesource_setup.sh
  rm -f /tmp/nodesource_setup.sh
  apt-get install -y nodejs
fi

command -v npm >/dev/null 2>&1 || fail "npm is unavailable after Node.js installation."

if ! id "$APP_USER" >/dev/null 2>&1; then
  log "Creating the restricted application user"
  useradd --system --home-dir "$APP_ROOT" --shell /usr/sbin/nologin "$APP_USER"
fi

mkdir -p "$APP_ROOT" "$DATA_DIR"

if [[ "$SOURCE_DIR" != "$APP_DIR" ]]; then
  log "Copying the application to $APP_DIR"
  mkdir -p "$APP_DIR"
  rsync -a --delete \
    --exclude '.git/' \
    --exclude '.next/' \
    --exclude 'node_modules/' \
    --exclude 'data/' \
    --exclude 'hannahcare-images/' \
    "$SOURCE_DIR/" "$APP_DIR/"
fi

chown -R "$DEPLOY_USER:$APP_USER" "$APP_DIR"
chmod -R g+rX "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$DATA_DIR"
chmod 750 "$DATA_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  log "Creating production secrets"
  if [[ -t 0 ]]; then
    read -r -s -p "Set the /leads dashboard password: " LEADS_PASSWORD
    printf '\n'
    [[ ${#LEADS_PASSWORD} -ge 12 ]] || fail "The leads password must be at least 12 characters."
    [[ "$LEADS_PASSWORD" != *"'"* ]] || fail "The leads password cannot contain a single quote."
  else
    LEADS_PASSWORD="$(openssl rand -base64 24 | tr -d '\n')"
    printf 'Generated a random leads password because no interactive terminal was available.\n' >&2
    printf 'Change LEADS_PASSWORD in %s before using the dashboard.\n' "$ENV_FILE" >&2
  fi
  SESSION_SECRET="$(openssl rand -hex 32)"
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=$APP_PORT
LEADS_PASSWORD='$LEADS_PASSWORD'
SESSION_SECRET=$SESSION_SECRET
LEADS_DB_PATH=$DATA_DIR/leads.db
LEADS_NOTIFY_EMAIL=
LEADS_WEBHOOK_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
RESEND_API_KEY=
DATABASE_URL=
EOF
  chmod 600 "$ENV_FILE"
else
  log "Preserving the existing environment file at $ENV_FILE"
fi

log "Installing Node.js dependencies and building the production application"
runuser -u "$DEPLOY_USER" -- bash -lc "cd '$APP_DIR' && npm ci && npm run build"
mkdir -p "$APP_DIR/.next/cache"
chown -R "$APP_USER:$APP_USER" "$APP_DIR/.next/cache"
chmod -R u+rwX "$APP_DIR/.next/cache"

log "Installing the systemd service"
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Hannah Care Next.js website
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port $APP_PORT
Restart=always
RestartSec=5
TimeoutStopSec=30
KillSignal=SIGTERM
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DATA_DIR $APP_DIR/.next

[Install]
WantedBy=multi-user.target
EOF

log "Configuring Nginx"
cat > "$NGINX_SITE" <<EOF
server {
    listen $PUBLIC_PORT default_server;
    listen [::]:$PUBLIC_PORT default_server;
    listen 80;
    listen [::]:80;

    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 2m;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Forwarded-Host \$http_host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sfn "$NGINX_SITE" "/etc/nginx/sites-enabled/$APP_NAME"
nginx -t

systemctl daemon-reload
systemctl enable --now "$APP_NAME"
systemctl reload nginx

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q '^Status: active'; then
  log "Opening the website ports in UFW"
  ufw allow "$PUBLIC_PORT/tcp"
  ufw allow 'Nginx HTTP'
fi

sleep 2
curl -fsS "http://127.0.0.1:$APP_PORT/" >/dev/null || fail "The application service did not pass its local health check."

server_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
log "Installation completed successfully"
printf 'Temporary URL: http://%s:%s\n' "${server_ip:-SERVER_IP}" "$PUBLIC_PORT"
printf 'Future domain: http://%s (after DNS/CDN is connected)\n' "$DOMAIN"
printf 'Service status: sudo systemctl status %s\n' "$APP_NAME"
printf 'Live logs: sudo journalctl -u %s -f\n' "$APP_NAME"
printf 'Environment: %s\n' "$ENV_FILE"
