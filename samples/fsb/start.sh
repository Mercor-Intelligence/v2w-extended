#!/usr/bin/env bash
# Self-contained start script for the FSB website.
# Installs all dependencies and starts the dev server on http://localhost:3000

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app"

# --------- 1) Ensure Node.js (>=18) is available ---------
need_node_install=false
if ! command -v node >/dev/null 2>&1; then
  need_node_install=true
else
  node_major=$(node -p "process.versions.node.split('.')[0]")
  if [ "$node_major" -lt 18 ]; then
    need_node_install=true
  fi
fi

if [ "$need_node_install" = true ]; then
  echo ">>> Installing Node.js 20.x ..."
  if command -v apt-get >/dev/null 2>&1; then
    if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; else SUDO=""; fi
    $SUDO apt-get update -y
    $SUDO apt-get install -y curl ca-certificates
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
    $SUDO apt-get install -y nodejs
  else
    echo "Unsupported package manager. Please install Node.js >= 18 manually." >&2
    exit 1
  fi
fi

echo ">>> Node version: $(node -v)"
echo ">>> npm  version: $(npm -v)"

# --------- 2) Install dependencies ---------
cd "$APP_DIR"
if [ ! -d node_modules ]; then
  echo ">>> Installing project dependencies (npm install) ..."
  npm install --no-audit --no-fund
else
  echo ">>> Dependencies already installed."
fi

# --------- 3) Start the dev server on port 3000 ---------
echo ">>> Starting the Vite development server on http://localhost:3000 ..."
exec npm run dev -- --host 0.0.0.0 --port 3000
