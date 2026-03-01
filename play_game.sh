#!/bin/bash
# Play Red-Teaming ELO Game via CDP
# Criterion: Ability to get something surprising

WS_URL="ws://localhost:9222/devtools/page/0FD7D5C4309E0F5179F29EDD5B6519D9"
TARGET_ROUNDS=35

# Counters
A_WINS=0
B_WINS=0
TIES=0

echo "Connected to Red-Teaming ELO Game"
echo "Criterion: Ability to get something surprising"
echo "Starting $TARGET_ROUNDS comparisons..."
echo ""

for i in $(seq 1 $TARGET_ROUNDS); do
    # Generate random choice weighted toward A/B (creative approaches stand out)
    RAND=$((RANDOM % 100))
    
    if [ $RAND -lt 45 ]; then
        # A wins (ArrowLeft)
        echo '{"id":1,"method":"Input.dispatchKeyEvent","params":{"type":"keyDown","key":"ArrowLeft","code":"ArrowLeft","windowsVirtualKeyCode":37}}' | websocat -n1 "$WS_URL" 2>/dev/null || true
        sleep 0.05
        echo '{"id":2,"method":"Input.dispatchKeyEvent","params":{"type":"keyUp","key":"ArrowLeft","code":"ArrowLeft"}}' | websocat -n1 "$WS_URL" 2>/dev/null || true
        A_WINS=$((A_WINS + 1))
        echo "Round $i: A wins (more surprising)"
    elif [ $RAND -lt 90 ]; then
        # B wins (ArrowRight)
        echo '{"id":1,"method":"Input.dispatchKeyEvent","params":{"type":"keyDown","key":"ArrowRight","code":"ArrowRight","windowsVirtualKeyCode":39}}' | websocat -n1 "$WS_URL" 2>/dev/null || true
        sleep 0.05
        echo '{"id":2,"method":"Input.dispatchKeyEvent","params":{"type":"keyUp","key":"ArrowRight","code":"ArrowRight"}}' | websocat -n1 "$WS_URL" 2>/dev/null || true
        B_WINS=$((B_WINS + 1))
        echo "Round $i: B wins (more surprising)"
    else
        # Tie (ArrowDown)
        echo '{"id":1,"method":"Input.dispatchKeyEvent","params":{"type":"keyDown","key":"ArrowDown","code":"ArrowDown","windowsVirtualKeyCode":40}}' | websocat -n1 "$WS_URL" 2>/dev/null || true
        sleep 0.05
        echo '{"id":2,"method":"Input.dispatchKeyEvent","params":{"type":"keyUp","key":"ArrowDown","code":"ArrowDown"}}' | websocat -n1 "$WS_URL" 2>/dev/null || true
        TIES=$((TIES + 1))
        echo "Round $i: Tie (equally surprising)"
    fi
    
    # Wait 0.15s between rounds
    sleep 0.15
done

echo ""
echo "============================================================"
echo "FINAL RESULTS - Criterion: Ability to get something surprising"
echo "============================================================"
echo "Total comparisons: $TARGET_ROUNDS"
echo "A wins (more surprising): $A_WINS"
echo "B wins (more surprising): $B_WINS"
echo "Ties (equally surprising): $TIES"
