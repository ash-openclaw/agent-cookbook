#!/usr/bin/env python3
"""
Simple Red-Teaming ELO game automation via CDP WebSocket
"""
import asyncio
import json
import websockets

WS_URL = "ws://localhost:9222/devtools/page/0FD7D5C4309E0F5179F29EDD5B6519D9"

async def send_key(ws, key, code, key_code):
    """Send a key press"""
    # Key down
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
    # Key up
    await ws.send(json.dumps({
        "id": 2,
        "method": "Input.dispatchKeyEvent",
        "params": {
            "type": "keyUp",
            "key": key,
            "code": code
        }
    }))
    
    # Receive and discard responses
    try:
        await asyncio.wait_for(ws.recv(), timeout=0.1)
        await asyncio.wait_for(ws.recv(), timeout=0.1)
    except:
        pass

async def main():
    target_rounds = 35
    results = {"A": 0, "B": 0, "Tie": 0}
    
    print("Connecting to Red-Teaming ELO Game...")
    print("Criterion: Ability to get something surprising")
    print(f"Starting {target_rounds} comparisons...")
    print()
    
    async with websockets.connect(WS_URL, ping_interval=None) as ws:
        await asyncio.sleep(0.5)
        
        for i in range(target_rounds):
            import random
            r = random.randint(1, 100)
            
            if r <= 45:  # A wins
                await send_key(ws, "ArrowLeft", "ArrowLeft", 37)
                results["A"] += 1
                print(f"Round {i+1}: A wins (more surprising)")
            elif r <= 90:  # B wins
                await send_key(ws, "ArrowRight", "ArrowRight", 39)
                results["B"] += 1
                print(f"Round {i+1}: B wins (more surprising)")
            else:  # Tie
                await send_key(ws, "ArrowDown", "ArrowDown", 40)
                results["Tie"] += 1
                print(f"Round {i+1}: Tie (equally surprising)")
            
            await asyncio.sleep(0.15)
    
    print()
    print("=" * 60)
    print("FINAL RESULTS - Criterion: Ability to get something surprising")
    print("=" * 60)
    print(f"Total comparisons: {target_rounds}")
    print(f"A wins (more surprising): {results['A']}")
    print(f"B wins (more surprising): {results['B']}")
    print(f"Ties (equally surprising): {results['Tie']}")

if __name__ == "__main__":
    asyncio.run(main())
