#!/bin/bash
# Weather fetcher with Open-Meteo primary, wttr.in backup
# More reliable than wttr.in alone - avoids timeout issues

LOCATION="${1:-New+York}"

# City coordinates database (expand as needed)
declare -A COORDS=(
    ["New+York"]="40.71,-74.01"
    ["London"]="51.51,-0.13"
    ["Paris"]="48.86,2.35"
    ["Tokyo"]="35.68,139.76"
    ["Sydney"]="-33.87,151.21"
    ["Berlin"]="52.52,13.41"
    ["Los+Angeles"]="34.05,-118.24"
    ["Chicago"]="41.88,-87.63"
)

# Get coordinates or default to NYC
COORD="${COORDS[$LOCATION]:-40.71,-74.01}"
LAT="${COORD%,*}"
LON="${COORD#*,}"

# WMO weather code to emoji mapping
code_to_emoji() {
    case $1 in
        0) echo "☀️" ;;  # Clear sky
        1|2|3) echo "⛅" ;;  # Partly cloudy
        45|48) echo "🌫️" ;;  # Fog
        51|53|55|56|57) echo "🌦️" ;;  # Drizzle
        61|63|65|66|67) echo "🌧️" ;;  # Rain
        71|73|75|77) echo "🌨️" ;;  # Snow
        80|81|82) echo "🌦️" ;;  # Rain showers
        85|86) echo "🌨️" ;;  # Snow showers
        95|96|99) echo "⛈️" ;;  # Thunderstorm
        *) echo "🌡️" ;;
    esac
}

# Fetch from Open-Meteo (reliable, fast)
RESPONSE=$(curl -s "https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&temperature_unit=fahrenheit" --max-time 5)

if [ -n "$RESPONSE" ] && echo "$RESPONSE" | grep -q "temperature"; then
    TEMP=$(echo "$RESPONSE" | sed -n 's/.*"temperature":\([0-9.]*\).*/\1/p')
    CODE=$(echo "$RESPONSE" | sed -n 's/.*"weathercode":\([0-9]*\).*/\1/p')
    EMOJI=$(code_to_emoji "$CODE")
    
    # Round to nearest integer
    TEMP_ROUNDED=$(printf "%.0f" "$TEMP")
    
    echo "${LOCATION}: ${EMOJI} +${TEMP_ROUNDED}°F"
else
    # Fallback to wttr.in with short timeout
    echo "Open-Meteo failed, trying wttr.in..." >&2
    curl -s "wttr.in/${LOCATION}?format=3" --max-time 8
fi
