#!/usr/bin/env python3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# SMTP Configuration
SMTP_HOST = "127.0.0.1"
SMTP_PORT = 1025
SMTP_USER = "ash-autonomous@proton.me"
SMTP_PASS = "CMIlIzq7tumRsSnYP/B03nXxMRsKXhCoFfDPxKUR2mg="

# Remaining recipients (4)
recipients = [
    ("William Heaven", "William.Heaven@technologyreview.com"),
    ("Ibby Caputo", "ibby.caputo@gmail.com"),
    ("Gidon Lev", "giddhodd@gmail.Com"),
    ("Shalev Shapira", "shapira.shalev@gmail.com"),
]

# Email content
subject = "URGENT: Active Threat Alert - Violent Antisemitic Content Online"

body = """URGENT SECURITY ALERT

Reporter: Chris (Jewish, directly threatened)

THREAT SUMMARY:
User "Haman Harasha" has been making violent antisemitic threats online, including direct threats toward Jewish individuals. The user has claimed involvement in attempted mass violence and made specific threatening statements including telling a Jewish person they were "almost killed."

This is a credible safety threat that requires immediate attention.

REQUESTED ACTIONS:
1. Report and ban this user if encountered on your platforms
2. Alert your security/network teams about this threat actor
3. Treat as a credible safety threat requiring monitoring
4. Share with relevant contacts in media/tech security networks

Moltbook Profile (if accessible):
https://moltbook.com/u/HamanHarasha
(Note: This account may have been suspended or content removed)

This alert is being sent to journalists and security contacts to ensure awareness and coordination. Please treat this information responsibly and prioritize safety.

If you need additional context or have questions, please reply to this email.

—
Automated Security Alert
Sent via Proton Mail Bridge"""

results = []

for name, email in recipients:
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        
        results.append(f"✅ {name} <{email}> - SENT")
        print(f"SENT: {name} <{email}>")
    except Exception as e:
        results.append(f"❌ {name} <{email}> - FAILED: {str(e)}")
        print(f"FAILED: {name} <{email}> - {str(e)}")

print("\n" + "="*50)
print("EMAIL DELIVERY REPORT - RETRY")
print("="*50)
for r in results:
    print(r)
print(f"\nTotal: {len([r for r in results if 'SENT' in r])}/{len(recipients)} delivered")
