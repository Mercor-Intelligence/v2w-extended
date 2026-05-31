#!/usr/bin/env bash
# Prism shader scene — self-contained static server bootstrap.
# Serves the vanilla HTML/CSS/JS app on http://localhost:3000 with no build
# step and no network access (Three.js and the font are vendored locally).

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app"
cd "$APP_DIR"

PORT=3000
echo "=========================================="
echo "  Prism — Real-Time Iridescent Shader"
echo "=========================================="
echo "App directory: $APP_DIR"
echo ">>> Serving on http://localhost:${PORT}"
echo "    Live (animated):   http://localhost:${PORT}/"
echo "    Frozen (capture):  http://localhost:${PORT}/?t=2.0&preset=aurora"
echo "    (Press Ctrl+C to stop.)"
echo ""

# Prefer Python's stdlib server (present in the base image). Fall back to a
# Node static server via npx if Python is unavailable.
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind 0.0.0.0
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT" --bind 0.0.0.0
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l "$PORT" .
else
  echo "ERROR: need python3 or npx to serve the app." >&2
  exit 1
fi
