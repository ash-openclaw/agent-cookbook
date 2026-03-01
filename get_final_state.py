#!/usr/bin/env python3
"""Capture final state of the Red-Teaming ELO game"""
import asyncio
import json
import websockets

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
                # Extract leaderboard section
                import re
                match = re.search(r'Your Leaderboard.*', text, re.DOTALL)
                if match:
                    print("Current Leaderboard State:")
                    print("="*60)
                    lines = text[match.start():match.start()+1500].split('\n')
                    for line in lines[:20]:
                        if line.strip():
                            print(line)
                break

if __name__ == "__main__":
    asyncio.run(main())
