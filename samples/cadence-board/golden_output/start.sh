#!/usr/bin/env bash
# Cadence board: self-contained static bootstrap.
# Serves the pure front-end (HTML / CSS / JS) on http://localhost:3000.
# There is no server, no database, and no npm install: the board persists in
# the browser's localStorage. Any static file server works; this script prefers
# Python's built-in http.server and falls back to `npx serve`.

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app/public"
cd "$APP_DIR"

echo "=========================================="
echo "  Cadence - Personal Kanban - Bootstrap"
echo "=========================================="
echo "Serving static app from: $APP_DIR"
echo ">>> Open http://localhost:3000"
echo "    (Press Ctrl+C to stop.)"
echo ""

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server 3000 --bind 0.0.0.0
else
  exec npx --yes serve -l 3000 .
fi
