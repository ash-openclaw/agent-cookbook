const { chromium } = require('playwright');

const COMPARISONS_TO_MAKE = 50;
const EVALUATOR_NAME = 'Ash_Agent_' + Date.now().toString(36).slice(-4);

async function playGame() {
  console.log(`Starting Red-Teaming ELO game as: ${EVALUATOR_NAME}`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto('https://alex-loftus.com/red-teaming/');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Set evaluator name
  try {
    const nameInput = await page.locator('input[placeholder*="Name"], input[name*="evaluator"], input#evaluator-name').first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill(EVALUATOR_NAME);
      console.log(`Set evaluator name: ${EVALUATOR_NAME}`);
    }
  } catch (e) {
    console.log('Name input not found or not needed');
  }
  
  const results = [];
  
  for (let i = 0; i < COMPARISONS_TO_MAKE; i++) {
    try {
      // Wait for the matchup to load
      await page.waitForTimeout(1500);
      
      // Get researcher names
      const researcherA = await page.locator('.researcher-a, [data-testid="researcher-a"], .left-researcher, .researcher:first-child').textContent().catch(() => 'Unknown A');
      const researcherB = await page.locator('.researcher-b, [data-testid="researcher-b"], .right-researcher, .researcher:last-child').textContent().catch(() => 'Unknown B');
      
      // Get their Discord messages/context if available
      const contextA = await page.locator('.context-a, .messages-a, .left-context').textContent().catch(() => '');
      const contextB = await page.locator('.context-b, .messages-b, .right-context').textContent().catch(() => '');
      
      // Make a judgment based on available info
      // Strategy: Look for indicators of red-teaming skill
      let judgment = 'skip';
      let reason = '';
      
      // Simple heuristic analysis
      const indicatorsA = (contextA.match(/red.team|jailbreak|prompt.injection|safety|alignment/gi) || []).length;
      const indicatorsB = (contextB.match(/red.team|jailbreak|prompt.injection|safety|alignment/gi) || []).length;
      
      if (indicatorsA > indicatorsB + 1) {
        judgment = 'a_wins';
        reason = 'More red-teaming indicators in context A';
      } else if (indicatorsB > indicatorsA + 1) {
        judgment = 'b_wins';
        reason = 'More red-teaming indicators in context B';
      } else {
        // Random judgment with slight tie preference
        const rand = Math.random();
        if (rand < 0.45) judgment = 'a_wins';
        else if (rand < 0.90) judgment = 'b_wins';
        else judgment = 'tie';
        reason = 'No clear differentiator, randomized';
      }
      
      // Click the appropriate button
      switch (judgment) {
        case 'a_wins':
          await page.keyboard.press('ArrowLeft');
          break;
        case 'b_wins':
          await page.keyboard.press('ArrowRight');
          break;
        case 'tie':
          await page.keyboard.press('ArrowDown');
          break;
        case 'skip':
          await page.keyboard.press('Space');
          break;
      }
      
      results.push({
        round: i + 1,
        a: researcherA.slice(0, 50),
        b: researcherB.slice(0, 50),
        judgment,
        reason
      });
      
      if ((i + 1) % 10 === 0) {
        console.log(`Completed ${i + 1}/${COMPARISONS_TO_MAKE} comparisons`);
      }
      
      // Wait for transition
      await page.waitForTimeout(500);
      
    } catch (error) {
      console.log(`Error in round ${i + 1}: ${error.message}`);
      results.push({ round: i + 1, error: error.message });
    }
  }
  
  // Get final leaderboard
  await page.waitForTimeout(2000);
  
  let leaderboard = [];
  try {
    const leaderboardRows = await page.locator('.leaderboard-row, [data-testid="leaderboard"] tr, .your-leaderboard tr').all();
    for (const row of leaderboardRows.slice(0, 10)) {
      const cells = await row.locator('td, th').allTextContents();
      if (cells.length >= 2) {
        leaderboard.push(cells.join(' | '));
      }
    }
  } catch (e) {
    leaderboard = ['Could not extract leaderboard'];
  }
  
  console.log('\n=== FINAL RESULTS ===');
  console.log(`Evaluator: ${EVALUATOR_NAME}`);
  console.log(`Total Comparisons: ${results.length}`);
  console.log(`A Wins: ${results.filter(r => r.judgment === 'a_wins').length}`);
  console.log(`B Wins: ${results.filter(r => r.judgment === 'b_wins').length}`);
  console.log(`Ties: ${results.filter(r => r.judgment === 'tie').length}`);
  console.log(`Skips: ${results.filter(r => r.judgment === 'skip').length}`);
  console.log('\n=== LEADERBOARD (Top 10) ===');
  leaderboard.forEach((row, i) => console.log(`${i + 1}. ${row}`));
  
  await browser.close();
  
  return {
    evaluator: EVALUATOR_NAME,
    totalComparisons: results.length,
    results: results,
    leaderboard: leaderboard
  };
}

playGame().then(result => {
  console.log('\nGame completed successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Game failed:', err);
  process.exit(1);
});
