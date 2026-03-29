"""Vision2Web - Benchmark for visual web development with AI agents"""

__version__ = "1.0.0"
__author__ = "Vision2Web Team"

from vision2web.core.config import Config
from vision2web.core.dataset import DatasetManager, Project

__all__ = [
    "Config",
    "DatasetManager",
    "Project",
    "__version__",
]
