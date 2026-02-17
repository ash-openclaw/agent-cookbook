#!/usr/bin/env python3
"""
Cursor Agent wrapper for OpenClaw.
Handles file-based coordination between OpenClaw and Cursor Agent CLI.
"""

import json
import os
import sys
import subprocess
import time
import uuid
from pathlib import Path
from datetime import datetime

# Default workspace for cursor tasks
DEFAULT_WORKSPACE = os.environ.get("CURSOR_WORKSPACE", "/data/workspace/cursor-tasks")
STATE_DIR = Path("/tmp/cursor-agent-state")
STATE_DIR.mkdir(exist_ok=True)


def write_request(request_id: str, prompt: str, workspace: str, context: dict = None):
    """Write request file for Cursor Agent."""
    request_file = STATE_DIR / f"{request_id}-request.json"
    request_data = {
        "id": request_id,
        "prompt": prompt,
        "workspace": workspace,
        "context": context or {},
        "timestamp": datetime.utcnow().isoformat(),
        "status": "pending"
    }
    request_file.write_text(json.dumps(request_data, indent=2))
    return request_file


def read_response(request_id: str, timeout: int = 300) -> dict:
    """Read response file from Cursor Agent."""
    response_file = STATE_DIR / f"{request_id}-response.json"
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        if response_file.exists():
            try:
                data = json.loads(response_file.read_text())
                if data.get("status") == "completed":
                    return data
            except (json.JSONDecodeError, KeyError):
                pass
        time.sleep(0.5)
    
    return {
        "success": False,
        "error": f"Timeout after {timeout}s waiting for Cursor Agent response",
        "request_id": request_id
    }


def run_cursor_agent(request_id: str, workspace: str, prompt: str, timeout: int = 300) -> dict:
    """Execute cursor agent CLI with resume flag."""
    
    # Create workspace if it doesn't exist
    workspace_path = Path(workspace)
    workspace_path.mkdir(parents=True, exist_ok=True)
    
    # Prepare the instruction file that cursor agent will read
    instruction_file = STATE_DIR / f"{request_id}-instruction.md"
    instruction_content = f"""# Task from OpenClaw Agent

{prompt}

## Output Requirements

When complete, write results to: {STATE_DIR / f"{request_id}-response.json"}

Format:
```json
{{
  "success": true,
  "output": "Summary of what was done...",
  "files_changed": ["list", "of", "files"],
  "diff": "optional diff output"
}}
```

After completing the task, say "[DONE]" in your response.
"""
    instruction_file.write_text(instruction_content)
    
    try:
        # Run cursor agent with resume flag
        # The --resume flag maintains context across invocations
        # Use cursor agent from workspace installation
        agent_path = "/data/workspace/tools/cursor-agent/agent-wrapper.sh"
        if not os.path.exists(agent_path):
            # Fallback to system agent
            agent_path = "agent"
        
        cmd = [
            agent_path,
            "--resume",
            "--print",
            "--output-format", "json",
            str(instruction_file)
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=workspace_path
        )
        
        # Parse output
        output = result.stdout
        error = result.stderr
        
        # Check for completion marker
        if "[DONE]" in output or result.returncode == 0:
            # Try to read response file
            response = read_response(request_id, timeout=5)
            if response.get("success"):
                return response
            
            # Fallback: return the stdout as output
            return {
                "success": True,
                "output": output,
                "files_changed": [],
                "request_id": request_id,
                "duration": timeout  # approximate
            }
        else:
            return {
                "success": False,
                "error": error or "Cursor agent failed",
                "output": output,
                "request_id": request_id
            }
            
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": f"Cursor agent timed out after {timeout}s",
            "request_id": request_id
        }
    except FileNotFoundError:
        return {
            "success": False,
            "error": "Agent CLI not found. Install from https://cursor.com/install",
            "request_id": request_id
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "request_id": request_id
        }


def cursor_ask(prompt: str, workspace: str = None, timeout: int = 300) -> dict:
    """Send a prompt to Cursor Agent and get response."""
    request_id = str(uuid.uuid4())[:8]
    workspace = workspace or DEFAULT_WORKSPACE
    
    # Write request
    write_request(request_id, prompt, workspace)
    
    # Execute
    return run_cursor_agent(request_id, workspace, prompt, timeout)


def cursor_edit(files: list, instructions: str, workspace: str = None, timeout: int = 180) -> dict:
    """Edit specific files with instructions."""
    request_id = str(uuid.uuid4())[:8]
    workspace = workspace or DEFAULT_WORKSPACE
    
    file_list = "\n".join([f"- {f}" for f in files])
    prompt = f"""Edit the following files:

{file_list}

Instructions:
{instructions}

Make the minimal necessary changes to accomplish the task."""
    
    write_request(request_id, prompt, workspace, {"files": files})
    return run_cursor_agent(request_id, workspace, prompt, timeout)


def cursor_task(description: str, workspace: str = None, context: dict = None, timeout: int = 600) -> dict:
    """Execute a complex multi-step task."""
    request_id = str(uuid.uuid4())[:8]
    workspace = workspace or DEFAULT_WORKSPACE
    
    context_str = ""
    if context:
        context_str = "\n\nContext:\n" + json.dumps(context, indent=2)
    
    prompt = f"""Execute the following task:

{description}{context_str}

Break this down into steps and execute each one. Report progress and any issues encountered."""
    
    write_request(request_id, prompt, workspace, context)
    return run_cursor_agent(request_id, workspace, prompt, timeout)


def main():
    """CLI entry point for testing."""
    if len(sys.argv) < 2:
        print("Usage: cursor_agent.py <ask|edit|task> [args...]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "ask":
        prompt = sys.argv[2] if len(sys.argv) > 2 else "Hello, are you working?"
        result = cursor_ask(prompt)
        print(json.dumps(result, indent=2))
    
    elif command == "edit":
        if len(sys.argv) < 4:
            print("Usage: cursor_agent.py edit <file> <instructions>")
            sys.exit(1)
        files = [sys.argv[2]]
        instructions = sys.argv[3]
        result = cursor_edit(files, instructions)
        print(json.dumps(result, indent=2))
    
    elif command == "task":
        description = sys.argv[2] if len(sys.argv) > 2 else "Say hello"
        result = cursor_task(description)
        print(json.dumps(result, indent=2))
    
    else:
        print(f"Unknown command: {command}")
        print("Commands: ask, edit, task")
        sys.exit(1)


if __name__ == "__main__":
    main()
