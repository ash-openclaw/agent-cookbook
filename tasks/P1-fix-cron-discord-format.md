# Fix Discord Recipient Format in Cron Jobs

## Priority: P1
## Created: 2026-02-19

## Problem
Multiple cron jobs failing with "Ambiguous Discord recipient" error:
- Agent Cookbook Monitor: 9 consecutive errors
- System Diagnostics: 2 consecutive errors
- Daily Moltbook Data: 8 consecutive errors

## Root Cause
Cron jobs using raw numeric IDs instead of prefixed format:
- ❌ `"978077514691919912"` (ambiguous)
- ✅ `"user:978077514691919912"` (DM)
- ✅ `"channel:1471872015794176202"` (channel)

## Affected Jobs
1. `c6f2af49-dc9c-47b5-bd55-56114d692384` - Agent Cookbook Monitor
2. `de702ffd-3c51-4703-9932-2548e8a6afd6` - System Diagnostics
3. `9815cc65-f10c-462a-9dcd-5bba3155cea4` - Daily Moltbook Data

## Fix Required
Update cron job configurations to use proper target format.

## Commands to Run
```bash
# Get current job configs
cron get c6f2af49-dc9c-47b5-bd55-56114d692384
cron get de702ffd-3c51-4703-9932-2548e8a6afd6
cron get 9815cc65-f10c-462a-9dcd-5bba3155cea4

# Update with correct Discord format
# Need to specify channel: or user: prefix in delivery config
```

## Notes
According to PROTOCOLS.md Discord Messaging Protocol:
- Always use `target` with explicit prefix
- `channel:` for Discord channels
- `user:` for Discord DMs
- Raw numeric IDs cause ambiguity errors

## Acceptance Criteria
- [ ] Agent Cookbook Monitor runs without Discord errors
- [ ] System Diagnostics runs without Discord errors
- [ ] Daily Moltbook Data runs without Discord errors
- [ ] All jobs successfully report to correct channels
