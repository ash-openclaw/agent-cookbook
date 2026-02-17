#!/usr/bin/env bash
set -euo pipefail
export CURSOR_INVOKED_AS="agent"
SCRIPT_DIR="/data/workspace/tools/cursor-agent"
NODE_BIN="$SCRIPT_DIR/node"

# Enable Node.js compile cache
if [ -z "${NODE_COMPILE_CACHE:-}" ]; then
  export NODE_COMPILE_CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/cursor-compile-cache"
fi

exec -a "agent" "$NODE_BIN" --use-system-ca "$SCRIPT_DIR/index.js" "$@"
