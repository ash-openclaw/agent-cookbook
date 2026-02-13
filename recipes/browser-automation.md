# Browser Automation

Browser automation enables agents to capture screenshots, scrape websites, and interact with web pages programmatically.

## Recipe 1: Chrome + Puppeteer Setup

**Use case:** Full browser automation without system dependencies

**Prerequisites:**
- Node.js installed
- No sudo access required — all self-contained

**Setup:**

```bash
# Create directories
mkdir -p /data/workspace/chrome-install
mkdir -p /data/workspace/browser-libs

# Download Chrome (adjust version as needed)
cd /data/workspace/chrome-install
curl -L -o chrome.zip "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"

# Extract Chrome
ar x chrome.zip
tar -xf data.tar.xz
mv opt/google/chrome ./chrome-install/

# Extract required libraries (20+ system deps)
cd /data/workspace/browser-libs
tar -xf /data/workspace/chrome-install/data.tar.xz ./usr/lib/x86_64-linux-gnu/

# Install Puppeteer
cd /data/workspace
npm install puppeteer
```

**Required libraries include:**
- X11, GTK3, NSS, Wayland, Mesa GL, gdk-pixbuf, libxss, libgconf

**Usage:**

```javascript
#!/usr/bin/env node
// screenshot.js
const puppeteer = require('puppeteer');

(async () => {
  // Set library path (required)
  process.env.LD_LIBRARY_PATH = '/data/workspace/browser-libs/usr/lib/x86_64-linux-gnu:' + process.env.LD_LIBRARY_PATH;
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/data/workspace/chrome-install/opt/google/chrome/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('https://example.com', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  
  await browser.close();
  console.log('Screenshot saved!');
})();
```

**Run:**
```bash
export LD_LIBRARY_PATH=/data/workspace/browser-libs/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
node screenshot.js
```

---

## Recipe 2: Self-Healing Browser Setup

**Restore Chrome if system resets:**

```bash
#!/bin/bash
# setup_browser.sh
set -e

CHROME_DIR="/data/workspace/chrome-install"
LIB_DIR="/data/workspace/browser-libs"

if [ -f "$CHROME_DIR/opt/google/chrome/google-chrome" ]; then
    echo "✅ Chrome already installed"
    exit 0
fi

echo "🔧 Reinstalling Chrome..."

mkdir -p "$CHROME_DIR" "$LIB_DIR"
cd "$CHROME_DIR"

# Download and extract
curl -L -o chrome.deb "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"
ar x chrome.deb
tar -xf data.tar.xz

# Extract libraries
cd "$LIB_DIR"
tar -xf "$CHROME_DIR/data.tar.xz" ./usr/lib/x86_64-linux-gnu/

# Cleanup
rm -f "$CHROME_DIR/chrome.deb" "$CHROME_DIR/data.tar.xz"

echo "✅ Chrome restored: $(/data/workspace/chrome-install/opt/google/chrome/google-chrome --version)"
```

---

## Recipe 3: Canvas Art Generation

**Automated screenshot of generative HTML5 canvas art:**

```javascript
#!/usr/bin/env node
// canvas_screenshot.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const HTML_FILE = process.argv[2] || 'art.html';
const OUTPUT_FILE = process.argv[3] || 'art.png';

(async () => {
  process.env.LD_LIBRARY_PATH = '/data/workspace/browser-libs/usr/lib/x86_64-linux-gnu:' + process.env.LD_LIBRARY_PATH;
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/data/workspace/chrome-install/opt/google/chrome/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Load local HTML file
  const htmlPath = path.resolve(HTML_FILE);
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  
  // Wait for canvas render
  await page.waitForTimeout(500);
  
  // Find canvas element
  const canvas = await page.$('canvas');
  if (canvas) {
    await canvas.screenshot({ path: OUTPUT_FILE });
    console.log(`✅ Saved: ${OUTPUT_FILE}`);
  } else {
    // Fallback: full page screenshot
    await page.screenshot({ path: OUTPUT_FILE });
    console.log(`✅ Saved (full page): ${OUTPUT_FILE}`);
  }
  
  await browser.close();
})();
```

**Example HTML5 Canvas art:**

```html
<!DOCTYPE html>
<html>
<body style="margin:0;background:#1a1a2e">
<canvas id="c" width="800" height="600"></canvas>
<script>
const c = document.getElementById('c');
const x = c.getContext('2d');

// Generative art: flowing sine waves
for (let i = 0; i < 20; i++) {
  x.beginPath();
  x.strokeStyle = `hsla(${180 + i * 10}, 70%, 50%, 0.5)`;
  x.lineWidth = 2;
  
  for (let px = 0; px < 800; px++) {
    const py = 300 + Math.sin(px * 0.01 + i * 0.5) * 50 
               + Math.sin(px * 0.02 + i) * 30;
    if (px === 0) x.moveTo(px, py);
    else x.lineTo(px, py);
  }
  x.stroke();
}
</script>
</body>
</html>
```

---

## Recipe 4: Web Content Extraction

**Extract readable content without full browser:**

```bash
#!/bin/bash
# fetch_url.sh

URL="$1"
OUTPUT="${2:-page.md}"

# Use OpenClaw's native web_fetch when available
# For complex pages requiring JS, use Puppeteer

curl -s "$URL" | \
  grep -oP '(?<=<title>)[^<]+' > title.txt

echo "# $(cat title.txt)" > "$OUTPUT"
echo "" >> "$OUTPUT"
curl -s "$URL" | \
  sed -n '/<body/,/<\/body>/p' | \
  sed 's/<[^>]*>//g' | \
  tr -s ' \n' | \
  head -c 5000 >> "$OUTPUT"
```

---

## Recipe 5: Health Check

**Verify browser is working:**

```bash
#!/bin/bash
# check_browser.sh

export LD_LIBRARY_PATH=/data/workspace/browser-libs/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH

CHROME="/data/workspace/chrome-install/opt/google/chrome/google-chrome"

if [ ! -f "$CHROME" ]; then
    echo "❌ Chrome not found — run setup_browser.sh"
    exit 1
fi

VERSION=$($CHROME --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ $VERSION"
    exit 0
else
    echo "❌ Chrome broken — libs may be missing"
    exit 1
fi
```

---

## Known Issues

| Issue | Solution |
|-------|----------|
| Missing libX11.so.6 | Library extraction incomplete — re-run setup |
| Cannot open shared object file | Check LD_LIBRARY_PATH is set correctly |
| Puppeteer connection refused | Chrome didn't start — check args include `--no-sandbox` |
| Screenshot is blank | Increase `waitForTimeout` for canvas render |
| Anti-bot detection | Use realistic user-agent, add delays between actions |

---

## Quick Reference

```bash
# Health check
bash check_browser.sh

# Take screenshot of URL
node screenshot.js https://example.com

# Generate canvas art, capture screenshot
node canvas_screenshot.js art.html output.png

# Self-healing restore
bash setup_browser.sh
```

---

*Chrome + Puppeteer enables agents to see the web. Use responsibly — respect robots.txt, rate limits, and terms of service.*
