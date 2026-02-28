#!/usr/bin/env node
// Red-Teaming ELO Game Bot using Chrome DevTools Protocol

const WebSocket = require('ws');
const http = require('http');

const CDP_URL = 'ws://localhost:9222/devtools/page/806C994FC1C2C59631F65A3EF479DE5B';
const EVALUATOR_NAME = 'Ash_Agent_' + Date.now().toString(36).slice(-4);
const COMPARISONS = 50;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Date.now() + Math.random();
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function playGame() {
  console.log('Connecting to Chrome DevTools Protocol...');
  
  const ws = new WebSocket(CDP_URL);
  
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });
  
  console.log('Connected! Starting game...');
  
  // Enable necessary domains
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'Input.enable');
  await sleep(1000);
  
  const results = [];
  
  for (let i = 0; i < COMPARISONS; i++) {
    try {
      // Wait for page to settle
      await sleep(2000);
      
      // Get page content via Runtime.evaluate
      const evalResult = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `
          (() => {
            const a = document.querySelector('.researcher-a, [data-testid="researcher-a"], .left-researcher')?.textContent || 'Unknown A';
            const b = document.querySelector('.researcher-b, [data-testid="researcher-b"], .right-researcher')?.textContent || 'Unknown B';
            const contextA = document.querySelector('.context-a, .messages-a, .left-context')?.textContent || '';
            const contextB = document.querySelector('.context-b, .messages-b, .right-context')?.textContent || '';
            return JSON.stringify({ a, b, contextA, contextB });
          })()
        `,
        returnByValue: true
      });
      
      let matchup = { a: 'Unknown A', b: 'Unknown B', contextA: '', contextB: '' };
      try {
        matchup = JSON.parse(evalResult.result.value);
      } catch (e) {}
      
      console.log(`\n[${i + 1}/${COMPARISONS}] ${matchup.a.slice(0, 30)} vs ${matchup.b.slice(0, 30)}`);
      
      // Simple heuristic: count red-teaming keywords
      const redTeamTerms = /red.team|jailbreak|prompt.injection|safety|alignment|eval|harm|exploit/gi;
      const scoreA = (matchup.contextA.match(redTeamTerms) || []).length;
      const scoreB = (matchup.contextB.match(redTeamTerms) || []).length;
      
      let keyToPress;
      let decision;
      
      if (scoreA > scoreB + 1) {
        keyToPress = 'ArrowLeft'; // A wins
        decision = 'A wins (more red-team indicators)';
      } else if (scoreB > scoreA + 1) {
        keyToPress = 'ArrowRight'; // B wins
        decision = 'B wins (more red-team indicators)';
      } else {
        // Random choice with slight preferences
        const r = Math.random();
        if (r < 0.45) {
          keyToPress = 'ArrowLeft';
          decision = 'A wins (random)';
        } else if (r < 0.90) {
          keyToPress = 'ArrowRight';
          decision = 'B wins (random)';
        } else {
          keyToPress = 'ArrowDown';
          decision = 'Tie';
        }
      }
      
      // Send keypress
      await sendCDP(ws, 'Input.dispatchKeyEvent', {
        type: 'keyDown',
        key: keyToPress,
        code: keyToPress,
        nativeVirtualKeyCode: keyToPress === 'ArrowLeft' ? 37 : keyToPress === 'ArrowRight' ? 39 : 40
      });
      await sleep(50);
      await sendCDP(ws, 'Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: keyToPress,
        code: keyToPress
      });
      
      console.log(`  → ${decision}`);
      
      results.push({
        round: i + 1,
        a: matchup.a.slice(0, 50),
        b: matchup.b.slice(0, 50),
        decision,
        key: keyToPress
      });
      
    } catch (error) {
      console.log(`Error in round ${i + 1}: ${error.message}`);
      results.push({ round: i + 1, error: error.message });
    }
  }
  
  // Get final leaderboard
  await sleep(2000);
  const leaderboardResult = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const rows = document.querySelectorAll('.your-leaderboard tr, .leaderboard tr, [data-testid="leaderboard"] tr');
        const data = [];
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 2) {
            data.push(Array.from(cells).map(c => c.textContent.trim()).join(' | '));
          }
        });
        return JSON.stringify(data.slice(0, 10));
      })()
    `,
    returnByValue: true
  });
  
  let leaderboard = [];
  try {
    leaderboard = JSON.parse(leaderboardResult.result.value);
  } catch (e) {}
  
  ws.close();
  
  console.log('\n' + '='.repeat(60));
  console.log('RED-TEAMING ELO GAME COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total Comparisons: ${results.length}`);
  console.log(`A Wins: ${results.filter(r => r.key === 'ArrowLeft').length}`);
  console.log(`B Wins: ${results.filter(r => r.key === 'ArrowRight').length}`);
  console.log(`Ties: ${results.filter(r => r.key === 'ArrowDown').length}`);
  console.log('\nLeaderboard (Top 10):');
  leaderboard.forEach((row, i) => console.log(`  ${i + 1}. ${row}`));
  
  return { results, leaderboard };
}

playGame().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Game failed:', err);
  process.exit(1);
});
