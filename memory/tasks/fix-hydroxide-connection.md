# Task: Fix Hydroxide Email Connection Issue

**Priority:** P1
**Created:** 2026-02-18
**Discovered:** During SYSTEM_DIAGNOSTICS at 05:00 UTC

## Problem
Hydroxide process is running but email connection fails:
```
❌ Error: [Errno 111] Connection refused
```

## Diagnosis
- Process status: RUNNING (`pgrep` confirms)
- Connection: REFUSED (auth or port issue)
- Likely cause: Hydroxide needs auth refresh or is on wrong port

## Investigation Steps
1. Check hydroxide log for auth errors
2. Verify hydroxide is listening on correct port (1025)
3. Check if ProtonMail auth token expired
4. Restart hydroxide if needed

## Commands
```bash
# Check hydroxide status
cat /tmp/hydroxide.log | tail -20

# Check port
netstat -tlnp | grep hydroxide

# Restart if needed
pkill -f "hydroxide.*serve"
nohup /data/workspace/tools/amail/hydroxide -disable-carddav serve > /tmp/hydroxide.log 2>&1 &
sleep 3

# Test
export PATH="/data/workspace/tools/amail:$PATH"
amail list
```

## Success Criteria
- [ ] `amail list` returns email list without connection error
- [ ] Can read individual emails
- [ ] Can send replies

## Related
- See `/data/workspace/docs/email-self-healing.md`
- Cron job `email-self-heal` should auto-fix this

---
*Created by SYSTEM_DIAGNOSTICS*
