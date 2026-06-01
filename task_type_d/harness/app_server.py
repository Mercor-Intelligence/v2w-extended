"""Build a Task Type D app with Vite and serve the static output locally.

The build output (``dist/``) is served in-process by a threaded HTTP server on
an ephemeral port, which avoids depending on a candidate's ``preview`` script or
fighting over a fixed port. Task Type D Stack A is React + Vite, whose default
build emits a self-contained ``dist/`` with absolute ``/assets/...`` URLs that a
plain static server handles correctly (the app has no client-side routing).
"""

from __future__ import annotations

import functools
import http.server
import shutil
import subprocess
import threading
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

BUILD_TIMEOUT_S = 600


@dataclass
class BuildResult:
    ok: bool
    dist_dir: Path | None
    log: str


def _run(cmd: list[str], cwd: Path) -> tuple[int, str]:
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=BUILD_TIMEOUT_S,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        # A candidate build that hangs is a build failure, not a grader crash.
        return 124, f"$ {' '.join(cmd)}\nTIMEOUT after {BUILD_TIMEOUT_S}s\n{exc.stdout or ''}\n{exc.stderr or ''}\n"
    log = f"$ {' '.join(cmd)}\n{proc.stdout}\n{proc.stderr}\n"
    return proc.returncode, log


def build_app(app_dir: Path) -> BuildResult:
    """Install dependencies and run the production build.

    Uses ``npm ci`` when a lockfile is present (reproducible), otherwise
    ``npm install``. Returns the ``dist/`` directory on success.
    """
    app_dir = app_dir.resolve()
    if shutil.which("npm") is None:
        return BuildResult(False, None, "npm not found on PATH")
    if not (app_dir / "package.json").exists():
        return BuildResult(False, None, f"no package.json in {app_dir}")

    install = ["npm", "ci"] if (app_dir / "package-lock.json").exists() else ["npm", "install"]
    log = ""
    code, out = _run(install, app_dir)
    log += out
    if code != 0:
        return BuildResult(False, None, log)

    code, out = _run(["npm", "run", "build"], app_dir)
    log += out
    if code != 0:
        return BuildResult(False, None, log)

    dist = app_dir / "dist"
    if not (dist / "index.html").exists():
        return BuildResult(False, None, log + f"\nbuild produced no dist/index.html in {dist}")
    return BuildResult(True, dist, log)


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args: object) -> None:  # noqa: D401 - silence access logs
        return


@contextmanager
def serve(dist_dir: Path) -> Iterator[str]:
    """Serve ``dist_dir`` on an ephemeral localhost port for the block's duration."""
    handler = functools.partial(_QuietHandler, directory=str(dist_dir))
    with http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler) as httpd:
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            yield f"http://127.0.0.1:{port}"
        finally:
            httpd.shutdown()
            thread.join(timeout=5)
