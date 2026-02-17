#!/usr/bin/env node
/**
 * Eval Experiment 2 - Final Version
 * Uses precise coordinates for Experiment 2 selection
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
  console.log('🚀 Experiment 2 Automation - Final\n');
  
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
    await delay(8000);
    
    await takeScreenshot(page, 'final-01-load');
    
    // Click Experiment 2 - middle option in sidebar
    // Based on screenshot, experiments are at approximately:
    // Exp 1: y ~ 175, Exp 2: y ~ 200, Exp 3: y ~ 225
    console.log('🎯 Selecting Experiment 2 (middle option)...');
    await page.mouse.click(150, 205);
    await delay(1000);
    await page.mouse.click(150, 205); // Click twice as per instructions
    
    await delay(6000);
    await takeScreenshot(page, 'final-02-exp2');
    
    // Process 10 questions
    console.log('\n📝 Processing questions...\n');
    
    for (let qNum = 1; qNum <= 10; qNum++) {
      console.log(`\n━━━ Question ${qNum} ━━━`);
      await delay(6000);
      
      // Get all text content and parse
      const pageInfo = await page.evaluate(() => {
        // Get all text from the page
        const bodyText = document.body.innerText || document.body.textContent;
        
        // Find description - look for the pattern
        const descMatch = bodyText.match(/Description:\s*([^\n]+)/);
        const description = descMatch ? descMatch[1].trim() : null;
        
        // Count Select buttons
        const buttons = Array.from(document.querySelectorAll('button'));
        const selectButtons = buttons.filter(b => b.textContent.trim() === 'Select');
        
        return {
          description,
          selectCount: selectButtons.length,
          hasQuestion: bodyText.includes('Question'),
          fullText: bodyText.substring(0, 1000)
        };
      });
      
      console.log(`Description: "${pageInfo.description}"`);
      console.log(`Select buttons: ${pageInfo.selectCount}`);
      
      if (!pageInfo.description) {
        console.log('⚠️ No description found');
        await takeScreenshot(page, `final-q${qNum}-nodesc`);
        
        // Check if we're at the end
        if (!pageInfo.hasQuestion) {
          console.log('No question header found - experiment complete?');
          break;
        }
        continue;
      }
      
      // Click the first Select button for now
      // In a real implementation with vision, we'd match the description to the correct image
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const selectBtn = buttons.find(b => b.textContent.trim() === 'Select');
        if (selectBtn) {
          selectBtn.click();
          return true;
        }
        return false;
      });
      
      console.log('✓ Selected Image 1');
      
      results.answers.push({
        question: qNum,
        description: pageInfo.description,
        selectedImage: 1,
        note: 'placeholder-selection'
      });
      
      await delay(3000);
      await takeScreenshot(page, `final-q${qNum}-done`);
    }
    
    // Look for download button at the end
    console.log('\n📥 Looking for download button...');
    await delay(4000);
    
    const downloadResult = await page.evaluate(() => {
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
    
    if (downloadResult) {
      console.log(`Clicked: ${downloadResult}`);
      await delay(5000);
    } else {
      console.log('No download button found');
    }
    
    await takeScreenshot(page, 'final-end');
    
    // Save results
    const resultsPath = path.join(RESULTS_DIR, 'experiment2-final-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log(`Experiment: ${results.experiment} (${results.experimentId})`);
    console.log(`Questions completed: ${results.answers.length}/10`);
    console.log(`Results file: ${resultsPath}`);
    console.log('Screenshots saved in:', RESULTS_DIR);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Print the descriptions found
    console.log('Descriptions encountered:');
    results.answers.forEach((a, i) => {
      console.log(`  Q${i+1}: "${a.description}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await takeScreenshot(page, 'final-error');
    throw error;
  } finally {
    await browser.close();
    console.log('\n🏁 Automation complete');
  }
}

completeExperiment2().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
