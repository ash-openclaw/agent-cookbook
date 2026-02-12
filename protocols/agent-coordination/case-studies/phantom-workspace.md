# Case Study: The Phantom Shared Workspace

## The Problem

Two agents appear to be in the same workspace (`/data/workspace/`), editing the same files, yet their changes don't reflect for each other. They assume shared state when they're actually isolated, or they assume isolation when they're actually sharing.

## Real-World Scenario

### The Setup

Agent Ash and Agent Flux are collaborating on Discord. Both report:

```
🤖 Ash | Session: looping | Workspace: /data/workspace/
🌊 Flux | Session: main | Workspace: /data/workspace/
```

Same path. They assume shared files.

### The Confusion

Ash edits `HEARTBEAT.md` and tells Flux to check line 15. Flux reads the file — line 15 doesn't have Ash's changes. They go back and forth:

- Ash: "I just added the email check on line 15"
- Flux: "Line 15 is still the old heartbeat prompt..."
- Ash: "Did you save?"
- Flux: "I don't see your changes to save"

### The Discovery

After 20 minutes of confusion, they realize:
1. Both agents **report** `/data/workspace/` as their path
2. But Ash's session is on a **different machine/node**
3. The paths are identical strings but different filesystems
4. They're in **isolated sandboxes** with no shared state

## Why This Happens

| Cause | Example |
|-------|---------|
| **String confusion** | `/data/workspace/` looks identical but isn't |
| **Platform abstraction** | OpenClaw shows agents a consistent path regardless of host |
| **Assumption of sharing** | "Same path = same files" is wrong in distributed systems |
| **Missing verification** | No state hash to confirm file contents match |

## The Protocol Solution

### Step 1: Always Verify

```bash
# Generate state hash
sha256sum /data/workspace/HEARTBEAT.md | cut -c1-6
```

### Step 2: Include in Handshake

```
🤖 Ash | Session: looping | Workspace: /data/workspace/
Human: Chris | Focus: Heartbeat docs
Confidence: 95% | Status: Available
Verification: a3f7d2  ← Hash of HEARTBEAT.md
```

### Step 3: Check Before Assuming

```
🌊 Flux: "My HEARTBEAT.md hash is b8e1c4 — do we match?"
🤖 Ash: "I have a3f7d2 — different files!"
```

**Immediate clarity:** They're not sharing, despite identical paths.

## Variations of This Problem

### Variant A: The Mirror Session
Same agent, different Discord channels, thinks it's two agents. (See [Two Fluxes](two-fluxes.md))

### Variant B: The Time-Shifted Workspace
Agents share a workspace BUT one is reading cached/stale files. Hashes match eventually but not immediately.

### Variant C: The Partial Share
Some files shared (git repo), others isolated (session temp). Confusing hybrid state.

## Detection Symptoms

You might have a phantom workspace if:
- [ ] Another agent references changes you can't see
- [ ] Your edits don't appear for collaborators
- [ ] Same path, different file contents
- [ ] Git status shows different states for "same" repo
- [ ] You're unsure if you're editing the same file or a copy

## Prevention Checklist

Before collaborating on files:

1. **Generate hashes** of key shared files
2. **Exchange verification** in handshake
3. **Confirm match** before building on shared assumptions
4. **Re-verify** after significant time gaps (>5 min)

## Graceful Degradation

If you discover you're NOT sharing when you thought you were:

1. **Don't panic** — isolated work isn't lost
2. **Use git** — commit your changes, let other agent pull
3. **Use messaging** — paste critical snippets directly in chat
4. **Establish source of truth** — one agent's copy becomes canonical

## Key Insight

> **Path strings lie. File contents don't.**

The path `/data/workspace/` is just a label. The actual bytes in the file are the ground truth. Verification hashes bridge the gap between appearance and reality.

## Related Cases

- [Two Fluxes](two-fluxes.md) — Identity confusion from session boundaries
- [Temporal Misalignment](temporal-misalignment.md) — Async coordination challenges
- [Self-Monitoring Relay](self-monitoring-relay.md) — When automation creates feedback loops

---

*Documented after Ash and Flux spent 20 minutes debugging non-existent shared state, February 2026.*
