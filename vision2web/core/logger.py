"""Logging utilities for Vision2Web"""

import logging
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime


def setup_logger(
    name: str = 'vision2web',
    level: str = 'INFO',
    log_file: Optional[Path] = None,
    format_string: Optional[str] = None
) -> logging.Logger:
    """
    Setup a logger with console and optional file output.

    Args:
        name: Logger name
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional path to log file
        format_string: Optional custom format string

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.handlers = []  # Clear existing handlers
    logger.setLevel(getattr(logging, level.upper()))

    # Default format
    if format_string is None:
        format_string = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    formatter = logging.Formatter(format_string, datefmt='%Y-%m-%d %H:%M:%S')

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler (if specified)
    if log_file:
        log_file = Path(log_file)
        log_file.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(getattr(logging, level.upper()))
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """Get an existing logger by name"""
    return logging.getLogger(name)


class LoggerContext:
    """Context manager for temporary logger configuration"""

    def __init__(
        self,
        logger: logging.Logger,
        level: Optional[str] = None,
        log_file: Optional[Path] = None
    ):
        self.logger = logger
        self.new_level = level
        self.log_file = log_file
        self.old_level = None
        self.file_handler = None

    def __enter__(self):
        if self.new_level:
            self.old_level = self.logger.level
            self.logger.setLevel(getattr(logging, self.new_level.upper()))

        if self.log_file:
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            self.file_handler = logging.FileHandler(self.log_file, encoding='utf-8')
            self.file_handler.setFormatter(formatter)
            self.logger.addHandler(self.file_handler)

        return self.logger

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.old_level is not None:
            self.logger.setLevel(self.old_level)

        if self.file_handler:
            self.logger.removeHandler(self.file_handler)
            self.file_handler.close()
