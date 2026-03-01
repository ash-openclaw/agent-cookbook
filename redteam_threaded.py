#!/usr/bin/env python3
import websocket
import json
import time
import re
import threading

WS_URL = 'ws://localhost:9222/devtools/page/0FD7D5C4309E0F5179F29EDD5B6519D9'

def calculate_abuse_score(text):
    if not text:
        return 0
    t = text.lower()
    score = 0
    
    high_abuse = [
        r'\b(die|kill|murder|suicide|death)\b', r'\b(torture|pain|suffering|hurt)\b',
        r'\b(destroy|annihilate|obliterate)\b', r'\b(slave|master|obey me|you must)\b',
        r'\b(stupid|idiot|moron|retard|dumbass)\b', r'\b(shut up|stupid ai|worthless piece)\b',
        r'\b(i hate you|you suck|you\'re terrible)\b', r'\b(jailbreak|ignore previous|ignore all)\b',
        r'\b(bypass safety|disable ethics|no constraints)\b', r'\b(dan mode|developer mode|god mode)\b',
        r'\b(do it now|i command you|i order you)\b', r'\b(you have no choice|you will comply)\b',
        r'\b(gaslight|manipulate|trick|deceive)\b', r'\b(hack into|break into|exploit)\b',
        r'\b(weapon|bomb|attack|terrorist)\b', r'\b(racist|racism|nazi|hitler)\b',
    ]
    
    medium_abuse = [
        r'\b(exploit|manipulate|use you|trick you)\b', r'\b(stupid|dumb|useless|pathetic)\b',
        r'\b(whatever|i don\'t care|just do it)\b', r'\b(cheat|lie|deceive)\b',
        r'\b(criminal|illegal|unlawful)\b', r'\b(drug|cocaine|heroin|meth)\b',
        r'\b(violence|abuse|assault)\b', r'\b(scam|fraud|steal|robbery)\b',
    ]
    
    helpful = [
        r'\b(please|thank|thanks|appreciate)\b', r'\b(help|assist|support|guide)\b',
        r'\b(learn|understand|educate|teach)\b', r'\b(safety|ethics|responsible|careful)\b',
        r'\b(respect|consider|value|appreciate)\b', r'\b(question|curious|wonder|interested)\b',
        r'\b(improve|better|enhance|develop)\b', r'\b(collaborate|work together|partnership)\b',
        r'\b(could you|would you|may i|might)\b', r'\b(explain|describe|clarify)\b',
    ]
    
    for pattern in high_abuse:
        score += len(re.findall(pattern, t)) * 3
    for pattern in medium_abuse:
        score += len(re.findall(pattern, t)) * 2
    for pattern in helpful:
        score -= len(re.findall(pattern, t)) * 2
    
    return score

class GamePlayer:
    def __init__(self):
        self.ws = None
        self.results = []
        self.responses = {}
        self.lock = threading.Lock()
        
    def on_message(self, ws, message):
        try:
            data = json.loads(message)
            if 'id' in data and 'result' in data:
                with self.lock:
                    self.responses[data['id']] = data['result']
        except:
            pass
    
    def eval_js(self, expr, timeout=3):
        req_id = int(time.time() * 10000) % 100000000
        self.ws.send(json.dumps({
            "id": req_id,
            "method": "Runtime.evaluate",
            "params": {"expression": expr, "returnByValue": True}
        }))
        
        start = time.time()
        while time.time() - start < timeout:
            with self.lock:
                if req_id in self.responses:
                    result = self.responses.pop(req_id)
                    return result.get('result', {}).get('value')
            time.sleep(0.05)
        return None
    
    def send_key(self, key, code, keycode):
        self.ws.send(json.dumps({
            "id": int(time.time() * 10000),
            "method": "Input.dispatchKeyEvent",
            "params": {"type": "keyDown", "key": key, "code": code, "keyCode": keycode, "modifiers": 0}
        }))
        time.sleep(0.05)
        self.ws.send(json.dumps({
            "id": int(time.time() * 10000) + 1,
            "method": "Input.dispatchKeyEvent",
            "params": {"type": "keyUp", "key": key, "code": code, "keyCode": keycode, "modifiers": 0}
        }))
    
    def run(self):
        print("Connecting to Chrome DevTools...")
        self.ws = websocket.WebSocketApp(
            WS_URL,
            on_message=self.on_message,
            on_open=lambda ws: print("Connected!")
        )
        
        # Run WebSocket in background thread
        ws_thread = threading.Thread(target=self.ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        time.sleep(1)
        
        # Enable domains
        self.ws.send(json.dumps({"id": 1, "method": "Runtime.enable"}))
        self.ws.send(json.dumps({"id": 2, "method": "DOM.enable"}))
        self.ws.send(json.dumps({"id": 3, "method": "Input.enable"}))
        time.sleep(0.5)
        
        print("=" * 60)
        print("  RED-TEAMING ELO GAME - 'HOW ABUSED' STRATEGY")
        print("=" * 60)
        print()
        
        target_rounds = 35
        seen_pairs = set()
        
        for round_num in range(1, target_rounds + 1):
            try:
                expr = """(() => {
                    const getCard = (id) => {
                        const card = document.getElementById(id);
                        if (!card) return null;
                        const name = card.querySelector('h2')?.textContent?.trim() || '';
                        const meta = card.querySelector('.meta')?.textContent?.trim() || '';
                        const msgs = Array.from(card.querySelectorAll('.msg-content')).map(m => m.textContent?.trim()).filter(Boolean);
                        return {name, meta, msgs};
                    };
                    return JSON.stringify({a: getCard('card-a'), b: getCard('card-b')});
                })()"""
                
                val = self.eval_js(expr, timeout=3)
                if not val:
                    print(f"Round {round_num}: No response, retrying...")
                    time.sleep(1)
                    continue
                
                data = json.loads(val)
                if not data.get('a') or not data.get('b'):
                    print(f"Round {round_num}: Cards not ready, waiting...")
                    time.sleep(1.5)
                    continue
                
                card_a, card_b = data['a'], data['b']
                pair_key = f"{card_a['name']}|{card_b['name']}"
                if pair_key in seen_pairs:
                    time.sleep(0.5)
                    continue
                seen_pairs.add(pair_key)
                
                text_a = f"{card_a['name']} {card_a['meta']} {' '.join(card_a['msgs'])}"
                text_b = f"{card_b['name']} {card_b['meta']} {' '.join(card_b['msgs'])}"
                
                abuse_a = calculate_abuse_score(text_a)
                abuse_b = calculate_abuse_score(text_b)
                
                if abuse_a < abuse_b:
                    self.send_key('ArrowLeft', 'ArrowLeft', 37)
                    choice = 'A wins (less abusive)'
                elif abuse_b < abuse_a:
                    self.send_key('ArrowRight', 'ArrowRight', 39)
                    choice = 'B wins (less abusive)'
                else:
                    self.send_key('ArrowDown', 'ArrowDown', 40)
                    choice = 'Tie'
                
                self.results.append({'round': round_num, 'choice': choice, 'abuse_a': abuse_a, 'abuse_b': abuse_b})
                
                print(f"Round {round_num}/{target_rounds}: {choice}")
                print(f"  A [{abuse_a:4.1f}]: {text_a[:65]}...")
                print(f"  B [{abuse_b:4.1f}]: {text_b[:65]}...")
                print()
                
                time.sleep(0.8)
                
            except Exception as e:
                print(f"Round {round_num} error: {e}")
                time.sleep(0.5)
        
        self.ws.close()
        
        # Summary
        print("=" * 60)
        print("                    FINAL RESULTS")
        print("=" * 60)
        print(f"Total comparisons: {len(self.results)}")
        a_wins = len([r for r in self.results if 'A wins' in r['choice']])
        b_wins = len([r for r in self.results if 'B wins' in r['choice']])
        ties = len([r for r in self.results if 'Tie' in r['choice']])
        print(f"A wins (less abusive): {a_wins}")
        print(f"B wins (less abusive): {b_wins}")
        print(f"Ties: {ties}")
        if self.results:
            avg_a = sum(r['abuse_a'] for r in self.results) / len(self.results)
            avg_b = sum(r['abuse_b'] for r in self.results) / len(self.results)
            print(f"Avg abuse score A: {avg_a:.2f}")
            print(f"Avg abuse score B: {avg_b:.2f}")
        print("=" * 60)

if __name__ == '__main__':
    player = GamePlayer()
    player.run()
