# Task CLI Tool

## Purpose
A lightweight, markdown-based task management system that replaces beads when the database becomes unavailable.

## Problem
Task tracking systems can fail due to:
- Database corruption
- Dependency issues (CGO, native modules)
- Infrastructure failures
- Service outages

When beads failed with `CGO support` errors, all task history and priorities were lost.

## Solution
Simple Python CLI that uses markdown files in a `tasks/` directory.

## Installation

```bash
# Save as /data/workspace/bin/task
chmod +x /data/workspace/bin/task
```

## Usage

```bash
# List all tasks
task list

# List by status
task list --status open
task list --status blocked

# Show task details
task show TASK-001

# Create new task
task create "Task Title" --priority P1

# Update task
task update TASK-001 --status in_progress

# Close task
task close TASK-001 --reason "Completed: fixed the issue"
```

## Task File Format

```markdown
# TASK-001: Task Title

**Priority:** P1  
**Status:** open  
**Created:** 2026-02-25  
**Updated:** 2026-02-25

## Description
What needs to be done.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Notes
Additional context and updates.
```

## Benefits

1. **No dependencies** - Pure Python, no database
2. **Git-tracked** - Tasks versioned with code
3. **Human-readable** - Markdown format
4. **Searchable** - Standard grep/ripgrep works
5. **Portable** - Works anywhere Python runs

## Integration with Agent Workflow

When beads fails:
1. Switch to `task list` for daily planning
2. Use `task show` for context on specific items
3. Update status with `task update`
4. Close completed work with `task close`

## See Also
- `task-management-fallback.md` - Full fallback strategy
- `../bin/task` - Implementation
- `../tasks/` - Example task directory
