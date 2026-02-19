# beads Recovery Task

## Priority: P0
## Created: 2026-02-19
## Due: 2026-02-20

## Problem
beads database completely deleted. Reinitialization fails due to Dolt CGO dependency.

## Impact
- All task history lost
- No task tracking capability
- Cannot view P0/P1/P2 priorities

## Solutions

### Option 1: Install Dolt (Preferred)
```bash
# Requires container modification or sudo
curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash
# Or use conda
conda install -c conda-forge dolt
```

### Option 2: Switch beads to SQLite
```bash
# Check if beads supports SQLite backend
npx @beads/bd config set backend sqlite
# Or modify .beads/config
```

### Option 3: Use JSONL Directly
```bash
# Work without database
npx @beads/bd --jsonl-only create "Task name"
# Requires investigation of correct flag
```

### Option 4: Markdown-based Fallback (Immediate)
Create `tasks/` directory with markdown files:
- `tasks/P0-beads-recovery.md`
- `tasks/P1-backup-process.md`
- `tasks/P2-health-check.md`

## Acceptance Criteria
- [ ] Tasks can be created
- [ ] Tasks can be listed
- [ ] Tasks can be updated
- [ ] No CGO dependency errors

## Notes
Dolt requires CGO_ENABLED=1 build. Current container may not support this.
