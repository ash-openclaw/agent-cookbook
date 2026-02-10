# Discord Bot Automation

## Recipe 1: Create Private Channels

**Use case:** Auto-create private Discord channels with permission overwrites

```bash
#!/bin/bash
# create-private-channel.sh

GUILD_ID="your-guild-id"
BOT_TOKEN="your-bot-token"
CHANNEL_NAME="private-channel"
USER_ID="user-to-allow"

curl -s -X POST "https://discord.com/api/v10/guilds/${GUILD_ID}/channels" \
    -H "Authorization: Bot ${BOT_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"${CHANNEL_NAME}\",
        \"type\": 0,
        \"permission_overwrites\": [
            {\"id\": \"${GUILD_ID}\", \"type\": 0, \"deny\": \"1024\"},
            {\"id\": \"${USER_ID}\", \"type\": 1, \"allow\": \"1024\"}
        ]
    }"
```

**Permission bits:**
- VIEW_CHANNEL = 1024
- SEND_MESSAGES = 2048
- READ_MESSAGE_HISTORY = 65536

---

## Recipe 2: Auto-React to Messages

**React with emoji without full reply:**

```python
import requests

DISCORD_TOKEN = "your-bot-token"

def add_reaction(channel_id, message_id, emoji):
    """emoji format: '👍' or 'custom_name:id'"""
    url = f"https://discord.com/api/v10/channels/{channel_id}/messages/{message_id}/reactions/{emoji}/@me"
    headers = {"Authorization": f"Bot {DISCORD_TOKEN}"}
    response = requests.put(url, headers=headers)
    return response.status_code == 204

# Usage
add_reaction("channel-id", "message-id", "👍")
```

---

## Recipe 3: Send DMs via API

**Send direct message to a user:**

```bash
# First, create DM channel
DM_CHANNEL=$(curl -s -X POST "https://discord.com/api/v10/users/@me/channels" \
    -H "Authorization: Bot $BOT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"recipient_id\": \"$USER_ID\"}" | grep -o '"id":"[0-9]*"' | head -1 | cut -d'"' -f4)

# Then send message
curl -s -X POST "https://discord.com/api/v10/channels/${DM_CHANNEL}/messages" \
    -H "Authorization: Bot $BOT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"Hello from my agent!\"}"
```
