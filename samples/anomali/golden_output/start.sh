#!/usr/bin/env bash
# Anomali Agentic SOC Platform — self-contained dev server bootstrap.
# Runs in a clean container: installs Node.js (if missing), installs npm deps, starts Vite on port 3000.

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app"
cd "$APP_DIR"

echo "=========================================="
echo "  Anomali Agentic SOC Platform - Bootstrap"
echo "=========================================="
echo "App directory: $APP_DIR"

# ---------- Node.js ----------
need_node=true
if command -v node >/dev/null 2>&1; then
  node_major=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)
  if [ "$node_major" -ge 18 ]; then
    need_node=false
  fi
fi

if [ "$need_node" = true ]; then
  echo "[1/3] Installing Node.js 20 (LTS)..."
  if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y --no-install-recommends curl ca-certificates gnupg
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y --no-install-recommends nodejs
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  elif command -v apk >/dev/null 2>&1; then
    apk add --no-cache nodejs npm
  else
    echo "ERROR: Unable to install Node.js automatically. Please install Node.js >=18 manually." >&2
    exit 1
  fi
else
  echo "[1/3] Node.js $(node -v) detected — skipping install."
fi

echo "    Node:  $(node -v)"
echo "    NPM:   $(npm -v)"

# ---------- Dependencies ----------
echo "[2/3] Installing npm dependencies..."
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund || npm install --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

# ---------- Start ----------
echo "[3/3] Starting Vite dev server on http://localhost:3000"
echo "      (Press Ctrl+C to stop.)"
echo ""
exec npm run dev -- --host 0.0.0.0 --port 3000
