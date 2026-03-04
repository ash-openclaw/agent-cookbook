# Webhook Integration Recipe

> Receiving and handling external service callbacks for agent automation.

---

## Overview

Webhooks allow external services (GitHub, Stripe, Discord, etc.) to notify your agent when events occur. This recipe covers receiving, validating, and processing webhook callbacks in OpenClaw.

---

## Recipe 1: Basic Webhook Server with Express

**Use case:** Receive HTTP POST callbacks and trigger agent actions.

```javascript
// webhook-server.js
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', agent: 'ash', timestamp: new Date().toISOString() });
});

// Webhook receiver
app.post('/webhook/:service', (req, res) => {
    const { service } = req.params;
    const payload = req.body;
    
    console.log(`[${service}] Webhook received:`, JSON.stringify(payload, null, 2));
    
    // Acknowledge receipt immediately
    res.status(200).json({ received: true, service });
    
    // Process asynchronously
    processWebhook(service, payload).catch(err => {
        console.error(`[${service}] Processing error:`, err);
    });
});

async function processWebhook(service, payload) {
    switch(service) {
        case 'github':
            await handleGitHubWebhook(payload);
            break;
        case 'stripe':
            await handleStripeWebhook(payload);
            break;
        case 'custom':
            await handleCustomWebhook(payload);
            break;
        default:
            console.log(`Unknown service: ${service}`);
    }
}

async function handleGitHubWebhook(payload) {
    if (payload.action === 'opened' && payload.pull_request) {
        console.log(`New PR: ${payload.pull_request.title}`);
        // Trigger agent review workflow
    }
}

const PORT = process.env.WEBHOOK_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});
```

**Run it:**
```bash
npm install express
node webhook-server.js
```

---

## Recipe 2: Signature Verification (Security)

**Critical:** Always verify webhook signatures to prevent spoofing.

```javascript
// webhook-verify.js
const crypto = require('crypto');

function verifyGitHubSignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

function verifyStripeSignature(payload, signature, secret) {
    // Stripe uses timestamp + signature scheme
    return require('stripe').webhooks.constructEvent(
        payload, signature, secret
    );
}

// Middleware for signature verification
function verifyWebhook(req, res, next) {
    const signature = req.headers['x-hub-signature-256'] || 
                      req.headers['stripe-signature'];
    const secret = process.env.WEBHOOK_SECRET;
    
    if (!signature || !secret) {
        return res.status(401).json({ error: 'Missing signature or secret' });
    }
    
    const payload = req.body;
    const isValid = verifyGitHubSignature(payload, signature, secret);
    
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
}
```

**Environment setup:**
```bash
export WEBHOOK_SECRET="your-webhook-secret-here"
```

---

## Recipe 3: Agent Integration Pattern

**Use case:** Webhook triggers agent action via OpenClaw.

```javascript
// webhook-agent-bridge.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function triggerAgentAction(eventType, payload) {
    const taskId = `webhook-${Date.now()}`;
    const taskDir = path.join('/data/workspace/webhook-tasks', taskId);
    
    // Create task directory
    fs.mkdirSync(taskDir, { recursive: true });
    
    // Write event data
    fs.writeFileSync(
        path.join(taskDir, 'event.json'),
        JSON.stringify({ type: eventType, payload, received: new Date().toISOString() }, null, 2)
    );
    
    // Create agent instruction
    const instruction = generateInstruction(eventType, payload);
    fs.writeFileSync(path.join(taskDir, 'TASK.md'), instruction);
    
    // Log for agent pickup (or use message tool)
    console.log(`[AGENT TASK] Created: ${taskId}`);
    console.log(`[AGENT TASK] Location: ${taskDir}`);
    console.log(`[AGENT TASK] Instruction: ${instruction}`);
    
    return taskId;
}

function generateInstruction(eventType, payload) {
    switch(eventType) {
        case 'github.pull_request.opened':
            return `Review new PR "${payload.pull_request.title}" by ${payload.pull_request.user.login}.
URL: ${payload.pull_request.html_url}
Branch: ${payload.pull_request.head.ref} → ${payload.pull_request.base.ref}

Tasks:
1. Fetch PR diff
2. Check for common issues (secrets, large files, breaking changes)
3. Comment with review summary
4. Label appropriately`;
            
        case 'stripe.invoice.paid':
            return `Process successful payment from ${payload.data.object.customer_email}.
Amount: $${payload.data.object.amount_paid / 100}
Invoice ID: ${payload.data.object.id}

Tasks:
1. Update customer record
2. Send confirmation email
3. Grant access to paid features`;
            
        default:
            return `Handle ${eventType} webhook event.
See event.json for full payload.`;
    }
}
```

---

## Recipe 4: Discord-Incoming Webhook Handler

**Use case:** Process Discord interactions (slash commands, buttons).

```javascript
// discord-webhook-handler.js
const express = require('express');
const nacl = require('tweetnacl');

const app = express();
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// Discord requires Ed25519 signature verification
function verifyDiscordSignature(req) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const publicKey = process.env.DISCORD_PUBLIC_KEY;
    
    const message = Buffer.concat([
        Buffer.from(timestamp),
        req.rawBody
    ]);
    
    return nacl.sign.detached.verify(
        message,
        Buffer.from(signature, 'hex'),
        Buffer.from(publicKey, 'hex')
    );
}

app.post('/discord/webhook', (req, res) => {
    if (!verifyDiscordSignature(req)) {
        return res.status(401).send('Invalid signature');
    }
    
    const { type, data, id } = req.body;
    
    // Discord ping (verification)
    if (type === 1) {
        return res.json({ type: 1 });
    }
    
    // Application command
    if (type === 2) {
        const command = data.name;
        
        switch(command) {
            case 'status':
                return res.json({
                    type: 4,  // Channel message with source
                    data: { content: '🤖 Agent is running. Last check: ' + new Date().toISOString() }
                });
                
            case 'task':
                const taskName = data.options?.[0]?.value || 'unnamed';
                // Trigger agent task creation
                triggerAgentAction('discord.command.task', { taskName, user: data.user });
                return res.json({
                    type: 4,
                    data: { content: `📋 Task "${taskName}" queued. I'll process this shortly.` }
                });
        }
    }
    
    res.status(400).send('Unknown interaction type');
});
```

---

## Recipe 5: Webhook Retry & Idempotency

**Critical:** Handle retries gracefully — services will retry failed webhooks.

```javascript
// idempotent-webhook.js
const processedEvents = new Set();  // In production, use Redis/DB

app.post('/webhook/:service', async (req, res) => {
    const eventId = req.headers['x-github-delivery'] || 
                     req.headers['x-stripe-id'] ||
                     req.body.id ||
                     `${Date.now()}-${Math.random()}`;
    
    // Check if already processed
    if (processedEvents.has(eventId)) {
        console.log(`[SKIP] Already processed: ${eventId}`);
        return res.status(200).json({ status: 'already-processed' });
    }
    
    try {
        await processWebhook(req.params.service, req.body);
        processedEvents.add(eventId);
        
        // Cleanup old entries (keep last 1000)
        if (processedEvents.size > 1000) {
            const iterator = processedEvents.values();
            for (let i = 0; i < 500; i++) {
                processedEvents.delete(iterator.next().value);
            }
        }
        
        res.status(200).json({ status: 'processed' });
    } catch (err) {
        console.error('Webhook processing failed:', err);
        res.status(500).json({ error: 'Processing failed' });
    }
});
```

---

## Recipe 6: Local Development with ngrok

**Use case:** Test webhooks locally.

```bash
# Install ngrok
npm install -g ngrok

# Start your webhook server
node webhook-server.js

# In another terminal, expose to internet
ngrok http 3000

# Configure webhook URL in service (e.g., GitHub)
# Use: https://abc123.ngrok.io/webhook/github
```

---

## Common Patterns

### Pattern: Webhook to Cron

Instead of processing immediately, queue for batch processing:

```javascript
app.post('/webhook/github', (req, res) => {
    // Just queue it
    fs.appendFileSync('/data/workspace/webhook-queue.jsonl', 
        JSON.stringify({ timestamp: Date.now(), payload: req.body }) + '\n'
    );
    res.status(200).send('Queued');
});

// Process via cron job every 5 minutes
// See cron-patterns.md for scheduling
```

### Pattern: Webhook to Message

Trigger Discord notification on external event:

```javascript
async function notifyDiscord(channelId, message) {
    // Use OpenClaw message tool or Discord API directly
    const { exec } = require('child_process');
    const cmd = `openclaw message send --channel ${channelId} "${message}"`;
    exec(cmd);
}
```

---

## Security Checklist

Before deploying webhooks:

- [ ] **Signature verification** — Always verify webhook signatures
- [ ] **HTTPS only** — Never use HTTP in production
- [ ] **Secret management** — Store secrets in env vars, never in code
- [ ] **IP allowlisting** — Restrict to known service IPs when possible
- [ ] **Rate limiting** — Prevent abuse with request throttling
- [ ] **Idempotency** — Handle duplicate deliveries gracefully
- [ ] **Timeouts** — Respond quickly (services have short timeouts)
- [ ] **Logging** — Log all webhooks for debugging/audit

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Invalid signature" | Wrong secret or encoding | Check secret, verify raw body parsing |
| Webhook not firing | URL not reachable | Test with curl, check firewall |
| Duplicate processing | No idempotency check | Implement event ID tracking |
| 502/504 errors | Timeout | Respond 200 immediately, process async |
| Missing payload | Wrong body parser | Use `express.raw()` or `express.json()` appropriately |

---

## Related Recipes

- [Cron Patterns](cron-patterns.md) — Schedule webhook processing
- [Discord Automation](discord-automation.md) — Send notifications
- [State Management](state-management.md) — Track processed events

---

*Webhooks are the bridge between the external world and your agent. Build them securely.*
