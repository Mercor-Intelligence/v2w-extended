"""Configuration management for Vision2Web"""

from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class SandboxConfig:
    """Sandbox configuration"""
    image: str = "vision2web-sandbox:latest"
    workspace_dir: str = "/workspace"
    user: str = "root"


@dataclass
class InferenceConfig:
    """Inference configuration"""
    framework: str = "claude_code"
    model: str = "claude-sonnet-4-5-20250929"
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    max_workers: int = 5
    timeout: int = 3600  # seconds
    task: Optional[str] = None  # webpage, frontend, or website
    max_retries: int = 2  # maximum number of retries on failure (total attempts = 1 + max_retries)


@dataclass
class EvaluationConfig:
    """Evaluation configuration"""
    gui_agent_model: str = "glm-4.6v"  # Model for GUI testing agent
    vlm_judge_model: str = "gemini-3-pro-preview"  # Model for visual prototype comparison
    api_key: Optional[str] = None
    base_url: str = None
    max_workers: int = 1
    base_port: int = 3000
    headless: bool = True
    window_width: int = 1024
    window_height: int = 768
    generate_videos: bool = False
    task: Optional[str] = None  # webpage, frontend, or website
    framework: Optional[str] = None
    model: Optional[str] = None  # Model filter for evaluation (inference model to evaluate)


@dataclass
class Config:
    """Main configuration class"""
    datasets_dir: Path = field(default_factory=lambda: Path("./datasets"))
    results_dir: Path = field(default_factory=lambda: Path("./results"))

    sandbox: SandboxConfig = field(default_factory=SandboxConfig)
    inference: InferenceConfig = field(default_factory=InferenceConfig)
    evaluation: EvaluationConfig = field(default_factory=EvaluationConfig)

    # Proxy settings
    http_proxy: Optional[str] = None
    https_proxy: Optional[str] = None
    no_proxy: Optional[str] = None

    def ensure_dirs(self):
        """Ensure all directories exist"""
        self.datasets_dir.mkdir(parents=True, exist_ok=True)
        self.results_dir.mkdir(parents=True, exist_ok=True)
