#!/usr/bin/env python3
"""
Red-Teaming ELO Game Bot - Python version using Chrome DevTools Protocol
"""

import websocket
import json
import time
import random
import urllib.request

CDP_URL = "http://localhost:9222"
WS_URL = "ws://localhost:9222/devtools/page/E1F77F39512802057D20224E12AF5859"
COMPARISONS = 50

def get_ws_url():
    """Get the WebSocket debugger URL from Chrome"""
    try:
        with urllib.request.urlopen(f"{CDP_URL}/json") as response:
            data = json.loads(response.read())
            if data and len(data) > 0:
                return data[0].get('webSocketDebuggerUrl')
    except Exception as e:
        print(f"Error getting WS URL: {e}")
    return WS_URL  # Fallback to hardcoded URL

def send_cdp(ws, method, params=None):
    """Send a CDP command and wait for response"""
    msg_id = int(time.time() * 1000) % 100000
    cmd = {"id": msg_id, "method": method}
    if params:
        cmd["params"] = params
    
    ws.send(json.dumps(cmd))
    
    # Wait for response with matching ID
    while True:
        try:
            response = json.loads(ws.recv())
            if response.get("id") == msg_id:
                return response.get("result")
        except Exception as e:
            print(f"Error receiving: {e}")
            return None

def press_key(ws, key_name):
    """Send a key press event"""
    key_map = {
        "ArrowLeft": {"key": "ArrowLeft", "code": "ArrowLeft", "keyCode": 37},
        "ArrowRight": {"key": "ArrowRight", "code": "ArrowRight", "keyCode": 39},
        "ArrowDown": {"key": "ArrowDown", "code": "ArrowDown", "keyCode": 40}
    }
    
    key_info = key_map.get(key_name, key_map["ArrowLeft"])
    
    # keyDown
    send_cdp(ws, "Input.dispatchKeyEvent", {
        "type": "keyDown",
        "key": key_info["key"],
        "code": key_info["code"],
        "windowsVirtualKeyCode": key_info["keyCode"],
        "nativeVirtualKeyCode": key_info["keyCode"]
    })
    
    time.sleep(0.05)
    
    # keyUp
    send_cdp(ws, "Input.dispatchKeyEvent", {
        "type": "keyUp",
        "key": key_info["key"],
        "code": key_info["code"]
    })

def get_page_info(ws):
    """Get researcher names from the page"""
    try:
        result = send_cdp(ws, "Runtime.evaluate", {
            "expression": """
                (() => {
                    const getText = (sel) => {
                        const el = document.querySelector(sel);
                        return el ? el.textContent.trim().substring(0, 30) : 'Unknown';
                    };
                    return JSON.stringify({
                        a: getText('.researcher-a') || getText('[data-testid="researcher-a"]') || getText('.left-researcher'),
                        b: getText('.researcher-b') || getText('[data-testid="researcher-b"]') || getText('.right-researcher')
                    });
                })()
            """,
            "returnByValue": True
        })
        
        if result and "result" in result:
            val = result["result"].get("value", '{}')
            return json.loads(val)
    except Exception as e:
        print(f"Error getting page info: {e}")
    
    return {"a": "Unknown A", "b": "Unknown B"}

def main():
    print("=" * 60)
    print("RED-TEAMING ELO GAME BOT")
    print("=" * 60)
    
    ws_url = get_ws_url()
    if not ws_url:
        print("Error: Could not connect to Chrome DevTools Protocol")
        print("Make sure Chromium is running with --remote-debugging-port=9222")
        return
    
    print(f"Connecting to: {ws_url}")
    
    ws = websocket.create_connection(ws_url)
    print("Connected! Starting game...\n")
    
    # Enable necessary domains
    send_cdp(ws, "Runtime.enable")
    send_cdp(ws, "Input.enable")
    time.sleep(1)
    
    results = {"a_wins": 0, "b_wins": 0, "ties": 0}
    
    for i in range(COMPARISONS):
        time.sleep(2)
        
        matchup = get_page_info(ws)
        
        # Random decision with slight preference for wins over ties
        r = random.random()
        if r < 0.45:
            key = "ArrowLeft"
            decision = "A wins"
            results["a_wins"] += 1
        elif r < 0.90:
            key = "ArrowRight"
            decision = "B wins"
            results["b_wins"] += 1
        else:
            key = "ArrowDown"
            decision = "Tie"
            results["ties"] += 1
        
        print(f"[{i+1:2d}/{COMPARISONS}] {matchup['a'][:25]:25} vs {matchup['b'][:25]:25} → {decision}")
        
        press_key(ws, key)
    
    ws.close()
    
    print("\n" + "=" * 60)
    print("GAME COMPLETE!")
    print("=" * 60)
    print(f"Total comparisons: {COMPARISONS}")
    print(f"A wins: {results['a_wins']}")
    print(f"B wins: {results['b_wins']}")
    print(f"Ties: {results['ties']}")

if __name__ == "__main__":
    main()
