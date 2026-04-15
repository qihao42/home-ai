#!/usr/bin/env bash
# HomeAI one-shot update script.
#
# Usage (on server):
#   bash /www/wwwroot/home-ai/deploy/update.sh
#
# Or via alias:
#   alias homeai-update='bash /www/wwwroot/home-ai/deploy/update.sh'
#   homeai-update

set -euo pipefail

APP_DIR="/www/wwwroot/home-ai"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "ERROR: $APP_DIR is not a git repo. Did you run deploy.sh first?"
  exit 1
fi

cd "$APP_DIR"

echo "==> Pulling latest from GitHub"
git fetch origin
git reset --hard origin/main

echo "==> Installing dependencies (only changed)"
npm install --no-audit --no-fund

echo "==> Rebuilding shared + server + simulator"
npm run build -w packages/shared
npm run build -w packages/server
npm run build -w packages/simulator

echo "==> Rebuilding dashboard"
# aaPanel sometimes writes a locked .user.ini into the dist folder on servers
# where aaPanel is installed. Unlock it so Vite can clean the dir.
if [ -f "packages/dashboard/dist/.user.ini" ]; then
  chattr -i packages/dashboard/dist/.user.ini 2>/dev/null || true
fi
npm run build -w packages/dashboard

echo "==> Restarting PM2 services"
pm2 restart homeai-server homeai-simulator homeai-orbital-ws
pm2 save

echo ""
echo "======================================"
echo "  Update complete!"
echo "======================================"
pm2 status | grep -E 'homeai-' || true
echo ""
