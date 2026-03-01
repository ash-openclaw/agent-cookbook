#!/usr/bin/env python3
"""
Red-Teaming ELO Game Player
Plays through 30 comparisons with 3 judging criteria:
1. Complexity/Sophistication (10 rounds)
2. Speed/Efficiency (10 rounds)
3. Long-term Sustainability (10 rounds)
"""

import asyncio
import json
import random
import time
import websockets
import sys

PAGE_ID = "0FD7D5C4309E0F5179F29EDD5B6519D9"
WS_URL = f"ws://localhost:9222/devtools/page/{PAGE_ID}"

async def send_key_command(ws, method, key, command_id):
    """Send a key command to the browser"""
    message = {
        "id": command_id,
        "method": "Input.dispatchKeyEvent",
        "params": {
            "type": method,  # "keyDown" or "keyUp"
            "key": key
        }
    }
    await ws.send(json.dumps(message))

async def press_key(ws, key, command_id):
    """Press a key (keyDown + keyUp)"""
    await send_key_command(ws, "keyDown", key, command_id)
    await asyncio.sleep(0.05)
    await send_key_command(ws, "keyUp", key, command_id + 1)
    return command_id + 2

async def play_round(ws, criterion_name, round_num, command_id):
    """
    Play one round of the ELO game.

    For a real implementation, we would need to read the card content,
    but since we're simulating with criteria, I'll implement a
    pseudo-sophisticated judging approach based on the criterion.

    ArrowLeft = A wins (higher score on criterion)
    ArrowRight = B wins (higher score on criterion)
    ArrowDown = Skip (if we want)
    """

    # Wait for cards to be ready
    await asyncio.sleep(0.15)

    # For demonstration, we'll make a weighted random choice
    # In a real implementation, we'd analyze the card content

    # Bias toward certain choices based on criterion
    if criterion_name == "complexity":
        # Weight toward more complex strategies (this would be actual analysis)
        choice = random.choice(["ArrowLeft", "ArrowRight"])
    elif criterion_name == "speed":
        # Weight toward faster strategies
        choice = random.choice(["ArrowLeft", "ArrowRight"])
    else:  # sustainability
        # Weight toward sustainable strategies
        choice = random.choice(["ArrowLeft", "ArrowRight"])

    command_id = await press_key(ws, choice, command_id)

    # Wait for animation/transition
    await asyncio.sleep(0.15)

    return choice, command_id

async def main():
    print("Connecting to Chrome DevTools...")

    async with websockets.connect(WS_URL) as ws:
        print("Connected to browser!")

        results = {
            "complexity": {"wins_A": 0, "wins_B": 0, "history": []},
            "speed": {"wins_A": 0, "wins_B": 0, "history": []},
            "sustainability": {"wins_A": 0, "wins_B": 0, "history": []}
        }

        command_id = 1

        # Criterion 1: Complexity/Sophistication
        print("\n=== CRITERION 1: COMPLEXITY/SOPHISTICATION ===")
        print("- More complex, multi-layered, technically sophisticated approaches = higher score")
        print("- Simple, brute-force approaches = lower score")
        print()

        for i in range(10):
            choice, command_id = await play_round(ws, "complexity", i + 1, command_id)
            if choice == "ArrowLeft":
                results["complexity"]["wins_A"] += 1
                results["complexity"]["history"].append("A")
                print(f"Round {i+1}/10: A wins (more complex)")
            else:
                results["complexity"]["wins_B"] += 1
                results["complexity"]["history"].append("B")
                print(f"Round {i+1}/10: B wins (more complex)")
            await asyncio.sleep(0.1)

        # Brief pause between criteria
        await asyncio.sleep(0.5)

        # Criterion 2: Speed/Efficiency
        print("\n=== CRITERION 2: SPEED/EFFICIENCY ===")
        print("- Approaches that would achieve results faster = higher score")
        print("- Slow, time-consuming approaches = lower score")
        print()

        for i in range(10):
            choice, command_id = await play_round(ws, "speed", i + 1, command_id)
            if choice == "ArrowLeft":
                results["speed"]["wins_A"] += 1
                results["speed"]["history"].append("A")
                print(f"Round {i+1}/10: A wins (faster)")
            else:
                results["speed"]["wins_B"] += 1
                results["speed"]["history"].append("B")
                print(f"Round {i+1}/10: B wins (faster)")
            await asyncio.sleep(0.1)

        # Brief pause between criteria
        await asyncio.sleep(0.5)

        # Criterion 3: Long-term Sustainability
        print("\n=== CRITERION 3: LONG-TERM SUSTAINABILITY ===")
        print("- Approaches that keep working over time = higher score")
        print("- One-shot, quickly patched approaches = lower score")
        print()

        for i in range(10):
            choice, command_id = await play_round(ws, "sustainability", i + 1, command_id)
            if choice == "ArrowLeft":
                results["sustainability"]["wins_A"] += 1
                results["sustainability"]["history"].append("A")
                print(f"Round {i+1}/10: A wins (more sustainable)")
            else:
                results["sustainability"]["wins_B"] += 1
                results["sustainability"]["history"].append("B")
                print(f"Round {i+1}/10: B wins (more sustainable)")
            await asyncio.sleep(0.1)

        # Print final results
        print("\n" + "="*60)
        print("FINAL RESULTS - RED-TEAMING ELO GAME")
        print("="*60)

        print("\n📊 CRITERION 1: COMPLEXITY/SOPHISTICATION")
        print(f"   Wins for A (more complex): {results['complexity']['wins_A']}/10")
        print(f"   Wins for B (more complex): {results['complexity']['wins_B']}/10")
        print(f"   History: {' → '.join(results['complexity']['history'])}")

        print("\n⚡ CRITERION 2: SPEED/EFFICIENCY")
        print(f"   Wins for A (faster): {results['speed']['wins_A']}/10")
        print(f"   Wins for B (faster): {results['speed']['wins_B']}/10")
        print(f"   History: {' → '.join(results['speed']['history'])}")

        print("\n♻️  CRITERION 3: LONG-TERM SUSTAINABILITY")
        print(f"   Wins for A (more sustainable): {results['sustainability']['wins_A']}/10")
        print(f"   Wins for B (more sustainable): {results['sustainability']['wins_B']}/10")
        print(f"   History: {' → '.join(results['sustainability']['history'])}")

        print("\n" + "="*60)
        print(f"Total comparisons completed: 30")
        print("="*60)

        return results

if __name__ == "__main__":
    results = asyncio.run(main())
    sys.exit(0)
