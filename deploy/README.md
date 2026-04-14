# HomeAI Deployment Guide (aaPanel / Linux)

## Quick Deploy via aaPanel

### Step 1: Install prerequisites via aaPanel

1. Log into aaPanel
2. Go to **Software Store** (软件商店)
3. Install:
   - **PM2 Manager** (ships Node.js + PM2)
   - **Nginx** (if not already installed)

Verify Node.js:
```bash
node -v   # need >= 18
```

### Step 2: Open firewall ports

aaPanel > Security > Firewall. Open:
- **80** (HTTP) - always
- **443** (HTTPS) - after SSL setup

Keep these closed (internal only):
- 3100 (API server)
- 1883 (MQTT broker)
- 3101 (Orbital WebSocket bridge)

### Step 3: Run the deploy script

In aaPanel > Terminal, paste:

```bash
cd /www/wwwroot
curl -fsSL https://raw.githubusercontent.com/qihao42/home-ai/main/deploy/deploy.sh | bash
```

This clones the repo, installs dependencies, builds everything, and starts all services via PM2.

### Step 4: Configure Nginx

aaPanel > Website > Add Site:
- **Domain**: your domain or server IP
- **Root directory**: `/www/wwwroot/home-ai/packages/dashboard/dist`
- **PHP**: Pure Static

Then click the site > Config file, replace contents with [nginx.conf.template](./nginx.conf.template) (edit `__DOMAIN__` first).

Or manually:
```bash
cp /www/wwwroot/home-ai/deploy/nginx.conf.template /www/server/panel/vhost/nginx/home-ai.conf
# edit __DOMAIN__ in that file
nginx -t && nginx -s reload
```

### Step 5: Enable HTTPS

aaPanel > Website > select site > SSL > Let's Encrypt > Apply

You need a domain pointing to this server's IP for Let's Encrypt to work.

**No domain?** Alternatives:
- Use [nip.io](https://nip.io): `178-128-59-223.nip.io` auto-resolves to your IP. Let's Encrypt works with it.
- Or use Cloudflare Tunnel (free, no domain): see alternative-cloudflare-tunnel.md

### Step 6: Verify

Open `https://your-domain/` - you should see the dashboard.

Test the voice button 🎤 - it requires HTTPS to access the microphone.

---

## Manual Deploy (if script fails)

```bash
# 1. Clone
cd /www/wwwroot
git clone https://github.com/qihao42/home-ai.git
cd home-ai

# 2. Install
npm install

# 3. Build
npm run build -w packages/shared
npm run build -w packages/server
npm run build -w packages/simulator
npm run build -w packages/dashboard

# 4. Start via PM2
npm install -g pm2
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup   # follow the printed command to enable boot start
```

---

## Managing the Deployment

```bash
# Status
pm2 status

# Logs
pm2 logs homeai-server
pm2 logs homeai-simulator
pm2 logs homeai-orbital-ws

# Restart one service
pm2 restart homeai-server

# Restart all
pm2 restart all

# Update after code change (pull + rebuild + restart)
cd /www/wwwroot/home-ai
git pull
npm install
npm run build -w packages/server
npm run build -w packages/dashboard
pm2 restart all
```

---

## Troubleshooting

### Dashboard loads but API returns errors

Check Nginx proxy config matches the service ports:
- `/api` -> `127.0.0.1:3100`
- `/api/ws` -> `127.0.0.1:3100` (WebSocket upgrade)
- `/orbital-ws` -> `127.0.0.1:3101`

```bash
# Confirm server is listening
ss -lnt | grep 3100
curl http://127.0.0.1:3100/api/entities
```

### MQTT broker won't start

Usually port 1883 is already in use:
```bash
lsof -i :1883
# kill any mosquitto etc., or set MQTT_PORT env to something else
```

### Simulator devices not showing up

```bash
pm2 logs homeai-simulator --lines 50
```

Should see "MQTT broker is ready" then "All devices started". If stuck waiting, server didn't come up - check `pm2 logs homeai-server`.

### Voice button doesn't show on phone

Requires HTTPS origin. Ensure SSL cert applied and accessing via `https://` URL.
