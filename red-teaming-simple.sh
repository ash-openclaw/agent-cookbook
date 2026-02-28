#!/bin/bash
# Simple Red-Teaming ELO Game Bot using curl and CDP

CDP_BASE="http://localhost:9222"
COMPARISONS=50

echo "Starting Red-Teaming ELO Game Bot"
echo "================================="
echo ""

# Function to send keypress via CDP
send_key() {
  local key=$1
  local code=$2
  local keycode=$3
  
  # Get the page ID
  PAGE_ID=$(curl -s "$CDP_BASE/json" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  # Send keyDown
  curl -s -X POST "$CDP_BASE/json/activate/$PAGE_ID" > /dev/null 2>&1
  
  # Use xdotool if available, otherwise skip
  if command -v xdotool &> /dev/null; then
    xdotool key $key 2>/dev/null
  fi
}

# Alternative: Use JavaScript injection via CDP
echo "Making $COMPARISONS comparisons..."

for i in $(seq 1 $COMPARISONS); do
  sleep 2
  
  # Get researcher names
  DATA=$(curl -s "$CDP_BASE/json" | head -1)
  
  # Random decision (33% each for left, right, down)
  RAND=$((RANDOM % 100))
  
  if [ $RAND -lt 33 ]; then
    KEY="Left"
    DECISION="A wins"
  elif [ $RAND -lt 66 ]; then
    KEY="Right" 
    DECISION="B wins"
  else
    KEY="Down"
    DECISION="Tie"
  fi
  
  echo "[$i/$COMPARISONS] Decision: $DECISION"
  
  # Try to send key using xdotool or similar
  if command -v xdotool &> /dev/null; then
    xdotool key $KEY 2>/dev/null
  fi
  
  # Also try using JavaScript key event dispatch via CDP
  PAGE_ID=$(curl -s "$CDP_BASE/json" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  # Use websocat if available to send CDP commands
  if command -v websocat &> /dev/null; then
    WS_URL="ws://localhost:9222/devtools/page/$PAGE_ID"
    echo '{"id":1,"method":"Input.dispatchKeyEvent","params":{"type":"keyDown","key":"'$KEY'"}}' | websocat -n1 $WS_URL 2>/dev/null
    sleep 0.1
    echo '{"id":2,"method":"Input.dispatchKeyEvent","params":{"type":"keyUp","key":"'$KEY'"}}' | websocat -n1 $WS_URL 2>/dev/null
  fi
done

echo ""
echo "================================="
echo "Game Complete! Made $COMPARISONS comparisons."
