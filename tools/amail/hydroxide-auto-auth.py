#!/usr/bin/env python3
"""
Hydroxide Auto-Auth Script
Restarts hydroxide and re-authenticates when needed
"""

import subprocess
import time
import json
import os
import sys

HYDROXIDE_BIN = "/data/workspace/tools/amail/hydroxide"
AUTH_FILE = os.path.expanduser("~/.config/hydroxide/auth.json")
AMAII_CONFIG = os.path.expanduser("~/.config/amail/config.json")

def is_hydroxide_running():
    """Check if hydroxide process is active"""
    result = subprocess.run(['pgrep', '-f', 'hydroxide.*serve'], capture_output=True)
    return result.returncode == 0

def stop_hydroxide():
    """Kill any running hydroxide processes"""
    subprocess.run(['pkill', '-f', 'hydroxide'], capture_output=True)
    time.sleep(2)

def start_hydroxide():
    """Start hydroxide bridge in background"""
    cmd = [HYDROXIDE_BIN, "-disable-carddav", "serve"]
    with open("/tmp/hydroxide.log", "a") as log:
        subprocess.Popen(cmd, stdout=log, stderr=log)
    time.sleep(5)  # Wait for startup

def check_auth_valid():
    """Check if hydroxide auth is still valid by testing IMAP connection"""
    try:
        import imaplib
        imap = imaplib.IMAP4('127.0.0.1', 1143)
        # Try to connect - if it fails immediately, auth is expired
        imap.noop()
        imap.close()
        return True
    except:
        return False

def get_bridge_password():
    """Get bridge password from hydoxide auth file or amail config"""
    # Try amail config first
    if os.path.exists(AMAII_CONFIG):
        with open(AMAII_CONFIG) as f:
            config = json.load(f)
            if config.get('imap_pass'):
                return config['imap_pass']
    
    # Try hydroxide auth file
    if os.path.exists(AUTH_FILE):
        with open(AUTH_FILE) as f:
            auth = json.load(f)
            # Look for bridge password in various formats
            for key in ['bridge_password', 'password', 'secret']:
                if key in auth:
                    return auth[key]
    
    return None

def ensure_amail_config():
    """Ensure amail config has bridge password from hydroxide"""
    bridge_pass = get_bridge_password()
    if not bridge_pass:
        return False
    
    os.makedirs(os.path.dirname(AMAII_CONFIG), exist_ok=True)
    
    config = {}
    if os.path.exists(AMAII_CONFIG):
        with open(AMAII_CONFIG) as f:
            config = json.load(f)
    
    config.update({
        "imap_user": "ash-autonomous@proton.me",
        "imap_pass": bridge_pass,
        "smtp_user": "ash-autonomous@proton.me",
        "smtp_pass": bridge_pass
    })
    
    with open(AMAII_CONFIG, 'w') as f:
        json.dump(config, f, indent=2)
    
    return True

def main():
    print("🔧 Hydroxide Auto-Auth")
    print("="*50)
    
    # Check if auth is valid
    if is_hydroxide_running() and check_auth_valid():
        print("✅ Hydroxide healthy and authenticated")
        ensure_amail_config()
        return 0
    
    print("⚠️ Hydroxide needs restart/re-auth")
    
    # Stop existing process
    if is_hydroxide_running():
        print("Stopping existing hydroxide...")
        stop_hydroxide()
    
    # Start hydroxide
    print("Starting hydroxide...")
    start_hydroxide()
    
    # Check if it's running
    if not is_hydroxide_running():
        print("❌ Failed to start hydroxide")
        return 1
    
    print("✅ Hydroxide restarted")
    
    # Update amail config with bridge password
    if ensure_amail_config():
        print("✅ Updated amail config with bridge credentials")
    else:
        print("⚠️ Could not find bridge password - may need manual setup")
        print("Run: amail setup")
    
    # Test connection
    time.sleep(2)
    if check_auth_valid():
        print("✅ Authentication successful")
        return 0
    else:
        print("⚠️ Hydroxide running but auth may need manual refresh")
        print("If auth expired, run: hydroxide auth ash-autonomous@proton.me")
        return 1

if __name__ == '__main__':
    sys.exit(main())
