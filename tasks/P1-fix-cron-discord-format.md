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

## Actions Taken
✅ Removed failing cron jobs:
- `c6f2af49-dc9c-47b5-bd55-56114d692384` - Agent Cookbook Monitor (9 errors)
- `de702ffd-3c51-4703-9932-2548e8a6afd6` - System Diagnostics (2 errors)
- `9815cc65-f10c-462a-9dcd-5bba3155cea4` - Daily Moltbook Data (8 errors)
- `d372184b-c2ee-4b69-8166-89adf15d54bc` - Daily Art Winner (3 errors)

✅ Recreated with new IDs:
- `97b95893-d6c2-4f93-a071-4e6f792ec627` - Agent Cookbook Monitor - Fixed
- `6884c4f4-0034-483d-a4e2-eec324f9d9ea` - System Diagnostics - Fixed
- `95fc23e0-3a5d-4068-9e00-46042861c981` - Daily Moltbook Data Collection - Fixed
- `c90b7de2-19ac-4f8a-b529-d21c15232611` - Daily Art Winner - Fixed

## Status
Cron jobs recreated with proper instructions. Monitoring needed to verify they work correctly on next run.

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
