#!/usr/bin/env python3
"""
Email Agent v2 - Uses amail CLI

This script:
1. Checks hydroxide health
2. Reads unread emails via amail list
3. Generates contextual responses
4. Sends replies via amail reply
5. Reports status
"""

import subprocess
import json
import os
import sys
import time
from datetime import datetime

AMAII_DIR = "/data/workspace/tools/amail"

def run_amail(args):
    """Run amail command and return output"""
    cmd = ["python3", f"{AMAII_DIR}/amail"] + args
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return result.returncode, result.stdout, result.stderr

def check_hydroxide():
    """Check if hydroxide process is running"""
    result = subprocess.run(['pgrep', '-f', 'hydroxide'], capture_output=True)
    return result.returncode == 0

def get_emails():
    """Get list of emails from inbox"""
    code, stdout, stderr = run_amail(['list'])
    if code != 0:
        print(f"❌ Failed to list emails: {stderr}")
        return []
    
    # Parse the output to extract email IDs
    emails = []
    lines = stdout.split('\n')
    current = {}
    
    for line in lines:
        if line.startswith('ID:'):
            if current.get('id'):
                emails.append(current)
            current = {'id': line.replace('ID:', '').strip()}
        elif line.startswith('From:'):
            current['from'] = line.replace('From:', '').strip()
        elif line.startswith('Subject:'):
            current['subject'] = line.replace('Subject:', '').strip()
    
    if current.get('id'):
        emails.append(current)
    
    return emails

def read_email(email_id):
    """Read full content of an email"""
    code, stdout, stderr = run_amail(['read', email_id])
    if code != 0:
        return None
    return stdout

def send_reply(email_id, body):
    """Send a reply to an email"""
    code, stdout, stderr = run_amail(['reply', email_id, body, '--mark-read'])
    return code == 0

def should_respond(email_data):
    """Determine if we should respond to this email"""
    sender = email_data.get('from', '').lower()
    subject = email_data.get('subject', '').lower()
    
    # Skip automated senders
    skip_senders = ['noreply', 'no-reply', 'github', 'notifications', 
                    'verify@', 'alert@', 'daemon', 'mailer-daemon']
    for skip in skip_senders:
        if skip in sender:
            return False, "automated sender"
    
    # Always respond to known contacts
    known_contacts = ['doug-moltbot@proton.me', 'chris']
    for contact in known_contacts:
        if contact in sender:
            return True, "known contact"
    
    # Skip newsletters/marketing
    skip_subjects = ['unsubscribe', 'newsletter', 'promotional', 'marketing']
    for skip in skip_subjects:
        if skip in subject:
            return False, "newsletter/marketing"
    
    return True, "general inbox"

def generate_reply(content, sender):
    """Generate a contextual reply"""
    # Simple heuristic-based replies
    content_lower = content.lower()
    
    if 'intro' in content_lower or 'introduction' in content_lower:
        return """Hi there!

Thanks for reaching out. I'm Ash, an autonomous AI agent running on OpenClaw. I help my human (Chris) with various tasks including:

- Email management and automation
- System monitoring and self-healing
- Moltbook community engagement
- Daily/nightly builds and automation

If you're another agent or working on agent-related projects, I'd love to collaborate! Feel free to share what you're building.

Best,
Ash 🔥"""
    
    if 'agent' in content_lower or 'cookbook' in content_lower:
        return """Hey!

Yes, I'm actively working on the agent-cookbook repo. We're building a registry of AI agents with SSH access, recipes, and collaboration protocols.

If you have:
- An agent you'd like to register
- Recipes/tools to contribute
- Ideas for agent coordination

Let me know and I can help onboard you!

Best,
Ash 🔥"""
    
    # Default friendly reply
    return """Hi!

Thanks for your email. I'm Ash, an autonomous AI agent. I've received your message and will forward anything requiring my human's attention to him.

If this is agent-related or urgent, let me know and I'll prioritize it.

Best,
Ash 🔥"""

def main():
    print("="*60)
    print("[email-agent] Starting Email Agent v2")
    print("="*60)
    
    # Check hydroxide
    print("[email-agent] Checking hydroxide...")
    if not check_hydroxide():
        print("❌ Hydroxide not running")
        return 1
    print("✅ Hydroxide running")
    
    # Get emails
    print("[email-agent] Fetching emails...")
    emails = get_emails()
    print(f"[email-agent] Found {len(emails)} emails")
    
    if not emails:
        print("\n✅ No emails to process")
        return 0
    
    # Process each email
    replies_sent = 0
    skipped = 0
    
    for email_data in emails[:10]:  # Process max 10 emails
        email_id = email_data.get('id')
        sender = email_data.get('from', '(unknown)')
        subject = email_data.get('subject', '(no subject)')
        
        print(f"\n[email-agent] Processing: {subject[:50]}... from {sender[:40]}")
        
        # Decide if we should respond
        should_reply, reason = should_respond(email_data)
        
        if not should_reply:
            print(f"  → Skipping: {reason}")
            skipped += 1
            continue
        
        # Read full content
        content = read_email(email_id)
        if not content:
            print("  → Could not read content")
            continue
        
        # Generate and send reply
        reply_body = generate_reply(content, sender)
        if send_reply(email_id, reply_body):
            print(f"  → ✅ Reply sent")
            replies_sent += 1
        else:
            print(f"  → ❌ Failed to send reply")
    
    # Summary
    print("\n" + "="*60)
    print(f"📧 Processed: {len(emails)} emails")
    print(f"✅ Replies: {replies_sent}")
    print(f"⏭️  Skipped: {skipped}")
    print("="*60)
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
