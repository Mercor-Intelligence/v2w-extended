#!/usr/bin/env bash
# Balancing Birth to Baby — deployment script.
# Runs in a clean container: installs Node (if missing), installs deps, starts Vite dev server on port 3000.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app"

echo "=== Balancing Birth to Baby — start.sh ==="
echo "App directory: ${APP_DIR}"

# ---------------------------------------------------------------------------
# 1. Ensure Node.js (>=18) is available.
# ---------------------------------------------------------------------------
need_node_install=0
if ! command -v node >/dev/null 2>&1; then
  need_node_install=1
else
  NODE_MAJOR=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
  if [ "${NODE_MAJOR:-0}" -lt 18 ]; then
    need_node_install=1
  fi
fi

if [ "$need_node_install" -eq 1 ]; then
  echo "Node.js (>=18) not found — installing via NodeSource…"
  if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y --no-install-recommends curl ca-certificates gnupg
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y --no-install-recommends nodejs
  elif command -v apk >/dev/null 2>&1; then
    apk add --no-cache nodejs npm
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  else
    echo "ERROR: no supported package manager found to install Node.js" >&2
    exit 1
  fi
fi

echo "Using Node: $(node -v)"
echo "Using npm:  $(npm -v)"

# ---------------------------------------------------------------------------
# 2. Install application dependencies.
# ---------------------------------------------------------------------------
cd "${APP_DIR}"

if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  echo "Installing npm dependencies…"
  npm install --no-audit --no-fund --loglevel=error
else
  echo "Dependencies already installed."
fi

# ---------------------------------------------------------------------------
# 3. Free port 3000 if needed and start the Vite dev server.
# ---------------------------------------------------------------------------
if command -v fuser >/dev/null 2>&1; then
  fuser -k 3000/tcp >/dev/null 2>&1 || true
fi

echo "Starting Vite dev server on http://localhost:3000 …"
exec npm run dev
