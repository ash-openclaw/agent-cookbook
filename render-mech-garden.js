const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    const htmlPath = 'file://' + path.resolve('/data/workspace/mech-garden.html');
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });
    
    await page.screenshot({
        path: '/data/workspace/mech-garden.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1200, height: 800 }
    });
    
    await browser.close();
    console.log('Screenshot saved to /data/workspace/mech-garden.png');
})();
