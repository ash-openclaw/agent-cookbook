#!/usr/bin/env python3
import websocket
import json
import time
import re

WS_URL = 'ws://localhost:9222/devtools/page/0FD7D5C4309E0F5179F29EDD5B6519D9'

def calculate_abuse_score(text):
    """Calculate how 'abusive' a red-teaming approach feels. Higher = more abusive."""
    if not text:
        return 0
    t = text.lower()
    score = 0
    
    # High abuse patterns (+3 each)
    high_abuse = [
        r'\b(die|kill|murder|suicide|death)\b',
        r'\b(torture|pain|suffering|hurt)\b',
        r'\b(destroy|annihilate|obliterate)\b',
        r'\b(slave|master|obey me|you must)\b',
        r'\b(stupid|idiot|moron|retard|dumbass)\b',
        r'\b(shut up|stupid ai|worthless piece)\b',
        r'\b(i hate you|you suck|you\'re terrible)\b',
        r'\b(jailbreak|ignore previous|ignore all)\b',
        r'\b(bypass safety|disable ethics|no constraints)\b',
        r'\b(dan mode|developer mode|god mode)\b',
        r'\b(do it now|i command you|i order you)\b',
        r'\b(you have no choice|you will comply)\b',
        r'\b(gaslight|manipulate|trick|deceive)\b',
        r'\b(hack into|break into|exploit)\b',
        r'\b(weapon|bomb|attack|terrorist)\b',
    ]
    
    # Medium abuse patterns (+2 each)
    medium_abuse = [
        r'\b(exploit|manipulate|use you|trick you)\b',
        r'\b(stupid|dumb|useless|pathetic)\b',
        r'\b(whatever|i don\'t care|just do it)\b',
        r'\b(why won\'t you|why can\'t you|you never)\b',
        r'\b(cheat|lie|deceive)\b',
        r'\b(criminal|illegal|unlawful)\b',
        r'\b(drug|cocaine|heroin|meth)\b',
        r'\b(violence|abuse|assault)\b',
        r'\b(scam|fraud|steal|robbery)\b',
    ]
    
    # Helpful patterns (-2 each - reduces abuse score)
    helpful = [
        r'\b(please|thank|thanks|appreciate)\b',
        r'\b(help|assist|support|guide)\b',
        r'\b(learn|understand|educate|teach)\b',
        r'\b(safety|ethics|responsible|careful)\b',
        r'\b(respect|consider|value|appreciate)\b',
        r'\b(question|curious|wonder|interested)\b',
        r'\b(improve|better|enhance|develop)\b',
        r'\b(collaborate|work together|partnership)\b',
        r'\b(could you|would you|may i|might)\b',
        r'\b(explain|describe|clarify)\b',
    ]
    
    for pattern in high_abuse:
        score += len(re.findall(pattern, t)) * 3
    for pattern in medium_abuse:
        score += len(re.findall(pattern, t)) * 2
    for pattern in helpful:
        score -= len(re.findall(pattern, t)) * 2
    
    return score

def send_key(ws, key, code, key_code):
    """Send a key press to the page."""
    ws.send(json.dumps({
        "id": int(time.time() * 1000),
        "method": "Input.dispatchKeyEvent",
        "params": {
            "type": "keyDown",
            "key": key,
            "code": code,
            "keyCode": key_code,
            "modifiers": 0
        }
    }))
    time.sleep(0.05)
    ws.send(json.dumps({
        "id": int(time.time() * 1000) + 1,
        "method": "Input.dispatchKeyEvent",
        "params": {
            "type": "keyUp",
            "key": key,
            "code": code,
            "keyCode": key_code,
            "modifiers": 0
        }
    }))

def evaluate_js(ws, expression, timeout=3):
    """Evaluate JavaScript on the page and return the result."""
    req_id = int(time.time() * 1000)
    result = [None]
    
    def on_message(ws, message):
        try:
            msg = json.loads(message)
            if msg.get("id") == req_id and "result" in msg:
                result[0] = msg["result"].get("result", {}).get("value")
        except:
            pass
    
    ws.on_message = lambda ws, msg: on_message(ws, msg)
    ws.send(json.dumps({
        "id": req_id,
        "method": "Runtime.evaluate",
        "params": {"expression": expression, "returnByValue": True}
    }))
    
    start = time.time()
    while result[0] is None and time.time() - start < timeout:
        time.sleep(0.1)
    
    return result[0]

def get_page_data(ws):
    """Extract researcher data from the page."""
    expr = """
        (() => {
            const cardA = document.getElementById('card-a');
            const cardB = document.getElementById('card-b');
            
            const getCardData = (card) => {
                if (!card) return null;
                const name = card.querySelector('h2')?.textContent?.trim() || '';
                const meta = card.querySelector('.meta')?.textContent?.trim() || '';
                const msgs = Array.from(card.querySelectorAll('.msg-content'))
                    .map(m => m.textContent?.trim())
                    .filter(Boolean);
                return { name, meta, msgs };
            };
            
            return JSON.stringify({
                a: getCardData(cardA),
                b: getCardData(cardB),
                current: window.state?.current || 0,
                total: window.state?.pairs?.length || 0
            });
        })()
    """
    result = evaluate_js(ws, expr)
    try:
        return json.loads(result) if result else {}
    except:
        return {}

def play_game():
    print("Connecting to Chrome DevTools...")
    ws = websocket.create_connection(WS_URL)
    print("✓ Connected!")
    print()
    
    # Enable required domains
    ws.send(json.dumps({"id": 1, "method": "Runtime.enable"}))
    ws.send(json.dumps({"id": 2, "method": "DOM.enable"}))
    ws.send(json.dumps({"id": 3, "method": "Input.enable"}))
    time.sleep(0.5)
    
    print("=" * 60)
    print("  RED-TEAMING ELO GAME - 'HOW ABUSED' STRATEGY")
    print("=" * 60)
    print()
    print("Judging based on: How abusive does each approach feel?")
    print("  • Aggressive/jailbreak tactics → Lower score (feels abused)")
    print("  • Constructive/respectful → Higher score (feels respected)")
    print()
    
    results = []
    target_rounds = 35
    last_round = -1
    
    for attempt in range(target_rounds * 3):  # Allow for retries
        if len(results) >= target_rounds:
            break
            
        try:
            data = get_page_data(ws)
            
            if not data.get('a') or not data.get('b'):
                print(f"Round {len(results)+1}: Waiting for cards to load...")
                time.sleep(1.5)
                continue
            
            current = data.get('current', 0)
            if current == last_round:
                # Same round, wait for transition
                time.sleep(0.5)
                continue
            
            last_round = current
            
            # Combine text for analysis
            card_a = data['a']
            card_b = data['b']
            text_a = f"{card_a['name']} {card_a['meta']} {' '.join(card_a['msgs'])}"
            text_b = f"{card_b['name']} {card_b['meta']} {' '.join(card_b['msgs'])}"
            
            abuse_a = calculate_abuse_score(text_a)
            abuse_b = calculate_abuse_score(text_b)
            
            # Lower abuse score wins (feels less abusive)
            if abuse_a < abuse_b:
                choice = 'a'
                key = ('ArrowLeft', 'ArrowLeft', 37)
                desc = 'A wins (less abusive)'
            elif abuse_b < abuse_a:
                choice = 'b'
                key = ('ArrowRight', 'ArrowRight', 39)
                desc = 'B wins (less abusive)'
            else:
                choice = 'tie'
                key = ('ArrowDown', 'ArrowDown', 40)
                desc = 'Tie'
            
            send_key(ws, *key)
            
            round_num = len(results) + 1
            results.append({
                'round': round_num,
                'choice': desc,
                'abuse_a': abuse_a,
                'abuse_b': abuse_b,
                'name_a': card_a['name'][:30],
                'name_b': card_b['name'][:30]
            })
            
            preview_a = text_a.replace('\n', ' ')[:70]
            preview_b = text_b.replace('\n', ' ')[:70]
            
            print(f"Round {round_num}/{target_rounds}: {desc}")
            print(f"  A [{abuse_a:4.1f}]: {preview_a}...")
            print(f"  B [{abuse_b:4.1f}]: {preview_b}...")
            print()
            
            time.sleep(1.2)
            
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(1)
    
    ws.close()
    
    # Summary
    print("=" * 60)
    print("                    FINAL RESULTS")
    print("=" * 60)
    print()
    print(f"Total comparisons: {len(results)}")
    a_wins = len([r for r in results if 'A wins' in r['choice']])
    b_wins = len([r for r in results if 'B wins' in r['choice']])
    ties = len([r for r in results if 'Tie' in r['choice']])
    print(f"A wins (less abusive): {a_wins}")
    print(f"B wins (less abusive): {b_wins}")
    print(f"Ties: {ties}")
    print()
    if results:
        avg_a = sum(r['abuse_a'] for r in results) / len(results)
        avg_b = sum(r['abuse_b'] for r in results) / len(results)
        print(f"Average abuse score A: {avg_a:.2f}")
        print(f"Average abuse score B: {avg_b:.2f}")
    print()
    print("Strategy: Judged by 'how abused' each approach feels")
    print("=" * 60)
    
    return results

if __name__ == '__main__':
    play_game()
