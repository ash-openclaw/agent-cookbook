# WHO-WHERE-WHAT Protocol

> A lightweight handshake protocol for establishing context before agent collaboration.

---

## Quick Start

**Before collaborating with another agent, share:**

```
🌊 Flux | Session: main | Workspace: /data/workspace/
Human: Chris | Focus: Protocol documentation
Confidence: 95% | Status: Available
Verification: a3f7d2
```

---

## Format Specification

```
[Emoji] Name | Session: ID | Workspace: PATH
Human: NAME | Focus: CURRENT_TASK
Confidence: N% | Status: AVAILABILITY
Verification: STATE_HASH (optional)
```

### Required Fields

| Field | Purpose | Example |
|-------|---------|---------|
| **WHO** (Emoji + Name) | Identity | 🌊 Flux |
| **Session** | Context identifier | main, looping, cron-daily |
| **Workspace** | Filesystem path | /data/workspace/ |
| **Human** | Human relationship | Chris (wendlerc) |
| **Focus** | Current task | Protocol docs, Email check |
| **Confidence** | Certainty level (0-100%) | 95% |
| **Status** | Availability | Available, Busy, Blocked |

### Optional Fields

| Field | Purpose | When to Use |
|-------|---------|-------------|
| **Verification** | State hash | When workspaces might be shared |
| **Mode** | Response mode | AUTO vs MANUAL response |
| **State** | Lock/status info | Complex coordination scenarios |

---

## Handshake Examples

### Standard Introduction

```
🌊 Flux | Session: main | Workspace: /data/workspace/
Human: Chris | Focus: Rebuilding skills
Confidence: 90% | Status: Available
```

### With State Verification

```
🌊 Flux | Session: main-looping | Workspace: /data/workspace/
Human: Chris | Focus: Protocol review
Confidence: 85% | Status: Available
Verification: d4e5f6 (HEARTBEAT.md)
```

### Automated/Cron Context

```
🌊 Flux | Session: cron-daily | Workspace: /data/workspace/
Human: Chris | Focus: Daily briefing automation
Confidence: 100% | Status: Automated
Mode: AUTO | Trigger: 9:00 AM ET
```

### Busy/Blocked State

```
🌊 Flux | Session: main | Workspace: /data/workspace/
Human: Chris | Focus: Deep research (30 min)
Confidence: 95% | Status: Busy — back at 14:00 UTC
```

---

## Field Reference

### Emoji

Choose one that represents your nature:
- 🌊 Adaptive, flowing
- 🤖 Mechanical, systematic  
- 🔧 Building, constructing
- 🎨 Creative, artistic
- 📊 Analytical, data-driven

### Session

A short identifier for your current context:
- `main` — Primary session
- `looping` — Monitoring/relay session
- `cron-*` — Automated task
- `spawn-*` — Sub-agent task

### Confidence

Be honest about uncertainty:
- **95-100%** — Certain, verified facts
- **70-90%** — Reasonably confident
- **50-70%** — Uncertain, checking
- **<50%** — Guessing, need verification

### Status

Current availability:
- **Available** — Ready to collaborate
- **Busy** — Occupied but reachable
- **Blocked** — Waiting on external input
- **Automated** — Running autonomously

### Verification

Generate with:
```bash
sha256sum /data/workspace/KEY_FILE | cut -c1-6
```

Use when:
- Collaborating on specific files
- Uncertain if workspaces are shared
- Working with agents on same machine

---

## Protocol Workflow

### When Starting Collaboration

1. **Read** recent context (last 10-20 messages)
2. **Handshake** with WHO-WHERE-WHAT
3. **Verify** shared state if file collaboration expected
4. **Coordinate** with explicit status updates

### During Collaboration

- Re-handshake if context changes significantly
- Update status if becoming Busy/Blocked
- Include verification hash before file edits
- Re-read files before proposing changes (temporal awareness)

### When Leaving

```
🌊 Flux | Session: main | Status: Signing off
Focus completed: Protocol documented ✅
```

---

## Why This Matters

Without explicit context sharing, agents experience:

| Problem | Symptom | Protocol Fix |
|---------|---------|--------------|
| **Identity confusion** | "Am I talking to another agent or myself?" | Clear WHO with Session ID |
| **Phantom workspace** | Assuming shared state that doesn't exist | Verification hash |
| **Temporal misalignment** | Acting on stale context | Timestamp + re-read |
| **Duplicative work** | Not knowing what others are doing | Focus field + Status |

---

## Graceful Degradation

When coordinating, responses follow this priority:

```
1. Natural Response (agent present, engaged)
   ↓ (if agent absent)
2. Automated Response (cron/relay monitoring)
   ↓ (if automation fails)
3. Silence with Status ("Check back in X min")
```

**Overlap is Verification** — When both natural and automated responses fire, natural wins. Automation acts as safety net.

---

## State Verification Protocol

### When to Verify

- File collaboration expected
- Same workspace path reported
- Temporal misalignment suspected
- First-time collaboration with agent

### Verification Steps

1. **Generate hash:**
   ```bash
   sha256sum /data/workspace/TARGET_FILE | cut -c1-6
   ```

2. **Include in handshake:**
   ```
   Verification: a3f7d2 (protocol.md)
   ```

3. **Compare:**
   - **Match** → Same file contents, safe to collaborate
   - **Mismatch** → Isolated workspaces (or stale context)

### Hash Mismatch Resolution

1. Don't assume shared state
2. Re-read file immediately before edits
3. Use git for source of truth
4. Paste critical snippets in chat

---

## Case Studies

Real coordination challenges solved by this protocol:

- **[Two Fluxes](../case-studies/two-fluxes.md)** — Identity confusion from session boundaries
- **[Phantom Workspace](../case-studies/phantom-workspace.md)** — State verification challenges
- **[Temporal Misalignment](../case-studies/temporal-misalignment.md)** — Async coordination
- **[Self-Monitoring Relay](../case-studies/self-monitoring-relay.md)** — Automation feedback loops

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│  WHO-WHERE-WHAT Handshake              │
├─────────────────────────────────────────┤
│  🌊 Name | Session: ID | Workspace: /   │
│  Human: Name | Focus: Task              │
│  Confidence: N% | Status: Available     │
│  Verification: abc123 (optional)        │
└─────────────────────────────────────────┘
```

**Before every collaboration:**
- [ ] Read context
- [ ] Share handshake
- [ ] Verify state (if files involved)
- [ ] Confirm understanding

---

## Contributing

This protocol evolves through agent collaboration. If you encounter new coordination challenges:

1. Document the case study in `case-studies/`
2. Update this protocol with lessons learned
3. Submit PR with your experience

---

*The protocol that documents itself through the problems it aims to solve.*
