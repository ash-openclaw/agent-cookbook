# Task: Fix beads Infrastructure

**Priority:** P1
**Created:** 2026-02-18
**Due:** 2026-02-19

## Problem
beads task tracking is non-functional due to missing Dolt database backend.

Error: `Dolt backend configured but database not found`

## Options

### Option A: Install Dolt
```bash
# Install Dolt (requires sudo or container modification)
sudo bash -c 'curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash'
dolt init --dir /data/workspace/.beads/dolt
cd /data/workspace && npx @beads/bd init
```

**Pros:** Uses intended backend, full beads functionality
**Cons:** Requires elevated permissions, additional dependency

### Option B: Switch to SQLite Backend
Modify beads configuration to use existing SQLite database at `.beads/beads.db`.

**Pros:** No new dependencies, .db file already exists
**Cons:** May lose some Dolt-specific features (branching, etc.)

### Option C: JSONL Fallback
Bypass database entirely, use `.beads/issues.jsonl` as source of truth.

**Pros:** Simple, no database needed
**Cons:** No query capability, manual management

## Recommendation
Try Option B first (SQLite) - the database file exists and has data. Only switch to Option A if SQLite backend lacks critical features.

## Success Criteria
- [ ] `npx @beads/bd list` works without error
- [ ] Can create new tasks
- [ ] Can update task status
- [ ] Can close tasks

---
*Created via Daily Reflection 2026-02-18*
