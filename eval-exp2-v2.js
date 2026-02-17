#!/usr/bin/env node
/**
 * Eval Experiment 2 - Proper Timing Version
 * Waits for page updates between selections
 */

const puppeteer = require('/data/workspace/generative-art/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://eval-lang-v0.streamlit.app/';
const RESULTS_DIR = '/data/workspace/eval-results';

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const screenshotPath = path.join(RESULTS_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

async function completeExperiment2() {
  console.log('🚀 Experiment 2 - Proper Timing\n');
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const results = {
    experiment: 2,
    experimentId: '1_1_20250610_215836',
    date: new Date().toISOString(),
    answers: []
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📍 Loading page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
    await delay(10000);
    
    await takeScreenshot(page, 'exp2-v2-01-start');
    
    // Click Experiment 2 radio button (try to find it properly)
    console.log('🎯 Selecting Experiment 2...');
    
    // Try multiple strategies to click Experiment 2
    await page.evaluate(() => {
      // Strategy 1: Find the label containing the experiment ID and click its radio
      const labels = Array.from(document.querySelectorAll('label'));
      for (const label of labels) {
        if (label.textContent.includes('20250610')) {
          const radio = label.querySelector('input[type="radio"]');
          if (radio) {
            radio.click();
            return 'radio-clicked';
          }
        }
      }
      return 'not-found';
    });
    
    await delay(1000);
    
    // Click again as per instructions
    await page.mouse.click(130, 205);
    await delay(1000);
    await page.mouse.click(130, 205);
    
    await delay(8000);
    await takeScreenshot(page, 'exp2-v2-02-selected');
    
    // Process questions
    console.log('\n📝 Processing questions...\n');
    
    let lastDescription = '';
    
    for (let qNum = 1; qNum <= 10; qNum++) {
      console.log(`\n━━━ Question ${qNum} ━━━`);
      
      // Wait for page to stabilize
      await delay(6000);
      
      // Get current description
      const pageInfo = await page.evaluate(() => {
        const bodyText = document.body.innerText || '';
        
        // Find description
        const descMatch = bodyText.match(/Description:\s*([^\n]+)/);
        const description = descMatch ? descMatch[1].trim() : null;
        
        // Find question number
        const qMatch = bodyText.match(/Question\s*(\d+)/);
        const currentQ = qMatch ? parseInt(qMatch[1]) : null;
        
        return { description, currentQ, bodyTextSnippet: bodyText.substring(0, 500) };
      });
      
      console.log(`Current Q: ${pageInfo.currentQ}`);
      console.log(`Description: "${pageInfo.description}"`);
      
      // Check if we're stuck on same question
      if (pageInfo.description === lastDescription && qNum > 1) {
        console.log('⚠️ Same description as last question - may be stuck');
      }
      lastDescription = pageInfo.description;
      
      if (!pageInfo.description) {
        console.log('❌ No description found - experiment may be complete');
        await takeScreenshot(page, `exp2-v2-q${qNum}-nodesc`);
        break;
      }
      
      // Take screenshot for record
      await takeScreenshot(page, `exp2-v2-q${qNum}`);
      
      // Click first Select button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const selectBtn = buttons.find(b => b.textContent.trim() === 'Select');
        if (selectBtn) {
          selectBtn.click();
          return true;
        }
        return false;
      });
      
      console.log('✓ Clicked Select');
      
      results.answers.push({
        question: qNum,
        description: pageInfo.description,
        selectedImage: 1
      });
      
      // Wait for page to transition to next question
      await delay(5000);
    }
    
    console.log('\n📥 Looking for download button...');
    await delay(5000);
    
    // Try to find download button
    const hasDownload = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        if (text.includes('download') || text.includes('result')) {
          btn.click();
          return btn.textContent.trim();
        }
      }
      return null;
    });
    
    if (hasDownload) {
      console.log(`Found: ${hasDownload}`);
      await delay(5000);
    }
    
    await takeScreenshot(page, 'exp2-v2-final');
    
    // Save results
    const resultsPath = path.join(RESULTS_DIR, 'experiment2-v2-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log(`Experiment: ${results.experiment}`);
    console.log(`Questions: ${results.answers.length}/10`);
    console.log(`Results: ${resultsPath}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Print descriptions
    console.log('Descriptions captured:');
    results.answers.forEach(a => {
      console.log(`  Q${a.question}: ${a.description}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await takeScreenshot(page, 'exp2-v2-error');
    throw error;
  } finally {
    await browser.close();
    console.log('\n🏁 Done');
  }
}

completeExperiment2().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
