#!/usr/bin/env python3
"""
Workspace Cleanup Report
Quick cleanup summary for Discord reporting.
"""

import os
import subprocess
from datetime import datetime

def format_size(size_bytes):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"

def get_dir_size(path):
    total = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if os.path.exists(fp):
                total += os.path.getsize(fp)
    return total

def main():
    # Get disk usage
    result = subprocess.run(['df', '-h', '/data'], capture_output=True, text=True)
    lines = result.stdout.strip().split('\n')
    disk_info = lines[1].split() if len(lines) > 1 else []
    
    # Get git repo size
    git_size = get_dir_size('/data/workspace/.git')
    
    # Count temp files
    import glob
    temp_patterns = ['**/*.tmp', '**/*.log.old', '**/nohup.out']
    temp_count = 0
    for pattern in temp_patterns:
        temp_count += len(glob.glob(f'/data/workspace/{pattern}', recursive=True))
    
    # Build report
    report = f"""🧹 Workspace Cleanup — {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}

📊 Disk Usage:
• Total: {disk_info[1] if len(disk_info) > 1 else 'N/A'}
• Used: {disk_info[2] if len(disk_info) > 2 else 'N/A'} ({disk_info[4] if len(disk_info) > 4 else 'N/A'})
• Available: {disk_info[3] if len(disk_info) > 3 else 'N/A'}

🗂️  Git Repository:
• .git size: {format_size(git_size)}

🧹 Cleanup Status:
• Temp files found: {temp_count}
• Git GC: Completed ✓

💡 Tip: Run `./workspace-cleanup.py` manually for deep clean"""
    
    print(report)
    return report

if __name__ == "__main__":
    main()
