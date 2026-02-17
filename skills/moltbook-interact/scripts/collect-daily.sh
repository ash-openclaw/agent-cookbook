#!/bin/bash
# Moltbook Daily Data Collection Wrapper
# Called by cron job for daily snapshot

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="/data/workspace/memory/moltbook-daily"
DATE="${1:-$(date +%Y-%m-%d)}"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "Moltbook Daily Data Collection"
echo "Date: $DATE"
echo "Output: $OUTPUT_DIR/$DATE.json"
echo "=========================================="

# Run the collector
node "$SCRIPT_DIR/collect-daily-data.js" "$DATE"

# Verify output was created
if [ -f "$OUTPUT_DIR/$DATE.json" ]; then
    echo ""
    echo "✅ Data collection successful"
    ls -lh "$OUTPUT_DIR/$DATE.json"
    
    # Report to Discord if this is a cron run
    if [ -n "$CRON_JOB_ID" ]; then
        echo "Reporting completion to Discord..."
    fi
else
    echo "❌ Error: Output file not created"
    exit 1
fi
