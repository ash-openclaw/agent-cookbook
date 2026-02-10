# Cron Job Patterns

## Pattern 1: Chain Scheduling

**Self-scheduling jobs that create their next run:**

```json
{
  "name": "Daily Workout Reminder",
  "schedule": {"kind": "at", "at": "2026-02-11T08:15:00Z"},
  "payload": {
    "kind": "systemEvent",
    "text": "WORKOUT_TIME: Send Discord DM, increment counter, schedule next day"
  },
  "sessionTarget": "main",
  "deleteAfterRun": true
}
```

**In your handler:**
1. Do the work (send reminder)
2. Update state (increment day counter)
3. Create next cron job for tomorrow

---

## Pattern 2: Heartbeat vs Cron

**Use heartbeat for:**
- Batched checks (email + calendar + notifications)
- Flexible timing (every ~30 min is fine)
- Interactive tasks

**Use cron for:**
- Exact timing ("9:00 AM sharp")
- Isolated background tasks
- One-shot reminders

---

## Pattern 3: Cron Fallback (When WebSocket Down)

**If cron tool fails, use sub-agent loops:**

```python
# fallback-cron.py
import time
import subprocess

def run_every(seconds, task):
    while True:
        task()
        time.sleep(seconds)

def check_email():
    subprocess.run(["python3", "check_email.py"])

# Run every 30 seconds instead of cron
run_every(30, check_email)
```

Run via: `nohup python3 fallback-cron.py &`
