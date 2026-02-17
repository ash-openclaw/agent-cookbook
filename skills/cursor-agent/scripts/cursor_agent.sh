#!/bin/bash
# Cursor Agent wrapper for OpenClaw skill
# Usage: cursor_agent.sh <ask|edit|task> [args...]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/cursor_agent.py" "$@"
