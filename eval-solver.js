const puppeteer = require('puppeteer');
const fs = require('fs');

const CHROME_PATH = '/usr/bin/chromium';
const EVAL_URL = 'https://eval-lang-v0.streamlit.app/';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function solveEval() {
  console.log('Starting eval solver...');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to eval page...');
    await page.goto(EVAL_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(8000); // Wait for Streamlit to fully load

    console.log('Page loaded. Looking for content...');
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: '/data/workspace/eval-debug-1.png', fullPage: true });
    console.log('Screenshot saved: eval-debug-1.png');

    // Get page HTML
    const html = await page.content();
    fs.writeFileSync('/data/workspace/eval-debug.html', html);
    console.log('HTML saved: eval-debug.html');

    // Look for the main iframe (Streamlit apps often use iframes)
    const frames = page.frames();
    console.log(`Found ${frames.length} frames`);
    
    let mainFrame = page;
    for (const frame of frames) {
      const url = frame.url();
      console.log(`Frame URL: ${url}`);
      if (url && url.includes('streamlit')) {
        mainFrame = frame;
        console.log('Using streamlit frame');
      }
    }

    // Try to find radio buttons for experiments
    const radios = await mainFrame.$$('input[type="radio"]');
    console.log(`Found ${radios.length} radio buttons`);
    
    if (radios.length === 0) {
      console.log('No radios found. Looking for experiment buttons...');
      const buttons = await mainFrame.$$('button');
      console.log(`Found ${buttons.length} buttons`);
      
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].evaluate(el => el.textContent);
        console.log(`Button ${i}: "${text?.substring(0, 50)}"`);
      }
    }

    // Process each experiment
    for (let expIndex = 0; expIndex < 3; expIndex++) {
      console.log(`\n=== Experiment ${expIndex + 1} ===`);
      
      // Re-query radios (page state changes)
      const currentRadios = await mainFrame.$$('input[type="radio"]');
      if (expIndex < currentRadios.length) {
        console.log(`Clicking experiment ${expIndex + 1} radio button`);
        await currentRadios[expIndex].click();
        await delay(3000);
      }

      // Process 10 questions
      for (let qNum = 1; qNum <= 10; qNum++) {
        console.log(`\n  Question ${qNum}:`);
        
        // Get description text
        const paragraphs = await mainFrame.$$('p');
        let description = '';
        for (const p of paragraphs) {
          const text = await p.evaluate(el => el.textContent);
          if (text && text.includes('Description:')) {
            description = text;
            break;
          }
        }
        console.log(`    ${description}`);

        // Find all images and their fullscreen buttons
        const fullscreenButtons = await mainFrame.$$('button');
        const imageButtons = [];
        
        for (const btn of fullscreenButtons) {
          const ariaLabel = await btn.evaluate(el => el.getAttribute('aria-label') || el.textContent);
          if (ariaLabel && (ariaLabel.includes('Fullscreen') || ariaLabel.includes('fullscreen'))) {
            imageButtons.push(btn);
          }
        }
        
        console.log(`    Found ${imageButtons.length} images to check`);

        // For now, select the first image as placeholder
        // TODO: Add actual image analysis
        const selectButtons = await mainFrame.$$('button');
        for (const btn of selectButtons) {
          const text = await btn.evaluate(el => el.textContent);
          if (text === 'Select') {
            await btn.click();
            console.log('    Selected image');
            await delay(2000);
            break;
          }
        }

        await delay(3000); // Wait for next question
      }

      // Download results
      console.log('  Looking for download button...');
      const allButtons = await mainFrame.$$('button');
      for (const btn of allButtons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && text.toLowerCase().includes('download')) {
          await btn.click();
          console.log('  Downloaded results');
          await delay(2000);
          break;
        }
      }
    }

    console.log('\n=== Eval Complete ===');
    await page.screenshot({ path: '/data/workspace/eval-final.png', fullPage: true });
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/data/workspace/eval-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

solveEval();
