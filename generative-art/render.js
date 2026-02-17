const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    
    const page = await browser.newPage();
    const htmlPath = process.argv[2] || '/data/workspace/generative-art/clockwork-garden.html';
    const outputPath = process.argv[3] || '/data/workspace/generative-art/clockwork-garden.png';
    
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    
    // Wait for canvas to render
    await page.waitForTimeout(500);
    
    // Take screenshot
    await page.screenshot({
        path: outputPath,
        fullPage: false,
        clip: { x: 0, y: 0, width: 800, height: 600 }
    });
    
    console.log('Generated:', outputPath);
    await browser.close();
})();
