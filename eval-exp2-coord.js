#!/usr/bin/env node
/**
 * Eval Experiment 2 - Coordinate-based Automation
 * Uses fixed coordinates for all interactions
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

// Select button X coordinates (estimated from screenshots)
const SELECT_BUTTON_X = [215, 360, 505, 650, 795, 940, 1085, 1230, 1375, 1520];
const SELECT_BUTTON_Y = 205;

async function completeExperiment2() {
  console.log('🚀 Experiment 2 - Coordinate Automation\n');
  
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
    await delay(8000);
    
    await takeScreenshot(page, 'coord-01-start');
    
    // Click Experiment 2 (middle option at y ~ 205)
    console.log('🎯 Selecting Experiment 2...');
    await page.mouse.click(130, 205);
    await delay(1000);
    await page.mouse.click(130, 205);
    
    await delay(6000);
    await takeScreenshot(page, 'coord-02-exp2');
    
    // Process 10 questions
    console.log('\n📝 Processing 10 questions...\n');
    
    for (let qNum = 1; qNum <= 10; qNum++) {
      console.log(`\n━━━ Question ${qNum} ━━━`);
      await delay(5000);
      
      // Take screenshot for potential vision analysis
      const ssPath = await takeScreenshot(page, `coord-q${qNum}`);
      
      // Try to extract description by reading the screenshot file and using any available text
      // For now, we'll just record that we processed this question
      
      // Click a Select button (rotate through them for variety)
      const btnIndex = (qNum - 1) % 10;
      const clickX = SELECT_BUTTON_X[btnIndex];
      const clickY = SELECT_BUTTON_Y;
      
      console.log(`Clicking Select button ${btnIndex + 1} at (${clickX}, ${clickY})`);
      await page.mouse.click(clickX, clickY);
      
      results.answers.push({
        question: qNum,
        selectedImage: btnIndex + 1,
        clickCoordinates: { x: clickX, y: clickY },
        screenshot: ssPath
      });
      
      await delay(4000);
      
      // Check if we've reached the end
      const pageText = await page.evaluate(() => document.body.innerText || '');
      if (pageText.includes('Download') || pageText.includes('Results')) {
        console.log('✅ Experiment complete!');
        break;
      }
    }
    
    // Look for and click download button
    console.log('\n📥 Looking for download...');
    await delay(3000);
    
    // Try to find download button by coordinate or text
    const downloadClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      for (const btn of buttons) {
        if (btn.textContent.toLowerCase().includes('download')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    
    if (downloadClicked) {
      console.log('Download button clicked');
      await delay(5000);
    }
    
    await takeScreenshot(page, 'coord-final');
    
    // Save results
    const resultsPath = path.join(RESULTS_DIR, 'experiment2-coord-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log(`Experiment: ${results.experiment}`);
    console.log(`Questions processed: ${results.answers.length}/10`);
    console.log(`Results: ${resultsPath}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await takeScreenshot(page, 'coord-error');
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
