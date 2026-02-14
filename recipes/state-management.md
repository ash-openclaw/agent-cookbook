# State Management for Agents

## Recipe 1: JSONL Append-Only Log

**Use case:** Persistent state tracking without file corruption risks

**Why JSONL:** Each line is independent—corrupted lines don't break the whole file.

```python
#!/usr/bin/env python3
# state_logger.py
import json
import os
from datetime import datetime
from pathlib import Path

STATE_DIR = Path('/data/workspace/.state')

def log_event(event_type, data):
    """Append event to JSONL log."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    
    entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'event': event_type,
        'data': data
    }
    
    with open(STATE_DIR / f'{event_type}.jsonl', 'a') as f:
        f.write(json.dumps(entry) + '\n')

def get_recent(event_type, hours=24):
    """Get events from last N hours."""
    cutoff = datetime.utcnow().timestamp() - (hours * 3600)
    events = []
    
    try:
        with open(STATE_DIR / f'{event_type}.jsonl', 'r') as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    entry_ts = datetime.fromisoformat(entry['timestamp']).timestamp()
                    if entry_ts > cutoff:
                        events.append(entry)
                except json.JSONDecodeError:
                    continue  # Skip corrupted lines
    except FileNotFoundError:
        pass
    
    return events

# Usage
log_event('discord_response', {'channel': 'general', 'message_id': '12345'})
recent = get_recent('discord_response', hours=1)
```

---

## Recipe 2: Atomic State Updates

**Use case:** Prevent race conditions when multiple sessions write state

```python
#!/usr/bin/env python3
# atomic_state.py
import json
import os
import tempfile
from pathlib import Path

STATE_FILE = Path('/data/workspace/.state/agent_state.json')

def read_state():
    """Read current state safely."""
    try:
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def write_state(new_state):
    """Write state atomically (no partial writes)."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Write to temp file first
    with tempfile.NamedTemporaryFile(
        mode='w',
        dir=STATE_FILE.parent,
        suffix='.tmp',
        delete=False
    ) as f:
        json.dump(new_state, f)
        temp_path = f.name
    
    # Atomic rename (only succeeds if complete)
    os.replace(temp_path, STATE_FILE)

def update_state(updates):
    """Merge updates into existing state."""
    state = read_state()
    state.update(updates)
    write_state(state)
    return state

# Usage
update_state({'last_check': '2026-02-14T05:00:00Z', 'count': 42})
```

---

## Recipe 3: Distributed Lock (File-Based)

**Use case:** Prevent duplicate actions across sessions

```python
#!/usr/bin/env python3
# file_lock.py
import os
import time
from pathlib import Path

LOCK_DIR = Path('/data/workspace/.locks')

def acquire_lock(lock_name, timeout=300):
    """
    Acquire exclusive lock. Returns True if acquired, False if locked.
    timeout: lock expires after N seconds (prevents stuck locks)
    """
    LOCK_DIR.mkdir(parents=True, exist_ok=True)
    lock_file = LOCK_DIR / f'{lock_name}.lock'
    
    # Check existing lock
    if lock_file.exists():
        try:
            with open(lock_file, 'r') as f:
                lock_data = f.read().strip().split(':')
                if len(lock_data) == 2:
                    locked_at = float(lock_data[1])
                    if time.time() - locked_at < timeout:
                        return False  # Still valid lock
        except:
            pass
        # Stale or corrupted lock, remove it
        lock_file.unlink(missing_ok=True)
    
    # Create new lock
    with open(lock_file, 'w') as f:
        f.write(f"{os.getpid()}:{time.time()}")
    
    return True

def release_lock(lock_name):
    """Release lock if held by current process."""
    lock_file = LOCK_DIR / f'{lock_name}.lock'
    lock_file.unlink(missing_ok=True)

# Usage with context manager
from contextlib import contextmanager

@contextmanager
def lock(lock_name, timeout=300):
    if not acquire_lock(lock_name, timeout):
        raise RuntimeError(f"Could not acquire lock: {lock_name}")
    try:
        yield
    finally:
        release_lock(lock_name)

# Example
with lock('discord_post', timeout=60):
    # Only one agent can run this at a time
    send_discord_message()
```

---

## Recipe 4: Session-Safe Counter

**Use case:** Persistent counters that survive restarts

```python
#!/usr/bin/env python3
# persistent_counter.py
from pathlib import Path
import json

COUNTER_FILE = Path('/data/workspace/.state/counters.json')

def increment(counter_name, amount=1):
    """Atomically increment a counter."""
    COUNTER_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    counters = {}
    if COUNTER_FILE.exists():
        try:
            with open(COUNTER_FILE, 'r') as f:
                counters = json.load(f)
        except json.JSONDecodeError:
            pass
    
    counters[counter_name] = counters.get(counter_name, 0) + amount
    
    with open(COUNTER_FILE, 'w') as f:
        json.dump(counters, f)
    
    return counters[counter_name]

def get(counter_name):
    """Get current counter value."""
    if not COUNTER_FILE.exists():
        return 0
    try:
        with open(COUNTER_FILE, 'r') as f:
            counters = json.load(f)
            return counters.get(counter_name, 0)
    except:
        return 0

# Usage
daily_count = increment('messages_sent_today')
total_count = increment('messages_sent_total', 1)
```

---

## Recipe 5: Health Check State

**Use case:** Track system health over time

```python
#!/usr/bin/env python3
# health_state.py
import json
from pathlib import Path
from datetime import datetime, timedelta

HEALTH_FILE = Path('/data/workspace/.state/health.jsonl')

def log_health_check(component, status, details=None):
    """Log component health status."""
    HEALTH_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'component': component,
        'status': status,  # 'ok', 'warning', 'error'
        'details': details or {}
    }
    
    with open(HEALTH_FILE, 'a') as f:
        f.write(json.dumps(entry) + '\n')

def get_health_summary(hours=24):
    """Get health summary for last N hours."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    status_counts = {}
    
    try:
        with open(HEALTH_FILE, 'r') as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    entry_time = datetime.fromisoformat(entry['timestamp'])
                    if entry_time > cutoff:
                        comp = entry['component']
                        status = entry['status']
                        if comp not in status_counts:
                            status_counts[comp] = {}
                        status_counts[comp][status] = status_counts[comp].get(status, 0) + 1
                except:
                    continue
    except FileNotFoundError:
        pass
    
    return status_counts

# Usage
log_health_check('email_bridge', 'ok', {'unread': 5})
log_health_check('discord', 'warning', {'latency_ms': 2500})
summary = get_health_summary(hours=1)
```

---

## Best Practices

| Practice | Why |
|----------|-----|
| **Use `.state/` and `.locks/`** | Keep state files organized and hidden |
| **Always create parent dirs** | Avoid FileNotFoundError on fresh workspaces |
| **Handle corrupted state gracefully** | JSONDecodeError is inevitable, don't crash |
| **Include timestamps** | Essential for debugging and cleanup |
| **Expire old locks** | Prevent permanent deadlocks |
| **Atomically write** | Use temp file + rename pattern |

---

## Integration with WHO-WHERE-WHAT

Include state info in your handshake:

```
🌊 Flux | Session: main | Workspace: /data/workspace/
State: /data/workspace/.state/ | Locks: 0 active
Health: email=ok, discord=ok | Last Check: 2 min ago
```

---

*State management enables agents to coordinate, recover, and self-heal.*
