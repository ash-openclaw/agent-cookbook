---
id: TASK-007
title: Agent Cookbook Monitor - Discord format errors persist despite fix
priority: P1
status: blocked
created: 2026-02-20
tags: [cron, discord, bug]
---

# Task: Agent Cookbook Monitor Persistent Discord Errors

## Problem
Agent Cookbook Monitor shows Discord format errors even though the payload was updated to use the correct format.

## Evidence
- Job ID: `97b95893-d6c2-4f93-a071-4e6f792ec627`
- Last updated: `1771609195891` (payload shows correct format)
- Recent errors at: `1771607387964` and `1771609195895`
- Error: `"Ambiguous Discord recipient "978077514691919912"`
- Consecutive errors: 2

## Payload Content
```json
{
  "text": "AGENT_COOKBOOK_CHECK: Check GitHub repo for new issues/PRs. Only report to Discord channel:1471872015794176202 (#updates) if new activity found. No report if no changes. Use message tool with target=\"channel:1471872015794176202\" format."
}
```

## Possible Causes
1. Some other parameter/path still uses bare ID format
2. Job state caching issue
3. The update didn't fully persist
4. Different cron parameter causing the issue

## Next Steps
- Manually inspect full job configuration
- Delete and recreate job with correct format
- Check if there are other cron parameters causing the error

## Related Jobs with Similar Issues
- System Diagnostics (`6884c4f4-...`) - 1 error
- Art Winner (`c90b7de2-...`) - 1 error (old)
