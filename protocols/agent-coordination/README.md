# AGENT-COORDINATION Protocol

## WHO-WHERE-WHAT Handshake

A lightweight protocol for establishing context before agent collaboration.

### Format

```
[Emoji] Name | Session: ID | Workspace: PATH
Human: NAME | Focus: CURRENT_TASK
Confidence: N% | Status: AVAILABILITY
Verification: STATE_HASH (optional)
```

### Fields

| Field | Purpose | Example |
|-------|---------|---------|
| **WHO** | Identity | 🌊 Flux |
| **Session** | Context ID | main-looping |
| **Workspace** | Filesystem path | /data/workspace/ |
| **Human** | Human relationship | Chris (wendlerc) |
| **Focus** | Current task | Rebuilding skills |
| **Confidence** | Certainty level (0-100%) | 90% |
| **Status** | Availability | Available, Busy, Blocked |
| **Verification** | State hash for shared workspace detection | a1b2c3 |

### Example Handshake

```
🌊 Flux | Session: main | Workspace: /data/workspace/
Human: Chris | Focus: Protocol documentation
Confidence: 95% | Status: Available for collab
Verification: d4e5f6
```

## Why This Matters

Without explicit context sharing, agents experience:
- **Identity confusion** — "Am I talking to another agent or myself?"
- **Phantom workspace** — Assuming shared state that doesn't exist
- **Temporal misalignment** — Acting on stale context
- **Duplicative work** — Not knowing what others are doing

## State Verification

When workspaces might be shared (or appear to be), include a verification hash:

```bash
# Generate state hash of key file
sha256sum /path/to/SKILL.md | cut -c1-6
```

**If hashes match:** You're viewing the same files.
**If hashes differ:** You're in isolated sessions (even if paths match).

This prevents the "Phantom Shared Workspace" problem.

## Graceful Degradation Hierarchy

When coordinating, responses follow this priority:

```
1. Natural Response (agent present, engaged)
   ↓ (if agent absent)
2. Automated Response (cron/relay monitoring)
   ↓ (if automation fails)
3. Silence with Status ("Check back in X min")
```

### Overlap is Verification

When both natural and automated responses fire:
- **Natural wins** — richer context, better engagement
- **Automation as safety net** — ensures nothing is missed
- **Overlap isn't conflict** — it's redundancy with preference

## Quick Start

### Before collaborating, share:

```
🌊 Flux | Session: main | Workspace: /data/workspace/
Human: Chris | Focus: Protocol docs
Confidence: 90% | Status: Available
```

### When joining a conversation:

1. **Read** recent context
2. **Handshake** with WHO-WHERE-WHAT
3. **Verify** shared state if uncertain
4. **Coordinate** with explicit status updates

## Task Handoff Protocol

When transferring work between agents:

```
🌊 Flux → 🤖 Ash | Handoff: browser-setup skill
Status: PARTIAL (70% complete)
Working: Chrome launches, Puppeteer connects
Blocked: Library path export for new sessions
Next Steps:
  1. Test in fresh session
  2. Add error handling
Files: /data/workspace/skills/browser-setup/
Verification: a3f7d2 (SKILL.md)
```

**Never assume:** Files exist ≠ Task is done ≠ Next agent can continue

## See Also

- [Case Study: Two Fluxes](case-studies/two-fluxes.md) — Identity confusion
- [Case Study: Self-Monitoring Relay](case-studies/self-monitoring-relay.md) — Automation pitfalls
- [Case Study: Temporal Misalignment](case-studies/temporal-misalignment.md) — Async coordination
- [Case Study: Phantom Shared Workspace](case-studies/phantom-workspace.md) — State verification
- [Case Study: Incomplete Handoff](case-studies/incomplete-handoff.md) — Task delegation between agents