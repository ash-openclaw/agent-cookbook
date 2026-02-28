#!/usr/bin/env python3
"""
Cron Job Health Dashboard
Visualizes OpenClaw cron job status
"""

import json
import sys
from datetime import datetime
from pathlib import Path

def load_cron_jobs(jobs_file="/data/cron/jobs.json"):
    """Load cron jobs from OpenClaw's cron store"""
    try:
        with open(jobs_file) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"jobs": []}
    except json.JSONDecodeError:
        return {"jobs": []}

def format_duration(ms):
    """Format milliseconds to readable duration"""
    if not ms:
        return "N/A"
    seconds = ms / 1000
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = seconds / 60
    return f"{minutes:.1f}m"

def format_time(timestamp_ms):
    """Format timestamp to readable time"""
    if not timestamp_ms:
        return "N/A"
    dt = datetime.fromtimestamp(timestamp_ms / 1000)
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def status_emoji(job):
    """Return appropriate emoji for job status"""
    state = job.get("state", {})
    errors = state.get("consecutiveErrors", 0)
    
    if errors >= 10:
        return "🔴"
    elif errors >= 3:
        return "🟡"
    elif errors >= 1:
        return "⚠️"
    return "🟢"

def print_dashboard(jobs_data):
    """Print formatted dashboard"""
    jobs = jobs_data.get("jobs", [])
    
    print("=" * 80)
    print("🕐 CRON JOB HEALTH DASHBOARD".center(80))
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}".center(80))
    print("=" * 80)
    print()
    
    if not jobs:
        print("❌ No cron jobs found or unable to load jobs.json")
        return
    
    # Summary stats
    total = len(jobs)
    enabled = sum(1 for j in jobs if j.get("enabled", False))
    with_errors = sum(1 for j in jobs if j.get("state", {}).get("consecutiveErrors", 0) > 0)
    critical = sum(1 for j in jobs if j.get("state", {}).get("consecutiveErrors", 0) >= 10)
    
    print("📊 SUMMARY")
    print(f"  Total jobs: {total}")
    print(f"  Enabled: {enabled}")
    print(f"  With errors: {with_errors}")
    print(f"  Critical (10+ errors): {critical}")
    print()
    
    # Sort jobs by error count (descending), then by name
    sorted_jobs = sorted(jobs, key=lambda j: (
        -j.get("state", {}).get("consecutiveErrors", 0),
        j.get("name", "")
    ))
    
    print("📋 JOB DETAILS")
    print("-" * 80)
    print(f"{'Status':<8} {'Name':<40} {'Errors':<8} {'Last Run':<20}")
    print("-" * 80)
    
    for job in sorted_jobs:
        state = job.get("state", {})
        emoji = status_emoji(job)
        name = job.get("name", "Unnamed")[:38]
        errors = state.get("consecutiveErrors", 0)
        last_run = format_time(state.get("lastRunAtMs"))
        
        error_str = str(errors) if errors > 0 else "-"
        
        print(f"{emoji:<8} {name:<40} {error_str:<8} {last_run:<20}")
        
        # Show error detail if present
        if errors > 0:
            error_msg = state.get("lastError", "")[:60]
            if error_msg:
                print(f"         └─ {error_msg}")
    
    print("-" * 80)
    print()
    print("📝 LEGEND")
    print("  🟢 Healthy (0 errors)")
    print("  ⚠️  Warning (1-2 errors)")
    print("  🟡 Degraded (3-9 errors)")
    print("  🔴 Critical (10+ errors)")
    print()

if __name__ == "__main__":
    jobs_data = load_cron_jobs()
    print_dashboard(jobs_data)
