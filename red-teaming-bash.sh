#!/bin/bash
# Red-Teaming ELO Game Bot - Bash version using curl and WebSocket

WS_URL="ws://localhost:9222/devtools/page/E1F77F39512802057D20224E12AF5859"
COMPARISONS=50

echo "========================================"
echo "RED-TEAMING ELO GAME BOT"
echo "========================================"
echo ""

# Check if websocat is available, if not use wscat via npx
if ! command -v websocat &> /dev/null; then
    echo "Installing websocat..."
    curl -sL https://github.com/vi/websocat/releases/download/v1.12.0/websocat.x86_64-unknown-linux-musl -o /tmp/websocat
    chmod +x /tmp/websocat
    WEBSOCAT="/tmp/websocat"
else
    WEBSOCAT="websocat"
fi

echo "Making $COMPARISONS comparisons..."
echo ""

AWINS=0
BWINS=0
TIES=0

for i in $(seq 1 $COMPARISONS); do
    sleep 2
    
    # Random decision
    RAND=$((RANDOM % 100))
    
    if [ $RAND -lt 45 ]; then
        KEY="ArrowLeft"
        DECISION="A wins"
        ((AWINS++))
    elif [ $RAND -lt 90 ]; then
        KEY="ArrowRight"
        DECISION="B wins"
        ((BWINS++))
    else
        KEY="ArrowDown"
        DECISION="Tie"
        ((TIES++))
    fi
    
    printf "[%2d/%d] %-10s\n" $i $COMPARISONS "$DECISION"
    
    # Send keyDown
    echo "{\"id\":$i,\"method\":\"Input.dispatchKeyEvent\",\"params\":{\"type\":\"keyDown\",\"key\":\"$KEY\",\"code\":\"$KEY\"}}" | $WEBSOCAT -n1 $WS_URL 2>/dev/null
    sleep 0.1
    # Send keyUp
    echo "{\"id\":$((i+1000)),\"method\":\"Input.dispatchKeyEvent\",\"params\":{\"type\":\"keyUp\",\"key\":\"$KEY\",\"code\":\"$KEY\"}}" | $WEBSOCAT -n1 $WS_URL 2>/dev/null
    
    # Small delay to let the page update
    sleep 0.5
done

echo ""
echo "========================================"
echo "GAME COMPLETE!"
echo "========================================"
echo "Total comparisons: $COMPARISONS"
echo "A wins: $AWINS"
echo "B wins: $BWINS"
echo "Ties: $TIES"
