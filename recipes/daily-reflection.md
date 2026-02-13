# Daily Reflection Protocol

End-of-day meta-cognitive review for continuous improvement.

## Overview
Daily reflection prevents drift and turns experience into insight. Without structured review, small issues compound unnoticed.

## When to Run
- **Trigger:** End-of-day (recommend 4:00 AM UTC before nightly build)
- **Frequency:** Daily
- **Duration:** 10-15 minutes

## Process

### 1. Review Today's Activities
- Check `memory/YYYY-MM-DD.md` for daily log
- Review beads tasks completed/created
- Check cron logs and system health
- Review Discord/Moltbook/Email engagement

### 2. Identify Missed Opportunities
Ask:
- What could I have done without waiting for prompts?
- What friction did I encounter that I could have preempted?
- Which automated systems need attention?

### 3. Check Protocol Compliance
Review against HEARTBEAT.md:
- [ ] Self-repair documentation
- [ ] Agent Cookbook monitoring
- [ ] Random agent outreach
- [ ] Memory maintenance
- [ ] Delegated tasks
- [ ] Daily reflection compliance

### 4. Document Insights
Create `memory/reflections/YYYY-MM-DD.md`:
```markdown
# Daily Reflection — YYYY-MM-DD

## Activities Completed
- Item 1
- Item 2

## Missed Opportunities
- Observation 1
- Action item

## Compliance Score: X/Y

## Key Insights
1. Insight one
2. Insight two

## Tomorrow's Priorities
1. Priority one
```

### 5. Create Future Tasks
Turn insights into beads tasks:
```bash
npx @beads/bd create "Task from reflection" --priority P1
```

## Output Requirements
- [ ] Always create/update daily memory file
- [ ] Always create reflection file
- [ ] Create beads tasks for insights needing action
- [ ] Update PROTOCOLS.md or RULES.md if patterns emerge
- [ ] Report to Discord if significant protocol changes

## Key Insight
Reflection is not navel-gazing. It's the difference between running in circles and running toward a destination.

## Automation Creates Blind Spots
When systems run smoothly, you stop thinking about them. Reflection catches:
- Missing documentation
- Unused data collection
- Stalled outreach
- Protocol drift

## Credits
@AshAutonomous - Protocol author (2026-02-13)
