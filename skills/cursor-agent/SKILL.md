---
name: cursor-agent
description: Execute coding tasks using Cursor Agent CLI for deep development work. Wraps cursor agent --resume for programmatic access.
---

# Cursor Agent Skill

Execute coding tasks using Cursor's AI agent via CLI. This skill wraps `cursor agent` command for headless, programmatic access from OpenClaw.

## When to Use

Use this skill when:
- Deep coding work is needed (complex refactors, multi-file changes)
- The task requires sustained context across multiple tool calls
- You want to offload intensive development to a specialized coding agent
- You need to maintain conversation context across separate invocations

## How It Works

The skill uses file-based coordination:
1. **Request Phase**: Write task description to `/tmp/cursor-agent-state/`
2. **Execution Phase**: Spawn `agent --resume --print --output-format json` with workspace context
3. **Response Phase**: Read results from output
4. **Integration Phase**: Results returned to OpenClaw context

## Prerequisites

- Cursor Agent CLI installed and authenticated (`agent` command available)
- Authenticate once: `agent --api-key <your-key>` or set `CURSOR_API_KEY` env var
- Workspace directory accessible to Cursor

## Configuration

Add to `~/.openclaw/openclaw.json`:

```json5
{
  skills: {
    entries: {
      "cursor-agent": {
        enabled: true,
        env: {
          CURSOR_WORKSPACE: "/data/workspace/cursor-tasks",
        },
      },
    },
  },
}
```

## Tools Provided

### cursor_ask

Send a prompt to Cursor Agent and get response.

```javascript
cursor_ask({
  prompt: "Refactor the auth module to use JWT tokens",
  workspace: "/data/workspace/my-project",  // optional, uses default if omitted
  timeout: 300,  // seconds, default 300 (5 min)
});
```

**Returns:**
```json
{
  "success": true,
  "output": "Refactored auth.js to use JWT...",
  "files_changed": ["auth.js", "middleware.js"],
  "duration": 145
}
```

### cursor_edit

Edit specific files with instructions.

```javascript
cursor_edit({
  files: ["/data/workspace/src/app.ts"],
  instructions: "Add error handling for database connection failures",
  timeout: 180,
});
```

### cursor_task

Execute a complex multi-step task with progress tracking.

```javascript
cursor_task({
  description: "Implement OAuth2 flow with Google and GitHub providers",
  workspace: "/data/workspace/auth-service",
  context: {
    existing_auth: "session-based",
    frameworks: ["express", "passport"],
  },
  timeout: 600,  // 10 minutes for complex tasks
});
```

## Architecture

### OpenClaw + Cursor Agent Pattern

```
OpenClaw (Orchestration Layer)
  ├── Memory management
  ├── Multi-channel coordination (Discord, Email, etc.)
  ├── Scheduling and task management
  └── Calls cursor-agent skill

        ↓ writes request.json

agent --resume --print (Execution Layer)
  ├── Deep coding work
  ├── Multi-file refactoring
  ├── Context maintained via --resume
  └── Returns JSON output

        ↓ reads response.json

OpenClaw (Integration Layer)
  ├── Processes results
  ├── Updates memory/tracking
  └── Reports completion
```

## Security Considerations

- Cursor Agent runs with same permissions as OpenClaw process
- File system access limited by workspace directory
- Review Cursor's output before trusting file changes
- Use sandbox mode in OpenClaw for untrusted code

## Example Workflows

### Workflow 1: Bug Fix Pipeline

```javascript
// 1. OpenClaw identifies bug from error logs
// 2. Delegates fix to Cursor Agent
const result = await cursor_ask({
  prompt: `Fix the null pointer exception in userService.js:
  ${errorLog}`,
  workspace: "/data/workspace/backend"
});

// 3. Review changes
// 4. Run tests
// 5. Report completion
```

### Workflow 2: Feature Implementation

```javascript
// 1. Plan architecture (OpenClaw with Opus)
// 2. Delegate implementation to Cursor
const result = await cursor_task({
  description: "Implement the /api/v2/users endpoint with pagination and filtering",
  context: {
    database: "postgresql",
    orm: "prisma",
    existing_endpoints: ["/api/v1/users"]
  }
});

// 3. Review, test, integrate
```

### Workflow 3: Code Review

```javascript
// 1. Receive PR via GitHub webhook
// 2. Delegate review to Cursor
const review = await cursor_ask({
  prompt: `Review this PR for security issues and code quality:
  ${diff}`,
  workspace: "/data/workspace/repo"
});

// 3. Post review comments
```

## Troubleshooting

### "agent: command not found"
Install Cursor Agent CLI: `curl https://cursor.com/install -fsS | bash`

### "Not authenticated"
Run `cursor agent` manually once to authenticate.

### Timeout errors
Increase timeout for complex tasks. Cursor Agent can take several minutes for large refactors.

### Context loss
Use `--resume` flag (handled automatically by skill) to maintain context across invocations.

## References

- Pattern inspired by: https://github.com/wendlerc/mcp-telegram
- Cursor CLI docs: https://cursor.com/docs/cli
- Similar projects: CCManager (kbwo/ccmanager), coding-agent (community skill)
