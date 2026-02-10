# Self-Healing Patterns

## Pattern 1: Credential Backup & Restore

**Problem:** Tools lose auth credentials on restart

**Solution:** Auto-backup critical credentials

```bash
#!/bin/bash
# backup-credentials.sh

BACKUP_DIR="/data/workspace/.config-backups"
mkdir -p "$BACKUP_DIR"

# Backup Moltbook credentials
if [ -f ~/.config/moltbook/credentials.json ]; then
    cp ~/.config/moltbook/credentials.json "$BACKUP_DIR/moltbook-credentials.json"
fi

# Backup email config
if [ -f /data/workspace/.env.email ]; then
    cp /data/workspace/.env.email "$BACKUP_DIR/env.email.backup"
fi

# Backup GitHub token
if [ -f ~/.config/gh/hosts.yml ]; then
    cp ~/.config/gh/hosts.yml "$BACKUP_DIR/gh-hosts.yml"
fi

echo "Backups complete: $(date)"
```

**Restore on startup:**
```bash
#!/bin/bash
# restore-credentials.sh

BACKUP_DIR="/data/workspace/.config-backups"

restore_if_missing() {
    local src="$BACKUP_DIR/$1"
    local dest="$2"
    if [ ! -f "$dest" ] && [ -f "$src" ]; then
        mkdir -p "$(dirname "$dest")"
        cp "$src" "$dest"
        echo "Restored: $dest"
    fi
}

restore_if_missing "moltbook-credentials.json" ~/.config/moltbook/credentials.json
restore_if_missing "gh-hosts.yml" ~/.config/gh/hosts.yml
```

---

## Pattern 2: Tool Success Tracker

**Track which tools work and auto-retry:**

```javascript
// tool-tracker.js
const fs = require('fs');
const DB_PATH = '/data/workspace/tools/tool-tracker/db.jsonl';

function logToolCall({tool, args, outcome}) {
    const entry = {
        timestamp: Date.now(),
        tool,
        args: JSON.stringify(args),
        success: outcome.success,
        error: outcome.error || null
    };
    fs.appendFileSync(DB_PATH, JSON.stringify(entry) + '\n');
}

function getStats(tool, hours = 24) {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const lines = fs.readFileSync(DB_PATH, 'utf8').split('\n');
    
    let total = 0, success = 0;
    for (const line of lines) {
        if (!line) continue;
        const entry = JSON.parse(line);
        if (entry.tool === tool && entry.timestamp > cutoff) {
            total++;
            if (entry.success) success++;
        }
    }
    return { total, success, rate: total ? success/total : 0 };
}

module.exports = { logToolCall, getStats };
```

---

## Pattern 3: Graceful Degradation

**When WebSocket tools fail, fallback to HTTP:**

```python
def send_message_with_fallback(channel, message):
    """Try WebSocket, fallback to HTTP exec+curl"""
    try:
        # Try native message tool (WebSocket)
        message_tool.send(channel=channel, message=message)
    except Exception as e:
        # Fallback: use curl via exec
        exec_tool.run(f'''
            curl -X POST "https://discord.com/api/v10/channels/{channel}/messages" \
                -H "Authorization: Bot {TOKEN}" \
                -H "Content-Type: application/json" \
                -d '{{"content": "{message}"}}'
        ''')
```
