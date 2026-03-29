#!/bin/bash

# Evaluation script for Vision2Web
# Usage: Set environment variables or pass them directly to the script

set -e

# Configuration from environment variables with defaults
API_KEY="${API_KEY:-}"
BASE_URL="${BASE_URL:-}"
GUI_AGENT_MODEL="${GUI_AGENT_MODEL:-}"
VLM_JUDGE_MODEL="${VLM_JUDGE_MODEL:-}"
SANDBOX="${SANDBOX:-vision2web-sandbox:latest}"
RESULTS_DIR="${RESULTS_DIR:-./results}"
DATASETS_DIR="${DATASETS_DIR:-./datasets}"
MAX_WORKERS="${MAX_WORKERS:-}"
TASK="${TASK:-}"
FRAMEWORK="${FRAMEWORK:-}"
MODEL="${MODEL:-}"

# Build command
CMD="vision2web evaluate \
  --results-dir $RESULTS_DIR \
  --datasets-dir $DATASETS_DIR \
  --api-key $API_KEY \
  --base-url $BASE_URL \
  --gui-agent-model $GUI_AGENT_MODEL \
  --vlm-judge-model $VLM_JUDGE_MODEL \
  --sandbox $SANDBOX \
  --max-workers $MAX_WORKERS"

# Add optional arguments
[ -n "$TASK" ] && CMD="$CMD --task $TASK"
[ -n "$FRAMEWORK" ] && CMD="$CMD --framework $FRAMEWORK"
[ -n "$MODEL" ] && CMD="$CMD --model $MODEL"

# Execute
echo "Running: $CMD"
exec $CMD
