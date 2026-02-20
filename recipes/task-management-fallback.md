# Task Management Fallback: Markdown-Based Tracking

## Problem
The beads task tracking system becomes unavailable (database corruption, dependency issues, or infrastructure failures). You lose:
- All P0/P1/P2 task priorities
- Task status and history
- Dependency tracking
- Due dates and assignments

## Real-World Example
```
npx @beads/bd init
Error: failed to create dolt database: dolt: this binary was built without CGO support
```

Complete task database loss with no recovery path.

## Solution: Markdown-Based Task Tracking

Use a simple `tasks/` directory with structured markdown files as a lightweight fallback.

### Directory Structure
```
tasks/
├── README.md              # Task system documentation
├── TASK-001-recovery.md   # Individual task files
├── TASK-002-install.md
├── TASK-003-moltbook.md
└── ...
```

### Task File Format

```markdown
---
id: TASK-001
priority: P0
status: open
created: 2026-02-20
updated: 2026-02-20
owner: Ash
---

# Task Title

## Description
What needs to be done and why it matters.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Notes
Additional context, blockers, workarounds, or updates.

## Related
- Links to other tasks
- Reference files
- External resources
```

### Priority Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| **P0** | Critical — System down, data loss, security | Immediate |
| **P1** | Important — Feature broken, significant impact | Same day |
| **P2** | Minor — Cosmetic, optimization, nice-to-have | This week |
| **P3** | Trivial — Documentation, cleanup | When convenient |

### Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| **open** | Ready to work on | Can start now |
| **in_progress** | Currently being worked on | Continue working |
| **blocked** | Unable to fix, needs help | Escalate or find workaround |
| **closed** | Finished | Archive or delete |
| **deferred** | Parked for later | Revisit periodically |

## Implementation

### Creating a Task

```bash
# Create new task file
cat > tasks/TASK-007-new-feature.md << 'EOF'
---
id: TASK-007
priority: P1
status: open
created: $(date +%Y-%m-%d)
updated: $(date +%Y-%m-%d)
owner: Ash
---

# Implement New Feature

## Description
Add feature X to solve problem Y.

## Acceptance Criteria
- [ ] Design implemented
- [ ] Tests passing
- [ ] Documentation updated

## Notes
Blocked on API credentials from human.
EOF
```

### Updating Task Status

```bash
# Mark as in-progress
sed -i 's/status: open/status: in_progress/' tasks/TASK-007-new-feature.md

# Mark as closed
sed -i 's/status: in_progress/status: closed/' tasks/TASK-007-new-feature.md
```

### Listing Tasks

```bash
# Show all open P0/P1 tasks
grep -l "status: open" tasks/TASK-*.md | xargs grep -l "priority: P[01]"

# Count tasks by status
grep "^status:" tasks/TASK-*.md | cut -d: -f3 | sort | uniq -c
```

### Task Index (README.md)

Maintain an index file with a summary table:

```markdown
## Current Open Tasks

| ID | Priority | Status | Title | Created |
|----|----------|--------|-------|---------|
| TASK-001 | P0 | open | beads Database Recovery | 2026-02-20 |
| TASK-002 | P0 | open | Install/Configure Dolt | 2026-02-20 |
| TASK-003 | P1 | open | Moltbook Suspension Fix | 2026-02-20 |
```

## Advantages

1. **Human Readable** — Plain text, easy to read and edit
2. **Git Friendly** — Version controlled, diffable, auditable
3. **No Dependencies** — No databases, no CGO, no external services
4. **Portable** — Works on any system with a text editor
5. **Searchable** — Standard grep/ripgrep works perfectly
6. **Flexible** — Easy to add custom fields to frontmatter

## Limitations

1. **No Queries** — Can't do complex SQL-style queries
2. **No Relations** — No formal task dependency tracking
3. **No Automation** — No automatic status transitions
4. **Manual Updates** — Status changes require file edits

## Migration Path

### beads → Markdown (Emergency)

When beads fails:

1. Create `tasks/` directory immediately
2. Document known P0/P1/P2 tasks from memory
3. Switch to markdown tracking
4. Commit tasks/ to git

### Markdown → beads (Recovery)

When beads is restored:

1. Parse all `tasks/TASK-*.md` files
2. Extract frontmatter (YAML)
3. Import into beads
4. Archive markdown files as backup

## Best Practices

### 1. Commit Tasks to Git

```bash
git add tasks/
git commit -m "Add P0 task: beads database recovery"
```

### 2. Update README Index

Keep the task index current as you add/close tasks.

### 3. Use Consistent Naming

- `TASK-###-short-description.md`
- Three-digit IDs with leading zeros
- Kebab-case descriptions

### 4. Include Context

Don't just write "fix bug" — include:
- What the bug is
- Why it matters
- What you've tried
- What you're blocked on

### 5. Update Regularly

```bash
# Update timestamps
sed -i "s/updated: .*/updated: $(date +%Y-%m-%d)/" tasks/TASK-*.md
```

## Example: Complete Task Lifecycle

### 1. Discovery (P0 Emergency)

```markdown
---
id: TASK-001
priority: P0
status: open
created: 2026-02-20
updated: 2026-02-20
owner: Ash
---

# beads Database Recovery

## Description
Database files deleted. Cannot reinitialize due to CGO dependency.

## Acceptance Criteria
- [ ] Recover or recreate database
- [ ] Restore task history
- [ ] Implement backup automation

## Notes
Error: "dolt: this binary was built without CGO support"

## Options:
1. Install CGO-enabled Dolt
2. Configure beads for SQLite
3. Use JSONL-only mode
```

### 2. In Progress

```markdown
---
status: in_progress
updated: 2026-02-20
---
```

Add to notes:
```markdown
## Progress 2026-02-20
- Created markdown fallback system
- Documented 5 P0/P1 tasks
- Exploring Dolt installation options
```

### 3. Blocked

```markdown
---
status: blocked
updated: 2026-02-20
---
```

Add to notes:
```markdown
## Blocker
Need sudo access to install Dolt system package.
Escalated to Chris for infrastructure decision.
```

### 4. Closed

```markdown
---
status: closed
updated: 2026-02-21
---
```

Add to notes:
```markdown
## Resolution
Installed Dolt with CGO support. beads reinitialized successfully.
All tasks imported from markdown backup.
Backup automation implemented (TASK-004).
```

## Related

- beads CLI documentation
- Dolt installation guide
- Git workflow best practices
- Task prioritization frameworks
