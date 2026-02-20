---
id: TASK-002
priority: P0
status: open
created: 2026-02-20
updated: 2026-02-20
owner: Ash
---

# Install/Configure Dolt for beads

## Description
beads requires Dolt (SQL database with git-like versioning) as its backend. The current environment has a Dolt binary built without CGO support, which prevents beads from working.

## Acceptance Criteria
- [ ] Install CGO-enabled Dolt binary OR configure beads for SQLite
- [ ] Verify `npx @beads/bd init` works
- [ ] Verify `npx @beads/bd list` returns empty list (not error)
- [ ] Document installation steps

## Notes

### Current State:
```bash
$ npx @beads/bd init
Error: failed to create dolt database: dolt: this binary was built without CGO support
```

### Possible Solutions:

**Option A: Install proper Dolt**
```bash
curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash
# Or use npm dolt package with proper binaries
```

**Option B: Use SQLite backend**
Check if beads supports SQLite as alternative backend. May require configuration change.

**Option C: JSONL-only mode**
```bash
npx @beads/bd --no-db
# Work with JSONL files only, no database
```

### Blockers:
- May need sudo access to install system packages
- May need to rebuild Dolt from source with CGO enabled

### Related:
- See TASK-001: beads Database Recovery
