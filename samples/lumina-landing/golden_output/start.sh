#!/usr/bin/env bash
# Lumina - Edge AI Inference + Observability: self-contained static server bootstrap.
# Serves the vanilla HTML/CSS/JS landing page on http://localhost:3000.
# No build step, no npm install: every asset (fonts, images, data, JS) is vendored
# locally under app/, so this runs in a clean container with just Python
# (or Node via npx serve as a fallback). No network access at runtime.

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app"
cd "$APP_DIR"

echo "=========================================="
echo "  Lumina - Edge AI Inference - Bootstrap"
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
