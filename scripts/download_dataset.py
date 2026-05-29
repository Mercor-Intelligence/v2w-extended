#!/usr/bin/env python3
"""Download the Vision2Web dataset from HuggingFace.

Usage:
    python scripts/download_dataset.py
    python scripts/download_dataset.py --task webpage
    python scripts/download_dataset.py --output-dir ./data
"""

import argparse
import tarfile
from pathlib import Path
from huggingface_hub import hf_hub_download

REPO_ID = "zai-org/Vision2Web"
ALL_TASKS = ["webpage", "frontend", "website"]


def download(task_types: list[str], output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)

    for task_type in task_types:
        print(f"Downloading '{task_type}'...")
        archive_path = hf_hub_download(
            repo_id=REPO_ID,
            repo_type="dataset",
            filename=f"archives/{task_type}.tar.gz",
        )

        print(f"  Extracting to {output_dir}...")
        with tarfile.open(archive_path, "r:gz") as tar:
            tar.extractall(path=output_dir)

        print(f"  Done.")

    print(f"\nDataset saved to: {output_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download the Vision2Web dataset")
    parser.add_argument(
        "--task",
        choices=ALL_TASKS,
        default=None,
        help="Task type to download (default: all)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("./datasets"),
        help="Directory to save the dataset (default: ./datasets)",
    )
    args = parser.parse_args()

    task_types = [args.task] if args.task else ALL_TASKS
    download(task_types, args.output_dir)
