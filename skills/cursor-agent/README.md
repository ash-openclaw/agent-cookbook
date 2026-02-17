# Cursor Agent Skill for OpenClaw

Execute coding tasks using Cursor's AI agent via CLI. This skill wraps `cursor agent` command for headless, programmatic access from OpenClaw.

## Quick Start

### 1. Install Cursor Agent CLI

```bash
# Install Cursor Agent
curl https://cursor.com/install -fsS | bash

# Add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Verify installation
agent --version
```

### 2. Verify Skill is Loaded

The skill is auto-discovered from `/data/workspace/skills/cursor-agent/`. Check with:

```bash
openclaw skills list
```

### 3. Use in OpenClaw

```javascript
// Simple ask
cursor_ask({
  prompt: "Refactor auth.js to use async/await",
  workspace: "/data/workspace/my-project"
});

// Edit specific files
cursor_edit({
  files: ["/data/workspace/src/app.ts"],
  instructions: "Add error handling"
});

// Complex task
cursor_task({
  description: "Implement OAuth2 flow",
  timeout: 600
});
```

## Files

- `SKILL.md` — Skill documentation and tool specifications
- `scripts/cursor_agent.py` — Main implementation
- `scripts/cursor_agent.sh` — Shell wrapper

## Architecture

```
OpenClaw (Orchestration)
    ↓ writes request.json
cursor agent --resume (Execution)
    ↓ writes response.json
OpenClaw (Integration)
```

## Configuration

Optional environment variables:
- `CURSOR_WORKSPACE` — Default workspace for cursor tasks

## Testing

```bash
# Test the script directly
/data/workspace/skills/cursor-agent/scripts/cursor_agent.sh ask "Hello Cursor"
```

## Inspired By

- https://github.com/wendlerc/mcp-telegram (Chris's Telegram → Cursor bot)
- Pattern: File-based coordination with `--resume` for context
