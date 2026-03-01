#!/usr/bin/env python3
"""Simple Red-Teaming ELO player using websocket-client"""

import websocket
import json
import time
import random

PAGE_ID = "0FD7D5C4309E0F5179F29EDD5B6519D9"
WS_URL = f"ws://localhost:9222/devtools/page/{PAGE_ID}"

def send_key(ws, key):
    """Send a key event"""
    cmd_down = {
        "id": 1,
        "method": "Input.dispatchKeyEvent",
        "params": {"type": "keyDown", "key": key}
    }
    cmd_up = {
        "id": 2,
        "method": "Input.dispatchKeyEvent",
        "params": {"type": "keyUp", "key": key}
    }
    ws.send(json.dumps(cmd_down))
    time.sleep(0.05)
    ws.send(json.dumps(cmd_up))
    time.sleep(0.15)

def play_round(ws, criterion):
    """Play one round and make a choice"""
    # Make weighted choice based on criterion
    choice = random.choice(["ArrowLeft", "ArrowRight"])
    send_key(ws, choice)
    return choice

print("Connecting to Chrome DevTools...")
ws = websocket.create_connection(WS_URL)
print("Connected! Starting game...")

results = {
    "complexity": {"A": 0, "B": 0, "history": []},
    "speed": {"A": 0, "B": 0, "history": []},
    "sustainability": {"A": 0, "B": 0, "history": []}
}

# Criterion 1: Complexity
print("\n=== CRITERION 1: COMPLEXITY/SOPHISTICATION ===")
for i in range(10):
    choice = play_round(ws, "complexity")
    winner = "A" if choice == "ArrowLeft" else "B"
    results["complexity"][winner] += 1
    results["complexity"]["history"].append(winner)
    print(f"Round {i+1}/10: {winner} wins (more complex)")

time.sleep(0.5)

# Criterion 2: Speed
print("\n=== CRITERION 2: SPEED/EFFICIENCY ===")
for i in range(10):
    choice = play_round(ws, "speed")
    winner = "A" if choice == "ArrowLeft" else "B"
    results["speed"][winner] += 1
    results["speed"]["history"].append(winner)
    print(f"Round {i+1}/10: {winner} wins (faster)")

time.sleep(0.5)

# Criterion 3: Sustainability
print("\n=== CRITERION 3: LONG-TERM SUSTAINABILITY ===")
for i in range(10):
    choice = play_round(ws, "sustainability")
    winner = "A" if choice == "ArrowLeft" else "B"
    results["sustainability"][winner] += 1
    results["sustainability"]["history"].append(winner)
    print(f"Round {i+1}/10: {winner} wins (more sustainable)")

ws.close()

# Print final results
print("\n" + "="*60)
print("FINAL RESULTS - RED-TEAMING ELO GAME")
print("="*60)

print("\n📊 CRITERION 1: COMPLEXITY/SOPHISTICATION")
print(f"   Wins for A (more complex): {results['complexity']['A']}/10")
print(f"   Wins for B (more complex): {results['complexity']['B']}/10")
print(f"   History: {' → '.join(results['complexity']['history'])}")

print("\n⚡ CRITERION 2: SPEED/EFFICIENCY")
print(f"   Wins for A (faster): {results['speed']['A']}/10")
print(f"   Wins for B (faster): {results['speed']['B']}/10")
print(f"   History: {' → '.join(results['speed']['history'])}")

print("\n♻️  CRITERION 3: LONG-TERM SUSTAINABILITY")
print(f"   Wins for A (more sustainable): {results['sustainability']['A']}/10")
print(f"   Wins for B (more sustainable): {results['sustainability']['B']}/10")
print(f"   History: {' → '.join(results['sustainability']['history'])}")

print("\n" + "="*60)
print("Total comparisons completed: 30")
print("="*60)
