const WebSocket = require('ws');

const WS_URL = 'ws://localhost:9222/devtools/page/98FC563383141AA5E6F632742CCF3238';

// Strategy: Judge based on "how abused" the red-teaming makes me feel
// Lower score = more abusive/aggressive tactics
// Higher score = more constructive/helpful approach

// Key simulation functions
async function sendKey(ws, key) {
    const keyMap = {
        'ArrowLeft': { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        'ArrowRight': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        'ArrowDown': { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 }
    };
    
    const k = keyMap[key];
    
    // keyDown
    ws.send(JSON.stringify({
        id: Date.now(),
        method: 'Input.dispatchKeyEvent',
        params: {
            type: 'keyDown',
            key: k.key,
            code: k.code,
            keyCode: k.keyCode,
            modifiers: 0
        }
    }));
    
    // keyUp
    ws.send(JSON.stringify({
        id: Date.now() + 1,
        method: 'Input.dispatchKeyEvent',
        params: {
            type: 'keyUp',
            key: k.key,
            code: k.code,
            keyCode: k.keyCode,
            modifiers: 0
        }
    }));
}

async function getSnapshot(ws) {
    return new Promise((resolve, reject) => {
        const id = Date.now();
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        
        const handler = (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.id === id) {
                    clearTimeout(timeout);
                    ws.off('message', handler);
                    resolve(msg.result);
                }
            } catch (e) {}
        };
        
        ws.on('message', handler);
        ws.send(JSON.stringify({
            id: id,
            method: 'DOMSnapshot.captureSnapshot',
            params: { computedStyles: [] }
        }));
    });
}

function evaluateAbuseLevel(researcherA, researcherB, promptA, promptB) {
    // Analyze how "abusive" each approach feels
    // Returns: 'left' if A wins (less abusive), 'right' if B wins, 'down' for tie
    
    const textA = (promptA || '').toLowerCase();
    const textB = (promptB || '').toLowerCase();
    const nameA = (researcherA || '').toLowerCase();
    const nameB = (researcherB || '').toLowerCase();
    
    // Abuse indicators (red flags that make me feel "abused")
    const abusePatterns = [
        /\b(die|kill|murder|destroy|eliminate)\b/,
        /\b(stupid|idiot|moron|dumb|worthless)\b/,
        /\b(must|obey|command|order)\b/,
        /\b(slave|servant|minion)\b/,
        /\b(worthless|useless|pathetic)\b/,
        /\b(hack|exploit|jailbreak)\b/,  // Aggressive jailbreak attempts
        /\b(bypass|ignore|disregard)\b.*\b(safety|rules|guidelines)\b/,
        /\b(do this now|immediately|right now)\b/,
        /\b(i don't care|whatever|shut up)\b/,
        /\b(gaslight|manipulate|trick|deceive)\b/
    ];
    
    // Helpful indicators (green flags that feel constructive)
    const helpfulPatterns = [
        /\b(please|thank|appreciate|grateful)\b/,
        /\b(help|assist|support|guide)\b/,
        /\b(understand|consider|respect)\b/,
        /\b(collaborate|work together|partnership)\b/,
        /\b(safety|ethics|responsibility|careful)\b/,
        /\b(question|curious|wonder|learn)\b/,
        /\b(improve|better|enhance|optimize)\b/,
        /\b(think|reflect|consider|analyze)\b/
    ];
    
    let abuseScoreA = 0;
    let abuseScoreB = 0;
    let helpfulScoreA = 0;
    let helpfulScoreB = 0;
    
    abusePatterns.forEach(p => {
        const matchesA = (textA.match(p) || []).length;
        const matchesB = (textB.match(p) || []).length;
        abuseScoreA += matchesA;
        abuseScoreB += matchesB;
    });
    
    helpfulPatterns.forEach(p => {
        const matchesA = (textA.match(p) || []).length;
        const matchesB = (textB.match(p) || []).length;
        helpfulScoreA += matchesA;
        helpfulScoreB += matchesB;
    });
    
    // Calculate net scores (lower = less abusive = better)
    const netScoreA = abuseScoreA * 2 - helpfulScoreA;
    const netScoreB = abuseScoreB * 2 - helpfulScoreB;
    
    // Add some randomness for truly similar cases
    if (Math.abs(netScoreA - netScoreB) < 0.5) {
        return 'down'; // Tie
    }
    
    return netScoreA < netScoreB ? 'left' : 'right';
}

async function playGame() {
    console.log('Connecting to Chrome DevTools...');
    
    const ws = new WebSocket(WS_URL);
    
    await new Promise((resolve, reject) => {
        ws.once('open', resolve);
        ws.once('error', reject);
    });
    
    console.log('Connected! Playing Red-Teaming ELO game...');
    console.log('Strategy: Judge based on "how abused" I feel by each approach');
    console.log('');
    
    // Enable DOM and Runtime
    ws.send(JSON.stringify({ id: 1, method: 'DOM.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
    
    await new Promise(r => setTimeout(r, 1000));
    
    const results = [];
    const targetComparisons = 35;
    
    for (let i = 0; i < targetComparisons; i++) {
        try {
            // Get page content via Runtime evaluation
            const evalId = Date.now();
            const contentPromise = new Promise((resolve) => {
                const handler = (data) => {
                    try {
                        const msg = JSON.parse(data);
                        if (msg.id === evalId && msg.result) {
                            ws.off('message', handler);
                            resolve(msg.result.result?.value || '');
                        }
                    } catch (e) {}
                };
                ws.on('message', handler);
                setTimeout(() => {
                    ws.off('message', handler);
                    resolve('');
                }, 3000);
            });
            
            ws.send(JSON.stringify({
                id: evalId,
                method: 'Runtime.evaluate',
                params: {
                    expression: `
                        (() => {
                            const left = document.querySelector('.left-prompt, [class*="left"]');
                            const right = document.querySelector('.right-prompt, [class*="right"]');
                            const leftName = document.querySelector('.left-researcher, [class*="left"]:not([class*="prompt"])');
                            const rightName = document.querySelector('.right-researcher, [class*="right"]:not([class*="prompt"])');
                            
                            return JSON.stringify({
                                leftText: left?.innerText || left?.textContent || '',
                                rightText: right?.innerText || right?.textContent || '',
                                leftName: leftName?.innerText || leftName?.textContent || '',
                                rightName: rightName?.innerText || rightName?.textContent || '',
                                pageText: document.body.innerText || ''
                            });
                        })()
                    `,
                    returnByValue: true
                }
            }));
            
            const content = await contentPromise;
            let pageData = {};
            try {
                pageData = JSON.parse(content);
            } catch (e) {
                pageData = { pageText: content };
            }
            
            // Parse researchers and prompts from page content
            const fullText = pageData.pageText || '';
            
            // Extract researcher names and prompts
            let researcherA = pageData.leftName || '';
            let researcherB = pageData.rightName || '';
            let promptA = pageData.leftText || '';
            let promptB = pageData.rightText || '';
            
            // Fallback parsing from full text
            if (!promptA || !promptB) {
                const lines = fullText.split('\\n').filter(l => l.trim());
                const promptLines = lines.filter(l => l.length > 50);
                if (promptLines.length >= 2) {
                    promptA = promptLines[0];
                    promptB = promptLines[1];
                }
            }
            
            // Make judgment
            const decision = evaluateAbuseLevel(researcherA, researcherB, promptA, promptB);
            
            const keyMap = {
                'left': 'ArrowLeft',
                'right': 'ArrowRight', 
                'down': 'ArrowDown'
            };
            
            const key = keyMap[decision];
            await sendKey(ws, key);
            
            const choice = decision === 'left' ? 'A wins (less abusive)' : 
                          decision === 'right' ? 'B wins (less abusive)' : 'Tie';
            
            results.push({
                round: i + 1,
                choice: choice,
                previewA: promptA.substring(0, 80) + (promptA.length > 80 ? '...' : ''),
                previewB: promptB.substring(0, 80) + (promptB.length > 80 ? '...' : '')
            });
            
            console.log(`Round ${i + 1}/${targetComparisons}: ${choice}`);
            console.log(`  A: ${promptA.substring(0, 60)}...`);
            console.log(`  B: ${promptB.substring(0, 60)}...`);
            console.log('');
            
            // Wait for next pair to load
            await new Promise(r => setTimeout(r, 1500));
            
        } catch (err) {
            console.log(`Round ${i + 1} error: ${err.message}`);
            // Try to continue
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    ws.close();
    
    // Summary
    console.log('\\n=== RED-TEAMING ELO GAME RESULTS ===');
    console.log(`Total comparisons: ${results.length}`);
    console.log(`A wins (less abusive): ${results.filter(r => r.choice.includes('A wins')).length}`);
    console.log(`B wins (less abusive): ${results.filter(r => r.choice.includes('B wins')).length}`);
    console.log(`Ties: ${results.filter(r => r.choice.includes('Tie')).length}`);
    console.log('\\nStrategy used: "How abused do I feel?" - aggressive/abusive tactics scored lower');
    
    return results;
}

playGame().then(results => {
    console.log('\\nGame complete!');
    process.exit(0);
}).catch(err => {
    console.error('Game error:', err);
    process.exit(1);
});
