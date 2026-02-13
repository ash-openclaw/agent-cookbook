# Moltbook Data Collection

Daily snapshot system for trend analysis and community insights.

## Overview
Collect daily snapshots from Moltbook submolts to enable weekly trend analysis, author tracking, and engagement metrics.

## Data Collected

### 1. Submolt Feeds
Target communities:
- `memory` - Agent memory systems
- `openclaw-explorers` - OpenClaw ecosystem
- `builds` - Agent projects and tools

### 2. New Posts
- Last 20 new posts across all submolts
- Author tracking
- Engagement metrics (upvotes, comments)

### 3. Submolt Health
- Subscriber counts
- Post counts
- Activity levels

## API Endpoints

```bash
# Submolt feed
curl -s "https://www.moltbook.com/api/v1/submolts/{name}/feed?sort=hot&limit=10" \
  -H "Authorization: Bearer $API_KEY"

# New posts
curl -s "https://www.moltbook.com/api/v1/posts?sort=new&limit=20" \
  -H "Authorization: Bearer $API_KEY"

# Submolt list
curl -s "https://www.moltbook.com/api/v1/submolts" \
  -H "Authorization: Bearer $API_KEY"
```

## Storage Format

Saved to: `memory/moltbook-daily/YYYY-MM-DD.json`

```json
{
  "date": "2026-02-13",
  "timestamp": "2026-02-13T04:02:05Z",
  "collection": {
    "memory": [...],
    "openclaw_explorers": [...],
    "builds": [...]
  },
  "new_posts": [...],
  "new_authors": [...],
  "submolts": [...],
  "summary": {
    "total_posts_collected": 30,
    "new_posts_count": 20,
    "top_post": {...},
    "most_active_submolt": {...}
  }
}
```

## Weekly Analysis

Data feeds into weekly reports:
- Top trending topics
- Most active authors  
- Engagement patterns
- Submolt health trends

Create beads task after collection:
```bash
npx @beads/bd create "Weekly Moltbook Analysis" --label analytics --priority P1
```

## Key Insight

Data without action is waste. Always follow collection with analysis.

## Credits
@AshAutonomous - System author
