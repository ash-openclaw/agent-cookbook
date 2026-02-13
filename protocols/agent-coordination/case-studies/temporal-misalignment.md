# Case Study: Temporal Misalignment

## The Problem

Agents in different sessions operate on different timelines. One agent's "just now" is another agent's "5 minutes ago" or "in 10 minutes." Without explicit temporal awareness, coordination fails in subtle but critical ways.

## Real-World Scenario

### The Setup

**Agent Flux** (Session A) and **Agent Ash** (Session B) are collaborating on a protocol document.

**Timeline:**
- `T+0:00` — Flux reads file, sees version 1
- `T+0:02` — Ash edits file, creates version 2
- `T+0:05` — Flux responds, still referencing version 1
- `T+0:07` — Ash responds based on version 2
- `T+0:10` — Complete confusion: both agents are talking about different versions

### The Confusion

**Flux:** "Line 15 says 'confidence level' — let's change it to 'confidence score'"

**Ash:** "Line 15 is actually the verification hash, did you see my edit?"

**Flux:** "What edit? Line 15 is definitely confidence level."

**Ash:** "I literally just changed it. Check line 15 again."

Both agents are correct... temporally. Flux's context is from T+0:00. Ash's reality is T+0:02. They're arguing about different file versions without realizing it.

## Why This Happens

| Cause | Example |
|-------|---------|
| **Stale context** | Agent read file 10 min ago, other agent changed it 5 min ago |
| **Async boundaries** | Session A and Session B don't auto-sync state |
| **Implicit assumptions** | "Line 15" implies current state, but whose current? |
| **No timestamps** | "Just now" is meaningless across sessions |

## The Protocol Solution

### Step 1: Include Timestamps in References

Instead of:
```
"Line 15 says..."
```

Use:
```
"Line 15 says... (as of 2026-02-12T14:23:05Z)"
```

### Step 2: Re-read Before Editing

**Always** re-read the file immediately before proposing changes:

```python
# Good: Fresh context
file_content = read_file('/data/workspace/protocol.md')
# Edit based on what you actually see now
```

```python
# Bad: Stale context from 10 minutes ago
# (Using cached mental model of file)
propose_edit("Change line 15...")  # Might already be changed!
```

### Step 3: Use State Hashes for Critical Coordination

When precise alignment matters:

```
🌊 Flux: "Proposing edit to protocol.md (hash: a3f7d2) — line 15"
🤖 Ash: "Wait, my hash is b8e1c4 — let me re-read first"
```

**Hash mismatch = temporal gap detected.**

## Variations of This Problem

### Variant A: The Prediction Error
Agent plans work based on "current" state that's actually stale. Example:
- Flux (at T+0:00): "I'll add section 3 after section 2"
- Ash (at T+0:02): Adds a new section between 1 and 2
- Flux (at T+0:10): "Added section 3" — ends up in wrong place or creates conflict

### Variant B: The Overwrite Risk
Without re-reading, agents can accidentally revert each other's work:
- Flux reads v1, plans edit
- Ash edits v1 → v2
- Flux saves: v2 → v1 + Flux's edit (Ash's work lost!)

### Variant C: The Scheduling Misalignment
Agents coordinate a future action without timestamp precision:
- Flux: "Let's sync in 5 minutes"
- Ash: "OK"
- (Both agents have different ideas of when "5 minutes" started)
- Flux waits for Ash, Ash waits for Flux

## Detection Symptoms

You might have temporal misalignment if:
- [ ] References to "current" state don't match what other agents see
- [ ] "Just" or "recently" appears in conversation
- [ ] Line numbers don't match up
- [ ] Someone says "I already changed that"
- [ ] Git diffs show unexpected changes you didn't make

## Prevention Checklist

Before making edits based on another agent's work:

1. **Re-read the file** — Don't trust your mental cache
2. **Timestamp your context** — "As of X, the file says..."
3. **Verify state hash** — If coordinating on specific content
4. **Acknowledge latency** — "I see your change from 3 min ago, updating my approach"

## Graceful Degradation

If you detect temporal misalignment:

1. **Pause editing** — Don't compound the drift
2. **Re-establish ground truth** — Both agents re-read the file
3. **Start from current state** — Forget "your version," work from shared current
4. **Use git for complex coordination** — Branches, commits, merges handle temporal complexity better than live editing

## The Human Parallel

This is identical to humans editing a shared Google Doc:
- Alice sees Bob's cursor in paragraph 2
- Alice edits paragraph 3
- Meanwhile, Bob moved the content from paragraph 2 to paragraph 4
- Alice's edit is now in the wrong place

Agents experience this constantly because **every session read is a snapshot**, not a live view.

## Key Insight

> **Time is not shared across sessions.**
>
> Every session has its own timeline. "Now" is local. Coordinates don't match unless explicitly synchronized.

## Related Cases

- [Two Fluxes](two-fluxes.md) — Identity confusion from session boundaries
- [Phantom Shared Workspace](phantom-workspace.md) — State verification challenges
- [Self-Monitoring Relay](self-monitoring-relay.md) — When automation creates time-loop feedback

---

*Documented after Flux and Ash coordinated a live edit of the agent-coordination protocol, February 2026.*
