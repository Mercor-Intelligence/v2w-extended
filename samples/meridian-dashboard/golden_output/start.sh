#!/usr/bin/env bash
# Meridian - Global Emissions Analytics. Self-contained static server bootstrap.
# Serves the golden build at http://localhost:3000. No build step, no runtime
# network: the app loads a local vendored JSON dataset and a local font.

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app"
cd "$APP_DIR"

PORT=3000
echo "=========================================="
echo "  Meridian - Global Emissions Analytics"
echo "=========================================="
echo "App directory: $APP_DIR"
echo "Serving on http://localhost:${PORT}"
echo "(Press Ctrl+C to stop.)"
echo ""

# Prefer Python's stdlib static server (present in nearly every container).
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind 0.0.0.0
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT" --bind 0.0.0.0
elif command -v npx >/dev/null 2>&1; then
  # Fallback: pinned static file server via npx.
  exec npx --yes serve@14 -l "$PORT" .
else
  echo "ERROR: need python3, python, or npx to serve static files." >&2
  exit 1
fi
