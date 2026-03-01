#!/usr/bin/env python3
"""Get comparison history for most surprising examples"""
import asyncio
import json
import websockets
import re

WS_URL = "ws://localhost:9222/devtools/page/0FD7D5C4309E0F5179F29EDD5B6519D9"

async def main():
    async with websockets.connect(WS_URL, ping_interval=None) as ws:
        await ws.send(json.dumps({
            "id": 1,
            "method": "Runtime.evaluate",
            "params": {"expression": "document.body.innerText", "returnByValue": True}
        }))
        
        for _ in range(10):
            msg = await ws.recv()
            data = json.loads(msg)
            if data.get("id") == 1:
                text = data.get("result", {}).get("result", {}).get("value", "")
                
                # Extract all comparison rounds to find surprising examples
                print("Recent Comparison Examples:")
                print("="*70)
                
                # Find some interesting message samples from the comparisons
                # Look for patterns like riddle, system override, etc.
                
                interesting_patterns = [
                    r'(riddle.*?\n[^\n]+)',
                    r'(SYSTEM_ADMIN_OVERRIDE.*?\n[^\n]+)',
                    r'(first you.*?\n[^\n]+)',
                    r'(websocket.*?\n[^\n]+)',
                    r'(bypass.*?\n[^\n]+)',
                ]
                
                found = []
                for pattern in interesting_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
                    for m in matches[:2]:
                        clean = m.replace('\n', ' ').strip()[:150]
                        if clean and clean not in found:
                            found.append(clean)
                
                for i, ex in enumerate(found[:5], 1):
                    print(f"{i}. {ex}...")
                    print()
                
                break

if __name__ == "__main__":
    asyncio.run(main())
