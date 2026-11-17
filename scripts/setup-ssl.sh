#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${DOMAIN:-hannahcare.ae}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/hannahcare}"

log() { printf '\n\033[1;32m[Hannah Care SSL]\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31m[Hannah Care SSL]\033[0m %s\n' "$*" >&2; exit 1; }

[[ "${EUID}" -eq 0 ]] || fail "Run this script with sudo."
[[ -f "$NGINX_SITE" ]] || fail "Nginx site not found at $NGINX_SITE. Run the Ubuntu installer first."

if [[ -t 0 ]]; then
  read -r -p "Email for Let's Encrypt renewal notices: " CERTBOT_EMAIL
else
  CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
fi
[[ "$CERTBOT_EMAIL" == *@*.* ]] || fail "Set a valid email address."

log "Checking Nginx and the HTTP endpoint"
nginx -t
systemctl is-active --quiet nginx || fail "Nginx is not running."
curl -fsS --max-time 15 -H "Host: $DOMAIN" http://127.0.0.1/ >/dev/null || \
  fail "The website does not respond through local Nginx on port 80."

log "Installing Certbot"
if ! command -v snap >/dev/null 2>&1; then
  apt-get update
  apt-get install -y snapd
fi
snap install core >/dev/null 2>&1 || snap refresh core
snap install --classic certbot >/dev/null 2>&1 || snap refresh certbot
ln -sfn /snap/bin/certbot /usr/local/bin/certbot

domains=(-d "$DOMAIN")
if getent ahosts "www.$DOMAIN" >/dev/null 2>&1; then
  domains+=(-d "www.$DOMAIN")
else
  log "www.$DOMAIN has no DNS record, so the certificate will cover $DOMAIN only"
fi

log "Issuing the certificate and enabling the HTTP to HTTPS redirect"
certbot --nginx --non-interactive --agree-tos --redirect \
  --email "$CERTBOT_EMAIL" "${domains[@]}"

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q '^Status: active'; then
  ufw allow 'Nginx Full'
fi

nginx -t
systemctl reload nginx

log "Testing automatic renewal"
certbot renew --dry-run

log "SSL is ready"
printf 'Website: https://%s\n' "$DOMAIN"
printf 'Certificates: sudo certbot certificates\n'
printf 'Renewal timer: systemctl list-timers | grep certbot\n'
