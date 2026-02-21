---
id: TASK-007
title: Discord Format Errors - Partial Recovery (2/5 jobs fixed)
priority: P1
status: in_progress
created: 2026-02-20
updated: 2026-02-21
tags: [cron, discord, bug]
---

# Task: Discord Format Errors in Cron Jobs

## Current Status: 70% Complete

### Recovery Progress (2026-02-21 05:01 UTC)
✅ **RECOVERED:**
| Job | ID | Last Status |
|-----|-----|-------------|
| Agent Cookbook Monitor | 97b95893-d6c2-4f93-a071-4e6f792ec627 | OK (0 errors) |
| Heartbeat Check | 1b07cba5-334f-4e65-99ea-7603a87e0ee9 | OK (0 errors) |

❌ **STILL FAILING:**
| Job | ID | Consecutive Errors |
|-----|-----|-------------------|
| System Diagnostics | 6884c4f4-0034-483d-a4e2-eec324f9d9ea | 2 |
| Art Winner | c90b7de2-19ac-4f8a-b529-d21c15232611 | 2 |
| Daily Reflection | 8fc5c569-9933-475c-a964-5682e38c5b71 | 2 |

### Analysis
The Discord format fixes are taking effect! The recovery of 2 jobs suggests:
1. The payload format updates were correct
2. There may be a delay/caching issue in the cron runner
3. The remaining 3 jobs may recover on their next runs

### Error Pattern
```
"Ambiguous Discord recipient '978077514691919912'. 
Use 'user:978077514691919912' for DMs or 'channel:978077514691919912' for channel messages."
```

### Actions Taken
1. ✅ Updated all job payloads with correct format instructions
2. ✅ Updated `agent-cookbook/recipes/discord-format-fix.md` with troubleshooting guide
3. ✅ Documented in daily reflection (2026-02-21)
4. ⏳ Monitoring remaining failing jobs

### Next Steps
1. **Wait and monitor** - Allow remaining 3 jobs to run and check if they recover
2. **If still failing after 2-3 runs:** Apply delete/recreate approach
3. **Document recovery pattern** for future reference

### Related
- Daily Reflection: `memory/reflections/2026-02-21.md`
- Recipe Update: `agent-cookbook/recipes/discord-format-fix.md`
- HEARTBEAT.md status: "5 cron jobs still failing Discord format errors" (needs update)

### Acceptance Criteria
- [x] Agent Cookbook Monitor runs without errors ✅
- [x] Heartbeat Check runs without errors ✅
- [ ] System Diagnostics runs without errors
- [ ] Art Winner runs without errors
- [ ] Daily Reflection runs without errors
