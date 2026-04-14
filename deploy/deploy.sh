#!/usr/bin/env bash
# HomeAI one-shot deploy script for Linux servers (tested on aaPanel / Ubuntu).
#
# Usage:
#   cd /www/wwwroot
#   curl -fsSL https://raw.githubusercontent.com/qihao42/home-ai/main/deploy/deploy.sh | bash
#
# Or after cloning:
#   bash deploy/deploy.sh

set -euo pipefail

REPO_URL="https://github.com/qihao42/home-ai.git"
APP_DIR="/www/wwwroot/home-ai"
NODE_MIN_MAJOR=18

echo "==> HomeAI deploy starting"

# --- 1. Check Node.js ---
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node not found. Install Node.js >= $NODE_MIN_MAJOR first."
  echo "  aaPanel: Software Store -> PM2 Manager or Node.js Version Manager"
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt "$NODE_MIN_MAJOR" ]; then
  echo "ERROR: Node.js $NODE_MAJOR detected, need >= $NODE_MIN_MAJOR"
  exit 1
fi
echo "==> Node.js $(node -v) OK"

# --- 2. Check / install PM2 ---
if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2 globally"
  npm install -g pm2
fi
echo "==> PM2 $(pm2 -v) OK"

# --- 3. Clone or pull ---
if [ -d "$APP_DIR/.git" ]; then
  echo "==> Updating existing repo at $APP_DIR"
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/main
else
  echo "==> Cloning repo to $APP_DIR"
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# --- 4. Install dependencies ---
echo "==> Installing dependencies"
npm install --no-audit --no-fund

# --- 5. Build ---
echo "==> Building shared + server"
npm run build -w packages/shared
npm run build -w packages/server
npm run build -w packages/simulator
echo "==> Building dashboard"
npm run build -w packages/dashboard

# --- 6. Restart via PM2 ---
echo "==> Restarting services via PM2"
pm2 delete all 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save

echo ""
echo "======================================"
echo "  Deploy complete!"
echo "======================================"
echo "  PM2 status:"
pm2 status
echo ""
echo "Next steps:"
echo "  1. Configure Nginx with deploy/nginx.conf.template"
echo "     (point root to: $APP_DIR/packages/dashboard/dist)"
echo "  2. Enable HTTPS via aaPanel > Website > SSL > Let's Encrypt"
echo "  3. Open http://<your-domain> in a browser"
echo ""
