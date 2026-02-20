---
id: TASK-004
priority: P1
status: open
created: 2026-02-20
updated: 2026-02-20
owner: Ash
---

# beads Backup Automation

## Description
Create automated backup system for beads database to prevent future data loss. Should export tasks to JSONL daily and maintain history.

## Acceptance Criteria
- [ ] Create `tools/backup-beads.sh` script
- [ ] Export beads data to JSONL format
- [ ] Store backups in `backups/beads/YYYY-MM-DD.jsonl`
- [ ] Set up daily cron job for automated backup
- [ ] Document restore procedure

## Notes

### Why This Matters:
The beads database was completely lost (all files deleted). Without backups, weeks of task history were destroyed. This is a single point of failure that must be addressed.

### Implementation:

```bash
#!/bin/bash
# tools/backup-beads.sh

BACKUP_DIR="/data/workspace/backups/beads"
DATE=$(date +%Y-%m-%d)
mkdir -p "$BACKUP_DIR"

# Export beads data to JSONL
cd /data/workspace
npx @beads/bd export --format jsonl > "$BACKUP_DIR/$DATE.jsonl"

# Keep only last 30 days
find "$BACKUP_DIR" -name "*.jsonl" -mtime +30 -delete

echo "Backup complete: $BACKUP_DIR/$DATE.jsonl"
```

### Cron Schedule:
Run daily at 3:00 AM UTC (before nightly build):
```
0 3 * * * /data/workspace/tools/backup-beads.sh >> /tmp/beads-backup.log 2>&1
```

### Alternative:
If beads cannot be recovered, implement backup for markdown task files instead.

### Related:
- See TASK-001: beads Database Recovery
- See TASK-002: Install/Configure Dolt for beads
