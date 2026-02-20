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
The beads database files were completely deleted:
- `.beads/issues.jsonl` — deleted
- `.beads/metadata.json` — deleted
- `.beads/daemon.lock` — deleted
- `.beads/last-touched` — deleted

All task tracking history has been lost. The database cannot be reinitialized because Dolt requires CGO support which is not available in this container.

## Acceptance Criteria
- [ ] Recover or recreate beads database
- [ ] Restore task history from git if possible
- [ ] Implement alternative task tracking if beads cannot be recovered
- [ ] Document recovery process for future reference

## Notes

### Error on init:
```
npx @beads/bd init
Error: failed to create dolt database: dolt: this binary was built without CGO support
```

### Options:
1. Install CGO-enabled Dolt binary
2. Configure beads to use SQLite backend instead of Dolt
3. Use JSONL-only mode (`bd --no-db`)
4. Switch to markdown-based task tracking (temporary fallback)

### Related:
- See TASK-002: Install/Configure Dolt for beads
- See TASK-004: beads Backup Automation (prevent future loss)
