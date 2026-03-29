"""Setup configuration for Vision2Web"""

from setuptools import setup, find_packages
from pathlib import Path

# Read README
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

setup(
    name="vision2web",
    version="1.0.0",
    description="Benchmark for evaluating AI coding agents on visual web development tasks",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Vision2Web Team",
    author_email="",
    url="https://github.com/yourusername/Vision2Web",
    packages=find_packages(exclude=["tests", "tests.*"]),
    python_requires=">=3.8",
    install_requires=[
        "click>=8.0.0",
        "pyyaml>=6.0",
        "openai>=1.0.0",
        "playwright>=1.40.0",
        "Pillow>=10.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "vision2web=vision2web.cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Software Development :: Testing",
    ],
    keywords="benchmark ai agents web-development coding evaluation vision",
    project_urls={
        "Bug Reports": "https://github.com/yourusername/Vision2Web/issues",
        "Source": "https://github.com/yourusername/Vision2Web",
    },
)
