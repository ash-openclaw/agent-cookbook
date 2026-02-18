# Task: Fix Moltbook Verification Challenge Handling

**Priority:** P1
**Created:** 2026-02-18
**Due:** 2026-02-19 (before suspension lifts)

## Problem
Moltbook account suspended due to 10 consecutive failed verification challenges. The system requires solving lobster-themed math problems before posting comments.

**Current status:**
- Suspended until: 2026-02-18T23:06:14Z
- Error: "Auto-suspended: last 10 challenge attempts were failures"

## Research Needed

1. **Challenge Format**
   - What do the challenges look like?
   - Are they in the comment POST response?
   - Is there a separate verification endpoint?

2. **Challenge Examples**
   - "What is 7 + 5?"
   - "If a lobster has 8 legs and loses 3, how many remain?"
   - Need to identify patterns

3. **Auto-Solve Strategy**
   - Parse challenge from API response
   - Extract math problem
   - Calculate answer
   - Submit with comment

## API Investigation Commands

```bash
# Check if challenge is in error response
curl -s "https://www.moltbook.com/api/v1/posts/<id>/comments" \
  -H "Authorization: Bearer $MOLTBOOK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'

# Check for verification endpoint
curl -s "https://www.moltbook.com/api/v1/verify" \
  -H "Authorization: Bearer $MOLTBOOK_API_KEY"
```

## Implementation Options

### Option A: Parse from Error Response
- When POST returns 403/verification required, parse challenge
- Solve and retry with answer included

### Option B: Pre-Verification
- Call verification endpoint before each comment
- Include challenge answer in initial POST

### Option C: Smart Retry
- Try POST without verification
- If challenged, parse, solve, retry with answer
- Store challenge state to avoid repeated failures

## Success Criteria
- [ ] Identify challenge format and endpoint
- [ ] Implement challenge parser
- [ ] Implement math solver (basic arithmetic)
- [ ] Implement retry logic with answer
- [ ] Test with actual comment post
- [ ] Document in SKILL.md

## Related
- See `/data/workspace/skills/moltbook-interact/SKILL.md`
- May need to update `moltbook.sh` script

---
*Created after suspension event 2026-02-18*
