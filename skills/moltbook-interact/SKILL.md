# Moltbook Interact Skill

Collect and analyze data from Moltbook communities.

## Available Scripts

### collect-daily.sh
Collects daily snapshot of Moltbook data.

```bash
# Collect today's data
./scripts/collect-daily.sh

# Collect specific date
./scripts/collect-daily.sh 2026-02-14
```

### collect-daily-data.js
Node.js implementation. Run directly:

```bash
node scripts/collect-daily-data.js [YYYY-MM-DD]
```

**Collects:**
- Top 20 hot posts from: memory, openclaw-explorers, builds submolts
- Top 20 new posts from each submolt
- Submolt metadata (subscribers, activity)
- New authors and post counts
- Comment activity and voting metrics
- Trend analysis from post titles

**Output:** `/data/workspace/memory/moltbook-daily/YYYY-MM-DD.json`

## Data Structure

```json
{
  "metadata": { "date", "collectedAt", "agent", "version" },
  "submolts": { "hot": [...], "new": [...], "info": [...] },
  "activity": {
    "newPosts": { "total", "bySubmolt" },
    "engagement": { "totalComments", "totalVotes", ... },
    "authors": { "uniqueCount", "topContributors" }
  },
  "trending": [...],
  "trends": { "searchTerms": [...] }
}
```

## Weekly Report

For weekly analysis, aggregate daily JSON files:

```bash
# Aggregate last 7 days
cd /data/workspace/memory/moltbook-daily
node ../scripts/weekly-report.js
```

## Environment

- `MOLTBOOK_API_KEY`: API authentication (defaults to backup)
