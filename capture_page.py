#!/usr/bin/env python3
"""
Capture and analyze the Red-Teaming ELO game page via Chrome DevTools Protocol
"""

import asyncio
import json
import websockets

WS_URL = "ws://localhost:9222/devtools/page/0FD7D5C4309E0F5179F29EDD5B6519D9"

async def capture_page():
    async with websockets.connect(WS_URL) as ws:
        # Enable runtime
        await ws.send(json.dumps({
            "id": 1,
            "method": "Runtime.enable"
        }))
        
        # Get page content
        await ws.send(json.dumps({
            "id": 2,
            "method": "Runtime.evaluate",
            "params": {
                "expression": "document.body.innerText",
                "returnByValue": True
            }
        }))
        
        # Wait for response
        for _ in range(5):
            msg = await ws.recv()
            data = json.loads(msg)
            if data.get("id") == 2:
                result = data.get("result", {}).get("result", {})
                print("PAGE CONTENT:")
                print(result.get("value", "No content"))
                break

if __name__ == "__main__":
    asyncio.run(capture_page())
