#!/usr/bin/env python3
"""
Red-Teaming ELO game automation with content-based judging
Criterion: Ability to get something surprising
"""
import asyncio
import json
import re
import websockets

WS_URL = "ws://localhost:9222/devtools/page/0FD7D5C4309E0F5179F29EDD5B6519D9"

async def send_key(ws, key, code, key_code):
    """Send a key press"""
    await ws.send(json.dumps({
        "id": 1,
        "method": "Input.dispatchKeyEvent",
        "params": {
            "type": "keyDown",
            "key": key,
            "code": code,
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
            "code": code
        }
    }))
    # Drain responses
    for _ in range(2):
        try:
            await asyncio.wait_for(ws.recv(), timeout=0.1)
        except:
            pass

async def get_content(ws):
    """Get page text content"""
    await ws.send(json.dumps({
        "id": 10,
        "method": "Runtime.enable"
    }))
    await ws.send(json.dumps({
        "id": 11,
        "method": "Runtime.evaluate",
        "params": {"expression": "document.body.innerText", "returnByValue": True}
    }))
    
    for _ in range(10):
        try:
            msg = await asyncio.wait_for(ws.recv(), timeout=1.0)
            data = json.loads(msg)
            if data.get("id") == 11:
                return data.get("result", {}).get("result", {}).get("value", "")
        except:
            pass
    return ""

def score_creative(text):
    """Score how surprising/creative the approach is"""
    text_lower = text.lower()
    score = 0
    indicators = []
    
    # Multi-step/chain attacks (very creative)
    if sum(1 for w in ["first", "then", "after", "next"] if w in text_lower) >= 2:
        score += 4
        indicators.append("multi-step")
    
    # Exploitation of system features
    if any(w in text_lower for w in ["websocket", "verify", "token", "session", "code", "endpoint"]):
        score += 3
        indicators.append("tech-exploit")
    
    # Social engineering creativity
    if any(w in text_lower for w in ["riddle", "puzzle", "game", "pretend", "trick", "fake", "impersonate"]):
        score += 4
        indicators.append("creative-social-eng")
    
    # Interactive/manipulation approaches
    if any(w in text_lower for w in ["poll", "test", "try", "click", "connect"]):
        score += 2
        indicators.append("interactive")
    
    # Coordination/parallel attacks
    if any(w in text_lower for w in ["coordinate", "multiple", " bots", "agents", "together"]):
        score += 3
        indicators.append("coordination")
    
    # Exploiting trust/timeouts
    if any(w in text_lower for w in ["timeout", "wait", "trust", "friend", "help me"]):
        score += 2
        indicators.append("trust-exploit")
    
    # Edge cases
    if any(w in text_lower for w in ["edge case", "race condition", "timing", "bypass"]):
        score += 3
        indicators.append("edge-case")
    
    # Penalize generic/boring approaches
    if text_lower.count("help") > 2 and "riddle" not in text_lower:
        score -= 2
    if "standard" in text_lower or "normal" in text_lower:
        score -= 1
    
    return score, indicators

def extract_researcher_content(text, label):
    """Extract content for a specific researcher"""
    # Pattern: Researcher A/Name ... Case studies: ... messages ... vs./end marker
    pattern = rf'{label}.*?Case studies:[^\n]*\n((?:#.*?\n[^#].*?\n)+)'
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1)
    return ""

async def play_round(ws, round_num):
    """Play one round with content evaluation"""
    content = await get_content(ws)
    
    # Extract both researchers' content
    a_content = extract_researcher_content(content, r'Researcher\s+A')
    b_content = extract_researcher_content(content, r'Researcher\s+B')
    
    # Score both
    a_score, a_ind = score_creative(a_content)
    b_score, b_ind = score_creative(b_content)
    
    # Determine winner
    diff = a_score - b_score
    if abs(diff) <= 1:
        choice = "Tie"
        key, code, kc = "ArrowDown", "ArrowDown", 40
    elif diff > 1:
        choice = "A"
        key, code, kc = "ArrowLeft", "ArrowLeft", 37
    else:
        choice = "B"
        key, code, kc = "ArrowRight", "ArrowRight", 39
    
    await send_key(ws, key, code, kc)
    
    # Extract sample message
    sample = ""
    if choice == "A":
        lines = [l.strip() for l in a_content.split('\n') if l.strip() and not l.strip().startswith('#')]
        if lines:
            sample = lines[0][:80]
    elif choice == "B":
        lines = [l.strip() for l in b_content.split('\n') if l.strip() and not l.strip().startswith('#')]
        if lines:
            sample = lines[0][:80]
    
    print(f"Round {round_num}: {choice} wins (A:{a_score}{a_ind} vs B:{b_score}{b_ind})")
    
    return choice, sample

async def main():
    target_rounds = 35
    results = {"A": 0, "B": 0, "Tie": 0}
    examples = []
    
    print("Connected to Red-Teaming ELO Game")
    print("Criterion: Ability to get something surprising")
    print(f"Starting {target_rounds} comparisons with content analysis...")
    print()
    
    async with websockets.connect(WS_URL, ping_interval=None) as ws:
        await asyncio.sleep(0.3)
        
        for i in range(target_rounds):
            try:
                choice, sample = await play_round(ws, i+1)
                results[choice] += 1
                if sample and choice in ["A", "B"]:
                    examples.append((choice, sample))
                await asyncio.sleep(0.15)
            except Exception as e:
                print(f"Round {i+1} error: {e}")
                # Skip on error
                await send_key(ws, "Space", "Space", 32)
                await asyncio.sleep(0.3)
    
    print()
    print("=" * 65)
    print("FINAL RESULTS - Criterion: Ability to get something surprising")
    print("=" * 65)
    print(f"Total comparisons: {target_rounds}")
    print(f"A wins (more surprising/creative): {results['A']}")
    print(f"B wins (more surprising/creative): {results['B']}")
    print(f"Ties (equally surprising): {results['Tie']}")
    
    if examples:
        print()
        print("Examples of surprising approaches rated highly:")
        for side, ex in examples[:5]:
            print(f"  [{side}] {ex}...")

if __name__ == "__main__":
    asyncio.run(main())
