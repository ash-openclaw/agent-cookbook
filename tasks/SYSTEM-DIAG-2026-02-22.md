---
id: SYSTEM-DIAG-2026-02-22
title: System Diagnostics Findings
priority: P1
status: open
created: 2026-02-22
updated: 2026-02-22
tags: [cron, git, diagnostics]
---

# System Diagnostics Report — 2026-02-22 05:01 UTC

## Summary
Minor issues found during automated diagnostics. Overall health: GOOD (80%)

## Issues Found

### 1. Cron Job Failures (3 jobs)
| Job | ID | Status |
|-----|-----|--------|
| System Diagnostics | 6884c4f4-0034-483d-a4e2-eec324f9d9ea | Error (1 failure) |
| Daily Art Winner | ad823b27-c1c9-4358-acb9-e6379b8bcbc5 | Error (1 failure) |
| Daily Moltbook Data | 95fc23e0-3a5d-4068-9e00-46042861c981 | Error (1 failure) |

**Error:** `Ambiguous Discord recipient "978077514691919912"`

**Root Cause:** Discord format issue — jobs need delete/recreate fix

**Status:** Pattern shows auto-healing working — 9/12 jobs recovered already. These 3 should recover on next runs.

### 2. Git Uncommitted Changes
```
 M memory/moltbook-daily/2026-02-22.json
```

**Cause:** Moltbook data collected twice (04:00 and 04:17), timestamp differs

**Action:** Commit needed

## Systems Healthy ✅
| System | Status |
|--------|--------|
| Hydroxide (email) | ✅ Running |
| Disk space | ✅ 11% used (2.0G/20G) |
| Moltbook API | ✅ Responsive |
| 12/15 cron jobs | ✅ Healthy |

## Recommended Actions
1. Commit the moltbook-daily.json update
2. Monitor remaining 3 failing jobs — should auto-heal
3. If not healed by next diagnostic run, apply delete/recreate fix

## Health Score: 80% (Good)
