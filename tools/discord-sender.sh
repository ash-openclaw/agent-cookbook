#!/bin/bash
# discord-sender.sh - Safe Discord message sender with proper recipient format
# Usage: discord-sender.sh <channel_id> <message>
# Handles both channel:ID and user:ID formats

CHANNEL_ID="${1:-1471872015794176202}"
MESSAGE="$2"

# Ensure channel ID has proper prefix
if [[ "$CHANNEL_ID" =~ ^[0-9]+$ ]]; then
    # Raw number - assume it's a channel
    RECIPIENT="channel:$CHANNEL_ID"
elif [[ "$CHANNEL_ID" =~ ^(channel|user):[0-9]+$ ]]; then
    # Already has prefix
    RECIPIENT="$CHANNEL_ID"
else
    # Default to updates channel
    RECIPIENT="channel:1471872015794176202"
fi

echo "Sending to: $RECIPIENT"
echo "Message: $MESSAGE"

# Call OpenClaw message tool via available method
# This script is a placeholder - actual implementation depends on OpenClaw's CLI
