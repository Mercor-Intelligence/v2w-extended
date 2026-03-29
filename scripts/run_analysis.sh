#!/bin/bash

# Analysis script for Vision2Web
# Usage: Set environment variables or pass them directly to the script

set -e

# Configuration from environment variables with defaults
RESULTS_DIR="${RESULTS_DIR:-./results}"
DATASETS_DIR="${DATASETS_DIR:-./datasets}"
OUTPUT="${OUTPUT:-}"

# Build command
CMD="vision2web analyze \
  --results-dir $RESULTS_DIR \
  --datasets-dir $DATASETS_DIR"

# Add optional arguments
[ -n "$OUTPUT" ] && CMD="$CMD --output $OUTPUT"

# Execute
echo "Running: $CMD"
exec $CMD
