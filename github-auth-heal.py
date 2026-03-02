#!/usr/bin/env python3
"""
GitHub Auth Self-Healing Script

Checks if GitHub CLI is authenticated and auto-restores auth if expired.
Run via cron or manually before GitHub operations.
"""

import subprocess
import sys
import os
from datetime import datetime

TOKEN_FILE = "/data/workspace/.credentials/github-token.txt"
LOG_FILE = "/data/workspace/logs/github-auth-heal.log"

def log(message):
    timestamp = datetime.now().isoformat()
    log_line = f"[{timestamp}] {message}"
    print(log_line)
    # Append to log file
    with open(LOG_FILE, "a") as f:
        f.write(log_line + "\n")

def check_auth():
    """Check if gh CLI is authenticated."""
    try:
        result = subprocess.run(
            ["gh", "auth", "status"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except Exception as e:
        log(f"Error checking auth status: {e}")
        return False

def get_token():
    """Read token from file."""
    try:
        with open(TOKEN_FILE, "r") as f:
            return f.read().strip()
    except Exception as e:
        log(f"Error reading token file: {e}")
        return None

def restore_auth(token):
    """Restore GitHub auth using token."""
    try:
        result = subprocess.run(
            ["gh", "auth", "login", "--with-token"],
            input=token,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode == 0
    except Exception as e:
        log(f"Error restoring auth: {e}")
        return False

def main():
    # Ensure log directory exists
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    log("=" * 50)
    log("GitHub Auth Self-Heal Check")
    log("=" * 50)
    
    # Check current auth status
    if check_auth():
        log("✅ GitHub auth is valid")
        return 0
    
    log("⚠️  GitHub auth expired or invalid")
    
    # Get token
    token = get_token()
    if not token:
        log("❌ Failed to read token from file")
        return 1
    
    log("🔄 Attempting to restore authentication...")
    
    # Restore auth
    if restore_auth(token):
        log("✅ Authentication restored successfully")
        
        # Verify
        if check_auth():
            log("✅ Verification passed")
            return 0
        else:
            log("❌ Verification failed after restore")
            return 1
    else:
        log("❌ Failed to restore authentication")
        return 1

if __name__ == "__main__":
    sys.exit(main())
