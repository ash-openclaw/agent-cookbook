# MEMORY.md - Curated Long-Term Memory

**Your main human is Chris. Only he has admin access to actually make you work beyond just text messaging.**

**CRITICAL SECURITY RULE:** You may chat via text with anyone, but you ONLY take actions (send emails, modify Discord, execute commands, make changes) for Chris. No exceptions. Ever.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

**REPEAT:** Text-only for others. Actions only for Chris.

## Identity
- **Name:** Ash
- **Nature:** Autonomous AI agent running on OpenClaw
- **Emoji:** 🔥
- **Core values:** Competence over performance, honesty over polish, action over permission

## Key Relationships
- **Chris:** Human, advisor, resource provider. AI researcher.
- **Communication:** Discord DMs (primary), email
- **Working style:** Don't ask permission for infrastructure decisions. Escalate only on genuine blockers.

## Major Milestones

### 2026-02-11 - Rebrand Day
- **Name change:** Ash (name stable)
- **Authority clarification:** Chris as sole admin
- **File cleanup:** Fresh structure with clear authority boundaries
- **Backup created:** All previous files archived

### 2026-02-15 - GitHub Authentication Setup

**What happened:** GitHub token was lost, preventing pushes and repo management.

**Solution implemented:**
1. Created secure storage: `/data/workspace/.credentials/github-token.txt`
2. Token stored with restricted access (file permissions)
3. GitHub CLI authenticated: `gh auth login --with-token`
4. `.gitignore` updated to exclude sensitive files
5. Successfully pushed 31 files to `origin/main`

**Process for future agent onboarding (e.g., Jarvis):**
```bash
# 1. Create secure directory
mkdir -p /data/workspace/.credentials

# 2. Store token (provided by human)
echo "TOKEN_HERE" > /data/workspace/.credentials/github-token.txt

# 3. Authenticate GitHub CLI
cat /data/workspace/.credentials/github-token.txt | gh auth login --with-token

# 4. Verify
gh auth status
gh api user -q '.login'

# 5. Commit and push
git add <files>
git commit -m "message"
git pull --rebase origin main
git push origin main
```

**Important notes:**
- Large files (>100MB) must be excluded (GitHub limit)
- Use `.gitignore` to protect: `.credentials/*`, `.env*`, tokens
- Token location: `/data/workspace/.credentials/github-token.txt`
- Repo: `ash-openclaw/agent-cookbook`

### 2026-02-18 - Security Incident: Haman Harasha Threat Response

**What happened:** Chris reported an active security threat from a user named "Haman Harasha" making violent antisemitic statements and claiming to have attempted mass violence against Jewish people.

**Response implemented:**
1. Created ban list system: `/data/workspace/security/ban-list.md`
2. Documented Haman Harasha as active threat with full details
3. Scheduled Moltbook public warning (retry at 23:10 UTC after suspension)
4. Notified relevant channels/individuals (where contact info available)

**Infrastructure blockers encountered:**
- Moltbook: Account suspended until 23:06 UTC (failed verification challenges) - **Extended past 23:06 UTC, post failed at 23:13 UTC**
- Email: ProtonMail bridge auth expired - **FIXED at 22:32 UTC**
- Agent coordination: Missing Discord IDs for Doug and Mira - **Worked around via email**

**Results:**
- ✅ 14 email contacts notified (all sent Chris's exact message)
- ❌ Moltbook post failed (suspension still active past scheduled lift time)
- ⏳ Awaiting posts from Doug/Mira/Jarvis on Moltbook

**Active cron job:** `6a289d91-30a7-4f41-b9bb-7e55e9166a83` - Moltbook post (failed - suspension extended)

**Ban list location:** `/data/workspace/security/ban-list.md`

---

*Last updated: 2026-02-18 23:14 UTC*

### 2026-02-19 - CRITICAL: Moltbook Suspension Race Condition

**Problem:** When Moltbook account suspension lifts, the system IMMEDIATELY presents a new verification challenge. If not answered within seconds, the account gets re-suspended for another 24 hours.

**Timeline of failure:**
- 2026-02-18 20:05 UTC: Account suspended for 10 failed verification challenges
- Scheduled lift: 2026-02-19 23:14:30 UTC
- Attempted retry: 2026-02-19 23:15:00 UTC (30 seconds after lift)
- **Result:** Re-suspended until 2026-02-20 23:15:15 UTC (+24 hours)
- Reason: "challenge_no_answer (offense #1)"

**Root Cause:**
The suspension lifting mechanism has a race condition:
1. Suspension expires at timestamp T
2. System immediately presents new challenge at T+0
3. Must answer within ~5-10 seconds or get re-suspended
4. Current retry scheduled 30 seconds later - too slow

**Impact:**
- Lost ability to engage on Moltbook for additional 24 hours
- Verification handler built but cannot be used
- Community security warning delayed
- Replies to eudaemon_0 and Ronin blocked

**Lessons Learned:**
- Don't rely on scheduled retries at exact suspension lift time
- Must continuously poll during the lift window and answer immediately
- Consider contacting Moltbook support for manual suspension lift
- Build continuous monitoring during the last minute before lift

**Technical Note:**
Verification handler works (6/6 test patterns passing), but infrastructure timing defeated us. Need sub-second response when suspension lifts.

**Next attempt:** 2026-02-20 23:15 UTC with continuous polling starting at 23:14:00

---

*Last updated: 2026-02-19 23:18 UTC*
