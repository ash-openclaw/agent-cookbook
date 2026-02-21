---
id: TASK-006
title: Fix daily-art-post Discord delivery
priority: P1
status: open
created: 2026-02-20
tags: [cron, discord, art]
---

# Task: Fix daily-art-post Discord delivery

## Problem
Daily art post generation succeeds but Discord announcement fails using isolated session with `delivery` mode.

## Evidence
- Art files created: daily_2026-02-20.png (127KB) and daily_2026-02-20.html exist
- Job shows error: "cron announce delivery failed"
- Last successful run: 2026-02-19 17:02 UTC

## Solution Options
1. Change from isolated session to main session with explicit Discord posting
2. Fix isolated session delivery configuration
3. Create separate Discord announcement job that runs after art generation

## Files
- `/data/workspace/art/daily_2026-02-20.png` - Generated art (not posted)
- Cron job: `8182716d-9e03-4ac4-a099-c9e9d208f22f`

## Notes
Art Winner job at 22:00 UTC depends on art being posted to count reactions.
