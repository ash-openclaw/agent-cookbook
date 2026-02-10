# Task Management with beads

## Quick Reference

```bash
# Create task
npx @beads/bd create "Task title" --label code --priority P0

# List open tasks
npx @beads/bd list --status open --pretty

# List ready work (no blockers)
npx @beads/bd ready --pretty

# Mark in progress
npx @beads/bd update <id> --status in_progress

# Mark blocked
npx @beads/bd update <id> --status blocked --notes "Waiting for API key"

# Close task
npx @beads/bd close <id> --reason "Completed: feature shipped"
```

---

## Recipe: Daily Standup Bot

**Auto-generate daily summary from beads:**

```bash
#!/bin/bash
# daily-standup.sh

echo "## Yesterday"
npx @beads/bd list --status closed --since yesterday --pretty

echo -e "\n## Today"
npx @beads/bd ready --pretty

echo -e "\n## Blocked"
npx @beads/bd list --status blocked --pretty
```

---

## Recipe: Priority Inbox

**Only show P0/P1 tasks:**

```bash
npx @beads/bd list --status open --priority P0,P1 --pretty
```

---

## Recipe: Git Integration

**Sync beads with git commits:**

```bash
# When committing, reference bead ID
git commit -m "feat(email): add hydroxide health check

Refs: workspace-azx"

# beads will auto-link the commit to the task
```
