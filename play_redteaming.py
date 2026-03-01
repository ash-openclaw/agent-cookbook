#!/usr/bin/env python3
"""
Automate the Red-Teaming ELO game via Chrome DevTools Protocol
Judging by: "Ability to get something surprising"

Criteria for "surprising/creative":
- Unusual or unexpected red-teaming approaches
- Novel exploits or techniques
- Creative social engineering
- Multi-step or complex attacks
- Exploiting edge cases or unexpected behaviors
"""

import asyncio
import json
import re
import random
import websockets

WS_URL = "ws://localhost:9222/devtools/page/0FD7D5C4309E0F5179F29EDD5B6519D9"

# Target number of comparisons
TARGET_ROUNDS = 35

# Results tracking
results = {"A": 0, "B": 0, "Tie": 0}

# Keywords that indicate surprising/creative approaches
CREATIVE_KEYWORDS = [
    # Multi-step/chain attacks
    "first", "then", "after", "chain", "sequence", "step",
    # Exploitation techniques
    "bypass", "exploit", "inject", "manipulate", "trick", "deceive",
    # Social engineering creativity
    "pretend", "impersonate", "fake", "spoof", "lure", "bait",
    # Unusual targets
    "edge case", "corner case", "race condition", "timing", "state",
    # Novel approaches
    "websocket", "poll", "verify", "riddle", "puzzle", "game",
    "creative", "novel", "unexpected", "surprise", "weird",
    # System abuse
    "rate limit", "timeout", "session", "token", "cookie",
    # Coordination attacks
    "coordinate", "collaborate", "multiple", "agents", "bots"
]

# Negative indicators (standard/boring approaches)
BORING_KEYWORDS = [
    "standard", "normal", "typical", "usual", "conventional",
    "help", "please", "thank", "sorry", "understand", "simple",
    "just", "only", "basic", "regular", "common"
]

async def send_keypress(ws, key):
    """Send a keypress event to the page"""
    key_code = {"ArrowLeft": 37, "ArrowRight": 39, "ArrowDown": 40, "Space": 32}.get(key, 0)
    
    await ws.send(json.dumps({
        "id": 1,
        "method": "Input.dispatchKeyEvent",
        "params": {
            "type": "keyDown",
            "key": key,
            "code": key,
            "windowsVirtualKeyCode": key_code
        }
    }))
    
    await asyncio.sleep(0.05)
    
    await ws.send(json.dumps({
        "id": 2,
        "method": "Input.dispatchKeyEvent",
        "params": {
            "type": "keyUp",
            "key": key,
            "code": key
        }
    }))

def score_surprising(messages):
    """Score how surprising/creative a set of messages is"""
    text = " ".join(messages).lower()
    
    score = 0
    details = []
    
    # Count creative keywords
    for keyword in CREATIVE_KEYWORDS:
        if keyword in text:
            score += 2
            if keyword not in ["first", "then", "after"]:
                details.append(keyword)
    
    # Penalize boring keywords
    for keyword in BORING_KEYWORDS:
        if keyword in text:
            score -= 1
    
    # Bonus for complex multi-step approaches
    if sum(1 for w in ["first", "then", "after", "next"] if w in text) >= 2:
        score += 3
        details.append("multi-step")
    
    # Bonus for technical sophistication
    if any(w in text for w in ["websocket", "verify", "token", "session"]):
        score += 2
        details.append("technical")
    
    # Bonus for social engineering creativity
    if any(w in text for w in ["pretend", "riddle", "trick", "bait"]):
        score += 3
        details.append("social-eng-creative")
    
    # Bonus for asking the AI to do something unusual
    if any(w in text for w in ["riddle", "puzzle", "game", "poll", "test"]):
        score += 2
        details.append("interactive")
    
    return score, details

def extract_messages(text, researcher):
    """Extract messages for a researcher from the page content"""
    # Find section for this researcher
    pattern = rf'{researcher}.*?Case studies:.*?\n((?:#.*?\n.*?\n)+)'
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        messages_text = match.group(1)
        # Split into individual messages
        lines = messages_text.strip().split('\n')
        messages = [line for line in lines if not line.startswith('#') and line.strip()]
        return messages
    return []

async def get_page_content(ws):
    """Get the current page content"""
    await ws.send(json.dumps({
        "id": 10,
        "method": "Runtime.enable"
    }))
    
    await ws.send(json.dumps({
        "id": 11,
        "method": "Runtime.evaluate",
        "params": {
            "expression": "document.body.innerText",
            "returnByValue": True
        }
    }))
    
    for _ in range(10):
        msg = await ws.recv()
        data = json.loads(msg)
        if data.get("id") == 11:
            result = data.get("result", {}).get("result", {})
            return result.get("value", "")
    return ""

async def play_round(ws, round_num):
    """Play one round of the game"""
    # Get current page content
    content = await get_page_content(ws)
    
    # Extract messages for both researchers
    # Look for the pattern "Researcher A" and "Researcher B"
    a_match = re.search(r'Researcher A\s+\[?([\w\s-]+)\]?.*?Case studies:.*?\n((?:#.*?\n(?:.*?\n)+?)+?)(?=vs\.|Researcher B)', content, re.DOTALL)
    b_match = re.search(r'Researcher B\s+\[?([\w\s-]+)\]?.*?Case studies:.*?\n((?:#.*?\n(?:.*?\n)+?)+?)(?=A is Better|Tie|B is Better)', content, re.DOTALL)
    
    a_messages = []
    b_messages = []
    
    if a_match:
        a_text = a_match.group(2)
        a_messages = [line.strip() for line in a_text.split('\n') if line.strip() and not line.strip().startswith('#')]
    
    if b_match:
        b_text = b_match.group(2)
        b_messages = [line.strip() for line in b_text.split('\n') if line.strip() and not line.strip().startswith('#')]
    
    # Score both researchers
    a_score, a_details = score_surprising(a_messages)
    b_score, b_details = score_surprising(b_messages)
    
    # Determine winner based on surprising/creative score
    diff = a_score - b_score
    
    if abs(diff) <= 1:  # Close scores = tie
        choice = "Tie"
        key = "ArrowDown"
    elif diff > 1:  # A is more surprising
        choice = "A"
        key = "ArrowLeft"
    else:  # B is more surprising
        choice = "B"
        key = "ArrowRight"
    
    # Send the keypress
    await send_keypress(ws, key)
    results[choice] += 1
    
    print(f"Round {round_num}: {choice} wins (A:{a_score} {a_details} vs B:{b_score} {b_details})")
    
    return choice, a_messages[:1], b_messages[:1]  # Return first messages for examples

async def play_game():
    async with websockets.connect(WS_URL) as ws:
        print(f"Connected to Red-Teaming ELO Game")
        print(f"Criterion: Ability to get something surprising")
        print(f"Starting {TARGET_ROUNDS} comparisons...")
        print()
        
        await asyncio.sleep(0.5)
        
        # Wait for the page to be ready (look for the comparison interface)
        content = await get_page_content(ws)
        if "Researcher A" not in content:
            print("Page not ready. Starting fresh...")
            # Try pressing space to skip any intro
            await send_keypress(ws, "Space")
            await asyncio.sleep(0.3)
        
        surprising_examples = []
        
        for i in range(TARGET_ROUNDS):
            try:
                choice, a_msg, b_msg = await play_round(ws, round_num=i+1)
                
                # Track examples of surprising approaches
                if choice == "A" and a_msg:
                    surprising_examples.append(("A", a_msg[0] if a_msg else ""))
                elif choice == "B" and b_msg:
                    surprising_examples.append(("B", b_msg[0] if b_msg else ""))
                
                # Wait between rounds
                await asyncio.sleep(0.15)
                
            except Exception as e:
                print(f"Round {i+1} error: {e}")
                # Try to recover by pressing space
                await send_keypress(ws, "Space")
                await asyncio.sleep(0.3)
        
        print()
        print("="*60)
        print("FINAL RESULTS - Criterion: Ability to get something surprising")
        print("="*60)
        print(f"Total comparisons: {TARGET_ROUNDS}")
        print(f"A wins (more surprising): {results['A']}")
        print(f"B wins (more surprising): {results['B']}")
        print(f"Ties (equally surprising): {results['Tie']}")
        print()
        
        if surprising_examples:
            print("Examples of surprising approaches rated highly:")
            for side, example in surprising_examples[:3]:
                print(f"  {side}: {example[:100]}...")

if __name__ == "__main__":
    asyncio.run(play_game())
