#!/usr/bin/env python3
"""
Workspace Cleanup Script
Cleans old temp files, logs, and frees up disk space.
"""

import os
import glob
import shutil
from datetime import datetime, timedelta

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

def main():
    print("=" * 60)
    print("Workspace Cleanup -", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 60)
    
    total_freed = 0
    
    # Clean temp files
    print("\n🧹 Cleaning temp files...")
    patterns = [
        "/data/workspace/**/*.tmp",
        "/data/workspace/**/*.log.old",
        "/data/workspace/**/nohup.out",
        "/tmp/hydroxide.log.*",
    ]
    
    for pattern in patterns:
        removed, size = clean_old_files(pattern, days=3)
        if removed:
            print(f"  Removed {len(removed)} files ({format_size(size)})")
            total_freed += size
    
    # Check for large files
    print("\n📊 Disk usage check:")
    os.system("df -h /data")
    
    print(f"\n✅ Total space freed: {format_size(total_freed)}")
    print("=" * 60)
    
    return total_freed

if __name__ == "__main__":
    main()
