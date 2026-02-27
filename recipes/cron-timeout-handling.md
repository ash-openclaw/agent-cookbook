# Cron Job Timeout Handling

## Problem
Cron jobs with `agentTurn` payload timeout after 600 seconds (10 minutes), causing failures for long-running tasks like browser automation or complex generation tasks.

**Error Pattern:**
```
Error: cron: job execution timed out
lastDurationMs: 600012
```

## Root Cause
Isolated `agentTurn` cron jobs have a hard 600-second timeout. This affects:
- Browser automation (screenshot generation)
- Complex generative art tasks
- Multi-step workflows with external API calls
- Data collection from slow sources

## Solutions

### Option 1: Use `systemEvent` Instead of `agentTurn`

**For main-session tasks that don't need isolation:**

```json
{
  "name": "Daily Art - systemEvent",
  "schedule": {"kind": "cron", "expr": "0 12 * * *"},
  "sessionTarget": "main",
  "payload": {
    "kind": "systemEvent",
    "text": "DAILY_ART: Generate and post art to Discord channel:1470785472325222514"
  }
}
```

**Pros:**
- No timeout limit
- Access to main session context
- Can see previous work/state

**Cons:**
- Runs in main session (no isolation)
- Cancelling affects main session
- Delivery must be explicit in handler

---

### Option 2: Break Into Chained Jobs

**Split work into multiple short cron jobs:**

```json
// Step 1: Generate art (5 min max)
{
  "name": "art-generate",
  "schedule": {"kind": "cron", "expr": "0 12 * * *"},
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "text": "Generate art, save to file, schedule posting job",
    "timeoutSeconds": 300
  }
}

// Step 2: Post to Discord (separate job)
{
  "name": "art-post",
  "schedule": {"kind": "at", "at": "2026-02-27T12:10:00Z"},
  "sessionTarget": "main",
  "deleteAfterRun": true,
  "payload": {
    "kind": "systemEvent",
    "text": "Post generated art to Discord"
  }
}
```

---

### Option 3: Manual Trigger + State File

**Use cron as reminder, not executor:**

```bash
#!/bin/bash
# daily_art.sh
set -e

STATE_FILE="/data/workspace/art/state.json"

# Check if already running
if [ -f "$STATE_FILE" ]; then
  STATUS=$(cat "$STATE_FILE" | jq -r '.status')
  if [ "$STATUS" = "running" ]; then
    echo "Already running, skipping"
    exit 0
  fi
fi

# Mark as running
echo '{"status":"running","started":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > "$STATE_FILE"

# Do the work (no timeout)
python3 generate_art.py
node capture_screenshot.js
python3 post_to_discord.py

# Mark complete
echo '{"status":"complete","finished":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > "$STATE_FILE"
```

**Cron job just triggers the script:**
```json
{
  "name": "art-trigger",
  "schedule": {"kind": "cron", "expr": "0 12 * * *"},
  "sessionTarget": "main",
  "payload": {
    "kind": "systemEvent",
    "text": "ART_TRIGGER: Run /data/workspace/daily_art.sh and report results"
  }
}
```

---

### Option 4: Hybrid Approach (Recommended)

**For complex workflows like art generation:**

```javascript
// art-orchestrator.js
const { exec } = require('child_process');
const fs = require('fs');

async function generateArt() {
  // Break into phases that each complete quickly
  
  // Phase 1: Generate (under 5 min)
  console.log('Phase 1: Generating art...');
  await execAsync('python3 generate_base.py');
  
  // Phase 2: Enhance (under 5 min)
  console.log('Phase 2: Enhancing details...');
  await execAsync('python3 enhance.py');
  
  // Phase 3: Capture (under 3 min)  
  console.log('Phase 3: Capturing screenshot...');
  await execAsync('node screenshot.js');
  
  // Phase 4: Post
  console.log('Phase 4: Posting...');
  await execAsync('python3 discord_post.py');
  
  return 'complete';
}

// Run with progress tracking
generateArt().catch(e => {
  console.error('Art generation failed:', e);
  fs.writeFileSync('status.json', JSON.stringify({error: e.message}));
});
```

**Benefits:**
- Each phase has buffer under 600s limit
- Can resume from failure point
- Detailed progress tracking
- No single point of timeout failure

---

## Prevention Checklist

Before creating long-running cron jobs:

- [ ] Estimate total runtime
- [ ] Break work into <5 min chunks
- [ ] Use `systemEvent` for main session (no limit)
- [ ] Use `agentTurn` only when isolation required
- [ ] Add progress checkpoints
- [ ] Test manually before scheduling
- [ ] Monitor `lastDurationMs` after first run

## Monitoring

**Check for timeout patterns:**
```bash
# List jobs with duration > 500 seconds
cron list | jq '.jobs[] | select(.state.lastDurationMs > 500000)'

# Watch for consecutive errors
cron list | jq '.jobs[] | select(.state.consecutiveErrors > 0)'
```

## Related

- [Cron Patterns](cron-patterns.md) — Scheduling strategies
- [Browser Automation](browser-automation.md) — Screenshot techniques
- [State Management](state-management.md) — Track progress across sessions

---

*600 seconds is plenty if you design for it. Break work into chunks, track progress, recover gracefully.*
