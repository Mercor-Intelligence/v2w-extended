#!/usr/bin/env bash
# Flux - Flow Field Studio: self-contained static server bootstrap.
# Serves the vanilla HTML/CSS/JS Canvas app on http://localhost:3000.
# No build step, no npm install: every asset (simplex-noise, fonts) is vendored
# locally under app/assets, so this runs in a clean container with just Python
# (or Node via npx serve as a fallback).

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app"
cd "$APP_DIR"

echo "=========================================="
echo "  Flux - Flow Field Studio - Bootstrap"
echo "=========================================="
echo "App directory: $APP_DIR"
echo ">>> Serving on http://localhost:3000"
echo "    (Press Ctrl+C to stop.)"
echo ""

# Prefer Python's built-in static server (present on virtually every image).
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server 3000 --bind 0.0.0.0
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server 3000 --bind 0.0.0.0
else
  # Fallback: Node's "serve" via npx (no global install needed).
  echo ">>> Python not found; falling back to 'npx serve'."
  exec npx --yes serve -l 3000 .
fi
