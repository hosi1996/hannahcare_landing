# Ubuntu deployment

This deployment keeps Hannah Care isolated from other applications that may be added to the server later.

## Layout

| Purpose | Location |
| --- | --- |
| Application source | `/srv/hannahcare/app` |
| Persistent SQLite data | `/srv/hannahcare/data` |
| Production secrets | `/etc/hannahcare.env` |
| systemd service | `hannahcare.service` |
| Internal Next.js port | `127.0.0.1:3101` |
| Temporary public URL | `http://SERVER_IP:8080` |
| Future domain | `http://hannahcare.ae` |

The installer does not configure TLS. The domain can be connected to the server or CDN later without reinstalling the application.

## 1. Connect to the server

```bash
ssh YOUR_USER@SERVER_IP
```

Use an Ubuntu account with `sudo` access.

## 2. Clone the private repository

The repository is private, so the server needs GitHub access. The recommended option is an SSH deploy key.

Generate a key on the server:

```bash
ssh-keygen -t ed25519 -C "hannahcare-server" -f ~/.ssh/hannahcare_github
cat ~/.ssh/hannahcare_github.pub
```

In GitHub, open the repository, then **Settings → Deploy keys → Add deploy key**. Paste the public key and leave write access disabled.

Create an SSH host entry:

```bash
cat >> ~/.ssh/config <<'EOF'
Host github-hannahcare
  HostName github.com
  User git
  IdentityFile ~/.ssh/hannahcare_github
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
```

Clone directly into the final isolated path:

```bash
sudo mkdir -p /srv/hannahcare
sudo chown "$USER":"$USER" /srv/hannahcare
git clone git@github-hannahcare:hosi1996/hannahcare_landing.git /srv/hannahcare/app
```

## 3. Run the installer

```bash
cd /srv/hannahcare/app
sudo bash scripts/install-ubuntu.sh
```

The installer asks for a password for the protected `/leads` dashboard. Use at least 12 characters. It then installs Node.js 22, Nginx and build requirements, builds the site, creates the restricted service user, starts the website and runs a local health check.

Open the temporary address:

```text
http://SERVER_IP:8080
```

If the server provider has a separate network firewall, allow inbound TCP port `8080`. The installer automatically updates UFW only when UFW is already active.

## Useful commands

```bash
sudo systemctl status hannahcare
sudo journalctl -u hannahcare -f
sudo systemctl restart hannahcare
sudo nginx -t
```

Production secrets are stored outside the repository:

```bash
sudo nano /etc/hannahcare.env
sudo systemctl restart hannahcare
```

The leads database remains at `/srv/hannahcare/data/leads.db` during updates.

## Deploy an update

After new code is pushed to GitHub:

```bash
cd /srv/hannahcare/app
sudo bash scripts/update-ubuntu.sh
```

The updater performs a fast-forward pull, installs exact locked dependencies, creates a production build, and restarts only the `hannahcare` service. It does not modify the database or environment file.

## Connect `hannahcare.ae` later

1. Point the CDN/DNS records for `hannahcare.ae` and `www.hannahcare.ae` to the server public IP.
2. Ensure inbound TCP port `80` is allowed by the server provider firewall.
3. Keep the CDN origin protocol set to HTTP while the origin has no TLS certificate.
4. Test `http://hannahcare.ae`.
5. When origin TLS is required later, install the certificate and change the CDN origin mode at that time.

Nginx is already configured for both domain names on port 80. No application reinstall is required.

## Custom ports or installation path

Defaults are intentionally isolated, but they can be overridden during the first installation:

```bash
sudo APP_ROOT=/srv/hannahcare APP_PORT=3101 PUBLIC_PORT=8080 DOMAIN=hannahcare.ae bash scripts/install-ubuntu.sh
```

Do not reuse these ports or paths for other applications.
