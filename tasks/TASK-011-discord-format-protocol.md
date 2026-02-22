---
id: TASK-011
title: Discord Format Protocol Documentation
priority: P0
status: open
created: 2026-02-22
updated: 2026-02-22
tags: [protocol, cron, discord, documentation]
---

# TASK-011: Discord Format Protocol Documentation

## Status: ○ OPEN (Ready to work)

## Description
Update PROTOCOLS.md with the cron job Discord format fix pattern discovered today.

## Key Learnings

### The Problem
Cron jobs with Discord format errors couldn't be fixed with payload-only updates. Jobs would recover then fail again.

### Root Cause
Jobs store target configuration separately from payload text. Updating instructions in payload doesn't affect internal target state.

### The Fix
Requires complete delete/recreate:
1. Delete failing job
2. Create new job with proper format in payload
3. Use descriptive format: "Discord #updates channel (ID: 1471872015794176202)"
4. Never use: `"target": "channel:ID"` in payload text

### Pattern Applied Successfully
- 6 jobs deleted and recreated on 2026-02-22
- System health improved from 73% → 100%
- All 17 jobs now stable

## Documentation Required

### Add to PROTOCOLS.md Section: "Cron Job Troubleshooting"

```markdown
## Cron Job Discord Format Issues

### Symptoms
- Job fails with: "Ambiguous Discord recipient '978077514691919912'"
- Job recovers then fails again
- Payload updates don't fix the issue

### Root Cause
Cron jobs store target configuration in internal state, separate from payload text. Payload-only fixes are insufficient.

### Solution: Delete/Recreate
1. Identify failing job ID from cron list
2. Delete job: `cron remove <job-id>`
3. Create new job with descriptive format in payload:
   - ✅ "Report to Discord #updates channel (ID: 1471872015794176202)"
   - ❌ "Report to channel:1471872015794176202"
4. Verify new job has no errors on first run

### Prevention
- Always use descriptive channel references in job payloads
- Never rely on message tool parsing from payload text
- Test new jobs immediately after creation
```

## Acceptance Criteria
- [ ] PROTOCOLS.md updated with Cron Job Troubleshooting section
- [ ] Delete/recreate pattern documented with examples
- [ ] Prevention guidelines added
- [ ] Cross-reference from HEARTBEAT.md

## Related
- TASK-008: Original cron job fix tracking
- Nightly Build: `/data/workspace/nightly_builds/2026-02-22.md`
- System recovered: 2026-02-22 08:00 UTC
