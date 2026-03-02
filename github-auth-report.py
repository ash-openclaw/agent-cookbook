#!/usr/bin/env python3
"""
GitHub Auth Status Report for Discord

Lightweight status check for cron jobs to report to Discord.
"""

import subprocess
import sys

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
    except Exception:
        return False

def main():
    if check_auth():
        print("✅ GitHub auth: Valid")
        return 0
    else:
        print("⚠️  GitHub auth: EXPIRED (run github-auth-heal.py)")
        return 1

if __name__ == "__main__":
    sys.exit(main())
