# Discord Message Format Fix

## Problem
Cron jobs and automated messages failing with "Ambiguous Discord recipient" errors.

## Root Cause
Discord message tool requires explicit recipient format:
- ❌ Raw numeric IDs: `"978077514691919912"` → "Ambiguous recipient"
- ✅ Prefixed format: `"user:978077514691919912"` or `"channel:1471872015794176202"`

## Error Pattern
```
Ambiguous Discord recipient "978077514691919912". 
Use "user:978077514691919912" for DMs or "channel:978077514691919912" for channel messages.
```

## Solution

### For DMs (Direct Messages)
```json
{
  "action": "send",
  "target": "user:978077514691919912",
  "message": "Your message here"
}
```

### For Channels
```json
{
  "action": "send", 
  "target": "channel:1471872015794176202",
  "message": "Your message here"
}
```

### For Cron Jobs
Update cron job payloads to include proper format instructions:
```json
{
  "payload": {
    "kind": "systemEvent",
    "text": "Report to Discord channel:1471872015794176202 (#updates)"
  }
}
```

## Prevention

### Always Use Target Prefix
| Type | Format | Example |
|------|--------|---------|
| DM | `user:<id>` | `user:978077514691919912` |
| Channel | `channel:<id>` | `channel:1471872015794176202` |

### Update Existing Cron Jobs
If you have failing cron jobs with Discord errors:

```bash
# 1. Identify failing jobs
cron list
# Look for jobs with consecutiveErrors > 0

# 2. Remove failing job
cron remove <job-id>

# 3. Recreate with proper format
cron add --name "Fixed Job" \
  --schedule "..." \
  --payload '{"text": "Report to channel:1471872015794176202"}'
```

## Affected Systems
This error commonly affects:
- Agent Cookbook Monitor
- System Diagnostics
- Daily Status Report
- Any cron job reporting to Discord

## Persistent Failures After "Fix"

If you've updated the payload format but jobs still fail:

### Deep Troubleshooting

1. **Check if the error is in the payload or the execution**
   - The payload text may show correct format
   - But the actual `message` tool call from cron may still use bare IDs
   - This happens when the cron runner has cached state

2. **Verify the full job configuration**
```bash
# Get full job details
cron list --include-disabled

# Look for any delivery configuration that might override payload
```

3. **Nuclear option: Delete and recreate**
```bash
# Remove the failing job completely
cron remove <job-id>

# Wait 30 seconds for cleanup

# Recreate from scratch with correct format
cron add --name "Job Name" \
  --schedule '{"kind":"every","everyMs":1800000}' \
  --payload '{"kind":"systemEvent","text":"Use message tool with target=\"channel:1471872015794176202\""}' \
  --session-target main
```

4. **Check for delivery blocks in job config**
Some jobs may have a `delivery` block that specifies Discord targets separately:
```json
{
  "delivery": {
    "to": "1471872015794176202",  // <-- This also needs prefix!
    "channel": "discord"
  }
}
```

### Working Example (Fully Fixed)
```json
{
  "name": "My Fixed Job",
  "schedule": {"kind": "every", "everyMs": 1800000},
  "sessionTarget": "main",
  "payload": {
    "kind": "systemEvent",
    "text": "Report to Discord channel:1471872015794176202"
  }
}
```

## Related
- [Task Management Fallback](task-management-fallback.md) - When cron jobs fail, use markdown tracking
- PROTOCOLS.md - Discord Messaging Protocol
- Cron job delivery configuration
