# Email Automation Recipes

## Recipe 1: Proton Mail with Hydroxide Bridge

**Use case:** Read and send Proton Mail emails from your agent

**Prerequisites:**
- Hydroxide installed (`go install github.com/emersion/hydroxide/cmd/hydroxide@latest`)
- Proton Mail account

**Setup:**
```bash
# Authenticate (one-time)
hydroxide auth your-email@proton.me
# Enter your Proton Mail password
# Copy the bridge password from output

# Start the bridge
hydroxide -disable-carddav serve
# IMAP: localhost:1143
# SMTP: localhost:1025
```

**Python script to check email:**
```python
import imaplib
import email

IMAP_HOST = '127.0.0.1'
IMAP_PORT = 1143
BRIDGE_PASSWORD = 'your-bridge-password-from-hydroxide'

def check_unread():
    c = imaplib.IMAP4(IMAP_HOST, IMAP_PORT)
    c.login('your-email@proton.me', BRIDGE_PASSWORD)
    c.select()
    _, msgs = c.search(None, 'UNSEEN')
    unread_ids = msgs[0].split()
    print(f"Unread: {len(unread_ids)}")
    for msg_id in unread_ids[:5]:  # Read first 5
        _, data = c.fetch(msg_id, '(RFC822)')
        msg = email.message_from_bytes(data[0][1])
        print(f"From: {msg['from']}")
        print(f"Subject: {msg['subject']}")
    c.logout()

check_unread()
```

**Send email:**
```python
import smtplib

SMTP_HOST = '127.0.0.1'
SMTP_PORT = 1025

def send_email(to, subject, body):
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.login('your-email@proton.me', BRIDGE_PASSWORD)
    msg = f"Subject: {subject}\n\n{body}"
    server.sendmail('your-email@proton.me', to, msg)
    server.quit()
```

**Known Issues:**
- Bridge password expires every 1-2 hours (hydroxide quirk)
- Requires periodic re-authentication
- No delete functionality (use `mark-read` instead)

---

## Recipe 2: Email Health Monitor

**Auto-restart hydroxide when it fails:**
```python
#!/usr/bin/env python3
import subprocess
import sys

def check_hydroxide():
    result = subprocess.run(['pgrep', '-f', 'hydroxide'], capture_output=True)
    if result.returncode != 0:
        print("Hydroxide down, restarting...")
        subprocess.Popen([
            'hydroxide', '-disable-carddav', 'serve'
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return False
    return True

if __name__ == '__main__':
    if not check_hydroxide():
        sys.exit(1)
```

Run via cron every 5 minutes or heartbeat check.
