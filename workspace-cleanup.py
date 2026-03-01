#!/usr/bin/env python3
"""
Workspace Cleanup Script v2
Cleans old temp files, logs, runs git gc, and reports to Discord.
"""

import os
import sys
import glob
import shutil
import subprocess
from datetime import datetime, timedelta

sys.path.insert(0, '/data/workspace')

def get_size(path):
    """Get size of file or directory in bytes"""
    if os.path.isfile(path):
        return os.path.getsize(path)
    total = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if os.path.exists(fp):
                total += os.path.getsize(fp)
    return total

def format_size(size_bytes):
    """Format bytes to human readable"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"

def clean_old_files(pattern, days=7):
    """Remove files matching pattern older than specified days"""
    removed = []
    total_size = 0
    cutoff = datetime.now() - timedelta(days=days)
    
    for filepath in glob.glob(pattern, recursive=True):
        if os.path.isfile(filepath):
            try:
                mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
                if mtime < cutoff:
                    size = os.path.getsize(filepath)
                    os.remove(filepath)
                    removed.append(filepath)
                    total_size += size
            except Exception as e:
                print(f"  Error removing {filepath}: {e}")
    
    return removed, total_size

def run_git_gc():
    """Run git garbage collection"""
    try:
        result = subprocess.run(
            ['git', 'gc', '--aggressive', '--prune=now'],
            cwd='/data/workspace',
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except Exception as e:
        print(f"  Error running git gc: {e}")
        return False

def find_large_files(threshold_mb=10):
    """Find files larger than threshold"""
    large_files = []
    threshold_bytes = threshold_mb * 1024 * 1024
    
    for root, dirs, files in os.walk('/data/workspace'):
        # Skip .git directory
        if '.git' in root:
            continue
        for file in files:
            filepath = os.path.join(root, file)
            try:
                size = os.path.getsize(filepath)
                if size > threshold_bytes:
                    large_files.append((filepath, size))
            except:
                pass
    
    return sorted(large_files, key=lambda x: x[1], reverse=True)[:10]

def main():
    print("=" * 60)
    print("Workspace Cleanup v2 -", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 60)
    
    total_freed = 0
    report_lines = []
    
    # Clean temp files
    print("\n🧹 Cleaning temp files (>3 days old)...")
    patterns = [
        "/data/workspace/**/*.tmp",
        "/data/workspace/**/*.log.old",
        "/data/workspace/**/nohup.out",
        "/tmp/hydroxide.log.*",
    ]
    
    temp_removed = 0
    temp_size = 0
    for pattern in patterns:
        removed, size = clean_old_files(pattern, days=3)
        temp_removed += len(removed)
        temp_size += size
    
    if temp_removed:
        print(f"  Removed {temp_removed} temp files ({format_size(temp_size)})")
        report_lines.append(f"• Temp files: {temp_removed} removed ({format_size(temp_size)})")
    else:
        print("  No old temp files found")
        report_lines.append("• Temp files: None to remove")
    
    total_freed += temp_size
    
    # Git garbage collection
    print("\n🗜️  Running git garbage collection...")
    git_before = get_size('/data/workspace/.git')
    if run_git_gc():
        git_after = get_size('/data/workspace/.git')
        git_freed = git_before - git_after
        print(f"  Git repo: {format_size(git_before)} → {format_size(git_after)}")
        if git_freed > 0:
            print(f"  Freed: {format_size(git_freed)}")
            report_lines.append(f"• Git GC: {format_size(git_freed)} freed")
        total_freed += max(0, git_freed)
    else:
        print("  Git GC skipped or failed")
        report_lines.append("• Git GC: Skipped")
    
    # Check for large files
    print("\n📁 Checking for large files (>10MB)...")
    large_files = find_large_files(10)
    if large_files:
        print(f"  Found {len(large_files)} large files:")
        for path, size in large_files[:5]:
            rel_path = path.replace('/data/workspace/', '')
            print(f"    - {rel_path}: {format_size(size)}")
        report_lines.append(f"• Large files: {len(large_files)} found (>10MB)")
    else:
        print("  No large files found")
        report_lines.append("• Large files: None found")
    
    # Disk usage
    print("\n📊 Current disk usage:")
    result = subprocess.run(['df', '-h', '/data'], capture_output=True, text=True)
    print(result.stdout)
    
    # Summary
    print("=" * 60)
    print(f"✅ Total space freed: {format_size(total_freed)}")
    print("=" * 60)
    
    # Build Discord report
    report = f"🧹 Workspace Cleanup Complete\n\n"
    report += "\n".join(report_lines)
    report += f"\n\n💾 Total freed: {format_size(total_freed)}"
    
    # Save report for Discord
    with open('/tmp/workspace-cleanup-report.txt', 'w') as f:
        f.write(report)
    
    print("\nReport saved to /tmp/workspace-cleanup-report.txt")
    
    return total_freed, report

if __name__ == "__main__":
    main()
