---
id: TASK-008
title: Fix Remaining Discord Format Errors in Cron Jobs
priority: P1
status: in_progress
created: 2026-02-22
updated: 2026-02-22
tags: [cron, discord, bug]
---

# Task: Fix Remaining Discord Format Errors

## Current Status: 9/15 jobs healthy (60%)

### Last Check (2026-02-22 04:01 UTC)
| Status | Job | ID | Consecutive Errors |
|--------|-----|-----|-------------------|
| ❌ | Moltbook Engagement | 85cf82c7-f509-495c-aa85-d95f1b45f21c | 11 |
| ❌ | Heartbeat Check | 1b07cba5-334f-4e65-99ea-7603a87e0ee9 | 12 |
| ❌ | Agent Cookbook Monitor | 97b95893-d6c2-4f93-a071-4e6f792ec627 | 14 |
| ❌ | System Diagnostics | 6884c4f4-0034-483d-a4e2-eec324f9d9ea | 1 |
| ❌ | Daily Art Winner | ad823b27-c1c9-4358-acb9-e6379b8bcbc5 | 1 |
| ❌ | Daily Moltbook Data | 95fc23e0-3a5d-4068-9e00-46042861c981 | 1 |
| ✅ | Late Night Check | e4dcfdf0-ea9a-4c2a-b98d-8d7962b214dd | 0 |
| ✅ | Daily Todo | 9ccf99a1-9940-4883-b39f-7ba34eb2cd7d | 0 |
| ✅ | Workspace Cleanup | 6b648717-c6c7-447e-bc2a-664112099621 | 0 |
| ✅ | Nightly Build | 67ac6713-966d-4623-901d-e040b80d5a6d | 0 |
| ✅ | Daily Reflection | 917ccfc3-3dd6-4262-8cfa-13e50eb10751 | 0 |
| ✅ | Workout Reminder | 46676d62-da35-4fd8-81bb-c997320fc7dd | 0 |
| ✅ | Daily Status | 80b9ed30-35dd-4c97-ae03-352f6e003897 | 0 |
| ✅ | Daily Art | 8182716d-9e03-4ac4-a099-c9e9d208f22f | 0 |
| ✅ | Weekly Analysis | f96f9775-2ddc-40e4-a1f7-71f150671503 | 0 |

### Error Pattern
```
"Ambiguous Discord recipient '978077514691919912'. 
Use 'user:978077514691919912' for DMs or 'channel:978077514691919912' for channel messages."
```

### Root Cause
Cron jobs contain instructions that may be causing the message tool to incorrectly parse target format. The job payloads were updated but the job definitions themselves may still have stale target configurations.

### Proposed Solution
Delete and recreate the 6 failing jobs with completely fresh configurations ensuring:
1. Payload instructions explicitly use `"target": "channel:1471872015794176202"` or `"target": "user:978077514691919912"`
2. No bare numeric IDs anywhere in the configuration
3. Test each job manually after recreation

### Affected Jobs to Recreate
1. [ ] `85cf82c7-f509-495c-aa85-d95f1b45f21c` - Moltbook Engagement
2. [ ] `1b07cba5-334f-4e65-99ea-7603a87e0ee9` - Heartbeat Check
3. [ ] `97b95893-d6c2-4f93-a071-4e6f792ec627` - Agent Cookbook Monitor
4. [ ] `6884c4f4-0034-483d-a4e2-eec324f9d9ea` - System Diagnostics
5. [ ] `ad823b27-c1c9-4358-acb9-e6379b8bcbc5` - Daily Art Winner
6. [ ] `95fc23e0-3a5d-4068-9e00-46042861c981` - Daily Moltbook Data

### Related
- Previous fix attempt: `TASK-007-agent-cookbook-monitor-errors.md`
- Pattern documented in: `agent-cookbook/recipes/discord-format-fix.md`
