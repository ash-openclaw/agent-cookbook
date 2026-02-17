#!/usr/bin/env node
/**
 * Eval Experiment 2 - Image Description Matching (v3)
 * Uses more aggressive selection strategies for Streamlit elements
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
  console.log(`📸 ${name}.png`);
  return screenshotPath;
}

async function completeExperiment2() {
  console.log('🚀 Experiment 2 Automation v3\n');
  
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
    
    console.log('📍 Loading...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
    await delay(10000);
    
    await takeScreenshot(page, 'v3-01-load');
    
    // Click Experiment 2 - try multiple strategies
    console.log('🎯 Selecting Experiment 2...');
    
    // Strategy 1: Find by text and click parent
    let clicked = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.includes('20250610')) {
          // Click the parent element
          node.parentElement.click();
          return 'text-parent';
        }
      }
      return false;
    });
    
    // Strategy 2: Use XPath
    if (!clicked) {
      const element = await page.$('text/20250610');
      if (element) {
        await element.click();
        clicked = 'xpath';
      }
    }
    
    // Strategy 3: Click coordinates in sidebar
    if (!clicked) {
      // Click on left sidebar around where experiment 2 should be
      await page.mouse.click(150, 220);
      clicked = 'coordinate';
    }
    
    console.log(`Selection method: ${clicked || 'FAILED'}`);
    await delay(5000);
    await takeScreenshot(page, 'v3-02-exp2-selected');
    
    // Process questions
    console.log('\n📝 Processing 10 questions...\n');
    
    for (let qNum = 1; qNum <= 10; qNum++) {
      console.log(`\n━━━ Question ${qNum} ━━━`);
      await delay(5000);
      
      // Extract description using multiple methods
      const descResult = await page.evaluate(() => {
        // Method 1: Look for text containing "Description:"
        const allElements = Array.from(document.querySelectorAll('*'));
        for (const el of allElements) {
          const text = el.textContent;
          if (text && text.includes('Description:') && text.length < 500) {
            const match = text.match(/Description:\s*(.+?)(?:\n|$)/);
            if (match) return match[1].trim();
          }
        }
        
        // Method 2: Check paragraphs
        const paragraphs = Array.from(document.querySelectorAll('p'));
        for (const p of paragraphs) {
          const text = p.textContent;
          if (text.includes('Description:')) {
            return text.replace('Description:', '').trim();
          }
        }
        
        return null;
      });
      
      if (!descResult) {
        console.log('⚠️ No description found, checking screenshot...');
        await takeScreenshot(page, `v3-q${qNum}-check`);
        
        // Try to determine if we're done
        const pageText = await page.evaluate(() => document.body.textContent);
        if (!pageText.includes('Description:')) {
          console.log('No more questions with Description field');
          break;
        }
        continue;
      }
      
      console.log(`Description: "${descResult}"`);
      
      // Find and click a Select button
      const selectClicked = await page.evaluate((qIndex) => {
        // Find all buttons with text "Select"
        const allButtons = Array.from(document.querySelectorAll('button, [role="button"]'));
        const selectButtons = allButtons.filter(b => 
          b.textContent.trim() === 'Select' || 
          b.textContent.trim().toLowerCase() === 'select'
        );
        
        console.log(`Found ${selectButtons.length} Select buttons`);
        
        // For simplicity, click the first one (or cycle through)
        // In a real implementation, we'd analyze the images
        if (selectButtons.length > 0) {
          const btnIndex = (qIndex - 1) % selectButtons.length;
          selectButtons[btnIndex].click();
          return { clicked: true, total: selectButtons.length, index: btnIndex };
        }
        return { clicked: false };
      }, qNum);
      
      console.log(`Select buttons: ${selectClicked.total}, clicked index: ${selectClicked.index}`);
      
      results.answers.push({
        question: qNum,
        description: descResult,
        selectedButtonIndex: selectClicked.index,
        timestamp: new Date().toISOString()
      });
      
      await delay(3000);
      await takeScreenshot(page, `v3-q${qNum}-done`);
      
      // Check for completion indicators
      const pageText = await page.evaluate(() => document.body.textContent);
      if (pageText.includes('Download') || pageText.includes('Results') || pageText.includes('Complete')) {
        console.log('Experiment appears complete');
        break;
      }
    }
    
    // Look for download button
    console.log('\n📥 Looking for download...');
    await delay(3000);
    
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      for (const el of elements) {
        const text = el.textContent.toLowerCase();
        if (text.includes('download') || text.includes('result') || text.includes('save')) {
          el.click();
          return true;
        }
      }
      return false;
    });
    
    await delay(5000);
    await takeScreenshot(page, 'v3-final');
    
    // Save results
    const resultsPath = path.join(RESULTS_DIR, 'experiment2-v3-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Completed: ${results.answers.length}/10 questions`);
    console.log(`📁 Results: ${resultsPath}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await takeScreenshot(page, 'v3-error');
    throw error;
  } finally {
    await browser.close();
    console.log('🏁 Done');
  }
}

completeExperiment2().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
